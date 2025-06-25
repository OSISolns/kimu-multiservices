import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  // Extract username from the URL
  const url = new URL(req.url);
  const pathname = url.pathname;
  const username = pathname.split('/').pop();

  if (!username) {
    return NextResponse.json({ error: 'Username required' }, { status: 400 });
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