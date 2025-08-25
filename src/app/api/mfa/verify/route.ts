import { NextRequest, NextResponse } from 'next/server';
import speakeasy from 'speakeasy';
import { prisma } from '@/lib/prisma';
import { issueMfaTrustToken, normalizeIpAddress } from '@/lib/mfa';

// TOTP verification function
async function verifyTotp(userId: string, code: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({ 
      where: { id: parseInt(userId) }
    });
    
    if (!user || !user.totpSecret) {
      return false;
    }
    
    // Validate code format
    if (!/^\d{6}$/.test(code)) {
      return false;
    }
    
    // Try verification with a larger time window to account for clock drift
    const valid = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: 'base32',
      token: code,
      window: 5, // Allow 5 time steps (150 seconds) before and after current time
    });
    
    return valid;
  } catch (error) {
    console.error('TOTP verification error:', error);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, totp, trustDevice = false } = body;

    if (!userId || !totp) {
      return NextResponse.json({ 
        ok: false, 
        error: 'User ID and TOTP code are required' 
      }, { status: 400 });
    }

    // Verify the TOTP code
    const ok = await verifyTotp(userId, totp);
    if (!ok) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Invalid TOTP code' 
      }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });

    // If user wants to trust this device, issue MFA trust token
    if (trustDevice) {
      const ua = req.headers.get('user-agent') || '';
      const forwardedFor = req.headers.get('x-forwarded-for');
      const ip = forwardedFor 
        ? forwardedFor.split(',')[0]?.trim() 
        : '';

      // Normalize IP to /24 subnet for mobile networks
      const normalizedIp = normalizeIpAddress(ip);

      const { token, maxAgeSec, jti } = await issueMfaTrustToken({ 
        userId, 
        userAgent: ua, 
        ip: normalizedIp 
      });

      // Store the JTI in database for revocation capability
      try {
        const user = await prisma.user.findUnique({ 
          where: { id: parseInt(userId) }
        });

        if (user) {
          // Create a trusted device record with the JTI for revocation
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
        }
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

      console.log(`MFA trust token issued for user ${userId}, expires in ${maxAgeSec} seconds`);
    }

    return res;
  } catch (error) {
    console.error('MFA verification error:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Server error during verification' 
    }, { status: 500 });
  }
}
