import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  // Extract username from the URL
  const { pathname } = new URL(req.url);
  const segments = pathname.split('/');
  const username = segments[segments.indexOf('agent') + 1];

  if (!username) {
    return NextResponse.json({ error: 'Username not provided' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    username: user.username,
    totpSecret: user.totpSecret ?? null,
  });
} 