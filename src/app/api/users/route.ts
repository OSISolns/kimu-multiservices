import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Add a reusable role-checking utility
function hasRole(user: any, allowedRoles: string[]) {
  return allowedRoles.includes(user.role);
}

export async function GET(req: NextRequest) {
  try {
    // Extract user from session or headers (placeholder)
    const username = req.headers.get('x-username');
    console.log('API /users: Received username:', username);
    const user = username ? await prisma.user.findUnique({ where: { username } }) : null;
    console.log('API /users: Found user:', user ? { username: user.username, role: user.role } : null);
    if (!user || !hasRole(user, ['admin', 'manager', 'accountant'])) {
      console.log('API /users: Not authorized', { hasUser: !!user, role: user?.role });
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        department: true,
        status: true,
        createdAt: true,
        lastLogin: true,
        totpSecret: true,
        emailNotifications: true,
        whatsappNotifications: true
      },
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
    if (!user || !hasRole(user, ['admin', 'accountant'])) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    const { username: newUsername, password, role, fullName, email, phone, department } = await req.json();
    if (!newUsername || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        username: newUsername,
        passwordHash,
        role,
        fullName,
        email,
        phone,
        department,
        status: 'active'
      },
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
    if (!user || !hasRole(user, ['admin', 'accountant'])) {
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
    const adminUsername = req.headers.get('x-username');
    const admin = adminUsername ? await prisma.user.findUnique({ where: { username: adminUsername } }) : null;
    if (!admin || !hasRole(admin, ['admin', 'accountant'])) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { username } = await req.json();
    if (!username) {
      return NextResponse.json({ error: 'Missing username' }, { status: 400 });
    }

    // Find the user to delete
    const userToDelete = await prisma.user.findUnique({ where: { username } });
    if (!userToDelete) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent deletion of admin and accountant users
    if (userToDelete.role === 'admin' || userToDelete.role === 'accountant') {
      return NextResponse.json({
        error: 'Cannot delete admin or accountant users'
      }, { status: 403 });
    }

    // Prevent self-deletion
    if (userToDelete.username === adminUsername) {
      return NextResponse.json({
        error: 'Cannot delete your own account'
      }, { status: 403 });
    }

    await prisma.user.delete({ where: { username } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Error deleting user:', e);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  console.log('PATCH /api/users called');
  try {
    const adminUsername = req.headers.get('x-username');
    console.log('Admin username:', adminUsername);
    const admin = adminUsername ? await prisma.user.findUnique({ where: { username: adminUsername } }) : null;
    console.log('Admin found:', !!admin);
    if (!admin || !hasRole(admin, ['admin', 'accountant'])) {
      console.log('Not authorized');
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const body = await req.json();
    console.log('Request body:', body);
    const { username, fullName, email, phone, role, department, status } = body;

    if (!username) {
      console.log('Missing username');
      return NextResponse.json({ error: 'Missing username' }, { status: 400 });
    }

    // Find the user to update
    const userToUpdate = await prisma.user.findUnique({ where: { username } });
    if (!userToUpdate) {
      console.log('User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prepare update data
    const dataToUpdate: any = {};

    if (fullName !== undefined) dataToUpdate.fullName = fullName;
    if (email !== undefined) dataToUpdate.email = email;
    if (phone !== undefined) dataToUpdate.phone = phone;
    if (role !== undefined) dataToUpdate.role = role;
    if (department !== undefined) dataToUpdate.department = department;
    if (status !== undefined) dataToUpdate.status = status;

    // Update the user
    const updated = await prisma.user.update({
      where: { username },
      data: dataToUpdate,
    });

    console.log('User updated successfully');
    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        username: updated.username,
        fullName: updated.fullName,
        email: updated.email,
        phone: updated.phone,
        role: updated.role,
        department: updated.department,
        status: updated.status
      }
    });
  } catch (e) {
    console.error('Error updating user:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 