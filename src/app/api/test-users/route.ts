import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true
      }
    });
    return NextResponse.json({ users });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 