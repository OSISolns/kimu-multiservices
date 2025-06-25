import { NextRequest } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const segments = url.pathname.split('/');
  const username = segments[segments.indexOf('agent') + 1];

  if (!username) {
    return new Response('Username not provided', { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return new Response('User not found', { status: 404 });
  }

  return new Response(JSON.stringify({
    username: user.username,
    email: user.email,
    totpSecret: user.totpSecret ?? null,
  }), {
    headers: {
      'Content-Type': 'application/json',
    },
    status: 200,
  });
} 