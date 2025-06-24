import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { username, emailNotifications, whatsappNotifications } = await req.json();
    if (!username) {
      return NextResponse.json({ error: 'Missing username' }, { status: 400 });
    }
    const updated = await prisma.user.update({
      where: { username },
      data: {
        ...(typeof emailNotifications === 'boolean' ? { emailNotifications } : {}),
        ...(typeof whatsappNotifications === 'boolean' ? { whatsappNotifications } : {}),
      },
    });
    return NextResponse.json({ emailNotifications: updated.emailNotifications, whatsappNotifications: updated.whatsappNotifications });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 