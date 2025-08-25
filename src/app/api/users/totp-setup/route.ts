import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import speakeasy from 'speakeasy';

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
    
    // Generate a new TOTP secret
    const secret = speakeasy.generateSecret({ 
      length: 20, 
      name: `KIMU:${username}`, 
      issuer: 'KIMU Transport',
      encoding: 'base32'
    });
    
    // Update the user with the new secret
    await prisma.user.update({ 
      where: { username }, 
      data: { totpSecret: secret.base32 } 
    });
    
    // Generate the otpauth URL for QR code
    const otpauth_url = `otpauth://totp/KIMU%20Transport:${encodeURIComponent(username)}?secret=${secret.base32}&issuer=KIMU%20Transport`;
    
    console.log(`TOTP secret regenerated for ${username}`);
    
    return NextResponse.json({ 
      secret: secret.base32, 
      otpauth_url,
      message: 'TOTP secret has been reset. Please scan the new QR code with your authenticator app.'
    });
  } catch (e) {
    console.error('TOTP setup error:', e);
    return NextResponse.json({ error: 'Server error during TOTP setup' }, { status: 500 });
  }
} 