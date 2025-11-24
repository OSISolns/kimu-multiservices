import { NextRequest, NextResponse } from 'next/server';
import { prisma, retryDatabaseOperation } from '@/lib/prisma';
import { createToken, setAuthCookie } from '@/lib/jwt';
import { logActivity, logError } from '@/lib/logger';
import { UserRole } from '@/types/api';
import { issueMfaTrustToken, normalizeIpAddress } from '@/lib/mfa';

export async function POST(req: NextRequest) {
  try {
    const { code, username, trustDevice = false } = await req.json();
    if (!code || typeof code !== 'string' || !username || typeof username !== 'string') {
      return NextResponse.json({ valid: false, error: 'Missing code or username' }, { status: 400 });
    }

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ valid: false, error: 'Invalid code format. Please enter a 6-digit number.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !user.email2faCode || !user.email2faExpires) {
      return NextResponse.json({ valid: false, error: 'Invalid or expired code' }, { status: 400 });
    }

    // Check expiration
    if (new Date() > user.email2faExpires) {
      return NextResponse.json({ valid: false, error: 'Code expired' }, { status: 400 });
    }

    // Check code
    if (user.email2faCode !== code) {
      return NextResponse.json({ valid: false, error: 'Invalid code' }, { status: 400 });
    }

    // Clear code
    await retryDatabaseOperation(async () => {
      return await prisma.user.update({
        where: { id: user.id },
        data: { email2faCode: null, email2faExpires: null }
      });
    });

    // Create JWT token
    const token = await createToken({
      userId: user.id.toString(),
      username: user.username,
      role: user.role as UserRole,
    });

    // Log successful login
    try {
      await logActivity(
        user.id,
        'LOGIN',
        `User ${user.username} logged in successfully (via Email 2FA)`,
        {
          ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
          userAgent: req.headers.get('user-agent') || 'unknown'
        }
      );
    } catch (logError) {
      console.error('Failed to log activity:', logError);
    }

    const response = NextResponse.json({
      success: true,
      valid: true,
      staff: {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        department: user.department,
        status: user.status,
        profilePicture: user.profilePicture,
        lastLogin: user.lastLogin,
        emailNotifications: user.emailNotifications,
        whatsappNotifications: user.whatsappNotifications
      }
    });

    // Set HTTP-only cookie
    response.headers.set('Set-Cookie', setAuthCookie(token)['Set-Cookie']);

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

        const { token: trustToken, maxAgeSec, jti } = await issueMfaTrustToken({
          userId: user.id.toString(),
          userAgent: ua,
          ip: normalizedIp,
          maxAgeSec: 30 * 24 * 60 * 60 // 30 days in seconds
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
        }

        response.cookies.set('mfa_trust', trustToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: maxAgeSec, // 30 days
        });

      } catch (trustError) {
        console.error('Error issuing MFA trust token:', trustError);
      }
    }

    return response;
  } catch (e) {
    console.error('2FA verification error:', e);
    return NextResponse.json({ valid: false, error: 'Server error during verification' }, { status: 500 });
  }
}