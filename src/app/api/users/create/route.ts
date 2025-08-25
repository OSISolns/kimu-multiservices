import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';

export async function POST(req: NextRequest) {
  try {
    const adminUsername = req.headers.get('x-username');
    const admin = adminUsername ? await prisma.user.findUnique({ where: { username: adminUsername } }) : null;
    
    if (!admin || !['admin', 'tofficer'].includes(admin.role)) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { username, password, role, fullName } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Missing username or password' }, { status: 400 });
    }
    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const totpSecret = speakeasy.generateSecret({ length: 20, name: `KIMU:${username}`, issuer: 'KIMU' }).base32;
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
        role: role || 'staff',
        fullName,
        totpSecret,
      },
    });
    return NextResponse.json({ success: true, user: { username: user.username, role: user.role, totpSecret: user.totpSecret } });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 