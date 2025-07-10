import { NextRequest, NextResponse } from 'next/server';
import speakeasy from 'speakeasy';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { code, username } = await req.json();
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
      window: 2, // Allow 2 time steps (60 seconds) before and after current time
    });
    
    // Log for debugging (remove in production)
    console.log(`TOTP verification for ${username}: ${valid ? 'SUCCESS' : 'FAILED'}`);
    
    return NextResponse.json({ valid });
  } catch (e) {
    console.error('TOTP verification error:', e);
    return NextResponse.json({ valid: false, error: 'Server error during verification' }, { status: 500 });
  }
} 