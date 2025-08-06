import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Add a reusable role-checking utility
function hasRole(user: any, allowedRoles: string[]) {
  return allowedRoles.includes(user.role);
}

export async function GET(req: NextRequest) {
  try {
    // Extract user from session or headers (placeholder)
    const username = req.headers.get('x-username');
    const user = username ? await prisma.user.findUnique({ where: { username } }) : null;
    if (!user || !hasRole(user, ['admin'])) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    const users = await prisma.user.findMany({
      select: { id: true, username: true, fullName: true, role: true, createdAt: true, totpSecret: true, emailNotifications: true, whatsappNotifications: true },
      orderBy: { username: 'asc' },
    });
    return NextResponse.json({ users });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const username = req.headers.get('x-username');
    const user = username ? await prisma.user.findUnique({ where: { username } }) : null;
    if (!user || !hasRole(user, ['admin'])) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    const { username: newUsername, password, role } = await req.json();
    if (!newUsername || !password || !role) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { username: newUsername, passwordHash, role },
    });
    return NextResponse.json(newUser);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const username = req.headers.get('x-username');
    const user = username ? await prisma.user.findUnique({ where: { username } }) : null;
    if (!user || !hasRole(user, ['admin'])) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    const { id, username: updateUsername, password, role } = await req.json();
    if (!id || !updateUsername || !role) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    let data: any = { username: updateUsername, role };
    if (password) {
      data.passwordHash = await bcrypt.hash(password, 10);
    }
    const updatedUser = await prisma.user.update({
      where: { id },
      data,
    });
    return NextResponse.json(updatedUser);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const username = req.headers.get('x-username');
    const user = username ? await prisma.user.findUnique({ where: { username } }) : null;
    if (!user || !hasRole(user, ['admin'])) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
    }
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
} 