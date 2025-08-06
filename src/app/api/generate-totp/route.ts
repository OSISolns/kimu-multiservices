import { NextRequest, NextResponse } from 'next/server';
import speakeasy from 'speakeasy';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();
    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }
    
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !user.totpSecret) {
      return NextResponse.json({ error: 'User or TOTP secret not found' }, { status: 400 });
    }
    
    // Generate current TOTP code
    const token = speakeasy.totp({
      secret: user.totpSecret,
      encoding: 'base32',
    });
    
    return NextResponse.json({ 
      username: user.username,
      currentCode: token,
      secret: user.totpSecret,
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    console.error('TOTP generation error:', e);
    return NextResponse.json({ error: 'Server error during generation' }, { status: 500 });
  }
} 