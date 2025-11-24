import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { username, currentPassword, newPassword } = await req.json();
    if (!username || !currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !user.passwordHash || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }
    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { username },
      data: { passwordHash: newHash },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 