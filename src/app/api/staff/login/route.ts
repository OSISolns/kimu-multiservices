import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import bcrypt from 'bcryptjs';
import { logActivity, ActivityActions, getIpAddress, getUserAgent } from '../../../services/activityLog';

const prisma = new PrismaClient();

// Add a reusable role-checking utility
function hasRole(user: any, allowedRoles: string[]) {
  return allowedRoles.includes(user.role);
}

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Missing username or password' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
    }
    // Only allow staff, admin, transport-officer, or accountant
    if (!hasRole(user, ['staff', 'admin', 'transport-officer', 'accountant'])) {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 403 });
    }
    return NextResponse.json({ username: user.username, totpSecret: user.totpSecret, role: user.role });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 