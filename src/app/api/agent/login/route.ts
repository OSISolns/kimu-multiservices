import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import bcrypt from 'bcryptjs';
import { logActivity, ActivityActions, getIpAddress, getUserAgent } from '../../../services/activityLog';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Missing username or password' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { username } });
    // Passwords must be hashed in the database for this to work
    if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      // Log failed login attempt
      await logActivity({
        action: ActivityActions.LOGIN_FAILED,
        details: { username, reason: 'Invalid credentials' },
        ipAddress: getIpAddress(req),
        userAgent: getUserAgent(req)
      });
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }
    
    // Log successful login
    await logActivity({
      userId: user.id,
      action: ActivityActions.LOGIN,
      details: { username: user.username },
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req)
    });
    
    // Only return necessary fields
    return NextResponse.json({ username: user.username, totpSecret: user.totpSecret });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 