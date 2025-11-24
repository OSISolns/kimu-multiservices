import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Add a reusable role-checking utility
function hasRole(user: any, allowedRoles: string[]) {
  return allowedRoles.includes(user.role);
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication using the same pattern as other API routes
    const adminUsername = request.headers.get('x-username');
    const admin = adminUsername ? await prisma.user.findUnique({ where: { username: adminUsername } }) : null;
    if (!admin || !hasRole(admin, ['admin'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { username, newPassword } = await request.json();

    if (!username || !newPassword) {
      return NextResponse.json({ error: 'Username and new password are required' }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent admin from resetting other admin passwords
    if (user.role === 'admin' && adminUsername !== username) {
      return NextResponse.json({ error: 'Cannot reset other admin passwords' }, { status: 403 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update the user's password
    await prisma.user.update({
      where: { username },
      data: { passwordHash: hashedPassword }
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 