import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const adminUsername = req.headers.get('x-username');
    const admin = adminUsername ? await prisma.user.findUnique({ where: { username: adminUsername } }) : null;
    
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { username } = await req.json();
    if (!username) {
      return NextResponse.json({ error: 'Missing username' }, { status: 400 });
    }
    
    await prisma.user.delete({ where: { username } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 