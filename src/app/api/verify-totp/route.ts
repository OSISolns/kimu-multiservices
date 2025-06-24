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
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !user.totpSecret) {
      return NextResponse.json({ valid: false, error: 'User or TOTP secret not found' }, { status: 400 });
    }
    const valid = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: 'base32',
      token: code,
      window: 1,
    });
    return NextResponse.json({ valid });
  } catch (e) {
    return NextResponse.json({ valid: false, error: 'Server error' }, { status: 500 });
  }
} 