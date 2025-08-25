import { NextRequest, NextResponse } from 'next/server';
import speakeasy from 'speakeasy';
import { prisma } from '@/lib/prisma';
import { issueMfaTrustToken, normalizeIpAddress } from '@/lib/mfa';

export async function POST(req: NextRequest) {
  try {
    const { code, username, trustDevice = false } = await req.json();
    if (!code || typeof code !== 'string' || !username || typeof username !== 'string') {
      return NextResponse.json({ valid: false, error: 'Missing code or username' }, { status: 400 });
    }
    
    // Validate code format
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ valid: false, error: 'Invalid code format. Please enter a 6-digit number.' }, { status: 400 });
    }
    
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !user.totpSecret) {
      return NextResponse.json({ valid: false, error: 'User or TOTP secret not found' }, { status: 400 });
    }
    
    // Try verification with a larger time window to account for clock drift
    const valid = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: 'base32',
      token: code,
      window: 5, // Allow 5 time steps (150 seconds) before and after current time
    });
    
    // Log for debugging (remove in production)
    console.log(`TOTP verification for ${username}: ${valid ? 'SUCCESS' : 'FAILED'}`);
    console.log(`Secret: ${user.totpSecret}`);
    console.log(`Code provided: ${code}`);
    console.log(`Current time: ${new Date().toISOString()}`);
    
    if (!valid) {
      return NextResponse.json({ valid: false });
    }

    const res = NextResponse.json({ valid: true });

    // If user wants to trust this device, issue MFA trust token
    if (trustDevice) {
      try {
        const ua = req.headers.get('user-agent') || '';
        const forwardedFor = req.headers.get('x-forwarded-for');
        const ip = forwardedFor 
          ? forwardedFor.split(',')[0]?.trim() 
          : '';

        // Normalize IP to /24 subnet for mobile networks
        const normalizedIp = normalizeIpAddress(ip);

        const { token, maxAgeSec, jti } = await issueMfaTrustToken({ 
          userId: user.id.toString(), 
          userAgent: ua, 
          ip: normalizedIp 
        });

        // Store the JTI in database for revocation capability
        try {
          await prisma.trustedDevice.upsert({
            where: {
              userId_deviceId: {
                userId: user.id,
                deviceId: jti // Using JTI as device ID for this implementation
              }
            },
            create: {
              userId: user.id,
              deviceId: jti,
              deviceName: `Trusted Device (${new Date().toLocaleDateString()})`,
              userAgent: ua,
              ipAddress: ip,
              expiresAt: new Date(Date.now() + maxAgeSec * 1000)
            },
            update: {
              expiresAt: new Date(Date.now() + maxAgeSec * 1000),
              lastUsed: new Date(),
              userAgent: ua,
              ipAddress: ip
            }
          });
        } catch (dbError) {
          console.error('Error storing trusted device:', dbError);
          // Continue even if DB storage fails
        }

        res.cookies.set('mfa_trust', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: maxAgeSec, // 8 hours
        });

        console.log(`MFA trust token issued for user ${username}, expires in ${maxAgeSec} seconds`);
      } catch (trustError) {
        console.error('Error issuing MFA trust token:', trustError);
        // Continue with normal response even if trust token fails
      }
    }
    
    return res;
  } catch (e) {
    console.error('TOTP verification error:', e);
    return NextResponse.json({ valid: false, error: 'Server error during verification' }, { status: 500 });
  }
} 