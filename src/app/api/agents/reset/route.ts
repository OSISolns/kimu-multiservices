import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();
    if (!username) {
      return NextResponse.json({ error: 'Missing username' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Only admin can reset agent data' }, { status: 403 });
    }
    await prisma.user.deleteMany({ where: { role: 'agent' } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 