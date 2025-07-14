import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { id, username, newUsername, newRole, newPassword } = await req.json();
    if (!id && !username) {
      return NextResponse.json({ error: 'Missing user identifier' }, { status: 400 });
    }
    if (!newUsername) {
      return NextResponse.json({ error: 'Missing new username' }, { status: 400 });
    }
    // Check if new username is taken (if changed)
    if ((username && username !== newUsername) || (id && newUsername)) {
      const existing = await prisma.user.findUnique({ where: { username: newUsername } });
      if (existing && (!username || existing.username !== username)) {
        return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
      }
    }
    // Fetch the user to check for TOTP secret
    const userRecord = await prisma.user.findUnique({ where: id ? { id } : { username } });
    let totpSecret = userRecord?.totpSecret;
    if (!totpSecret) {
      totpSecret = speakeasy.generateSecret({ length: 20, name: `KIMU:${newUsername}`, issuer: 'KIMU' }).base32;
    }
    const dataToUpdate: { username: string; role?: string; passwordHash?: string; totpSecret?: string } = {
      username: newUsername,
      ...(typeof totpSecret === 'string' ? { totpSecret } : {}),
    };
    if (newRole) dataToUpdate.role = newRole;
    if (newPassword) {
      dataToUpdate.passwordHash = await bcrypt.hash(newPassword, 10);
    }
    const updated = await prisma.user.update({
      where: id ? { id } : { username },
      data: dataToUpdate,
    });
    return NextResponse.json({ user: { id: updated.id, username: updated.username, role: updated.role, totpSecret: updated.totpSecret } });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 