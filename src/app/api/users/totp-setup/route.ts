import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import speakeasy from 'speakeasy';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();
    if (!username) {
      return NextResponse.json({ error: 'Missing username' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const secret = speakeasy.generateSecret({ length: 20, name: `KIMU:${username}`, issuer: 'KIMU' });
    await prisma.user.update({ where: { username }, data: { totpSecret: secret.base32 } });
    const otpauth_url = secret.otpauth_url;
    return NextResponse.json({ secret: secret.base32, otpauth_url });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 