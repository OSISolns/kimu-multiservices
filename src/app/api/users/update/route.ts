import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';

// Add a reusable role-checking utility
function hasRole(user: any, allowedRoles: string[]) {
  return allowedRoles.includes(user.role);
}

export async function PATCH(req: NextRequest) {
  console.log('PATCH /api/users/update called');
  try {
    const adminUsername = req.headers.get('x-username');
    console.log('Admin username:', adminUsername);
    const admin = adminUsername ? await prisma.user.findUnique({ where: { username: adminUsername } }) : null;
    console.log('Admin found:', !!admin);
    if (!admin || !hasRole(admin, ['admin'])) {
      console.log('Not authorized');
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const body = await req.json();
    console.log('Request body:', body);
    const { username, newUsername, fullName, email, phone, role, department, status, password } = body;
    
    if (!username) {
      console.log('Missing username');
      return NextResponse.json({ error: 'Missing username' }, { status: 400 });
    }

    // Find the user to update
    const userToUpdate = await prisma.user.findUnique({ where: { username } });
    if (!userToUpdate) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Prepare update data
    const dataToUpdate: any = {};
    
    // Check if new username is provided and different from current
    if (newUsername && newUsername !== username) {
      // Check if new username already exists
      const existingUser = await prisma.user.findUnique({ where: { username: newUsername } });
      if (existingUser) {
        return NextResponse.json({ error: 'New username already exists' }, { status: 409 });
      }
      dataToUpdate.username = newUsername;
    }
    
    if (fullName !== undefined) dataToUpdate.fullName = fullName;
    if (email !== undefined) dataToUpdate.email = email;
    if (phone !== undefined) dataToUpdate.phone = phone;
    if (role !== undefined) dataToUpdate.role = role;
    if (department !== undefined) dataToUpdate.department = department;
    if (status !== undefined) dataToUpdate.status = status;
    
    // Handle password update if provided
    if (password && password.trim() !== '') {
      const passwordHash = await bcrypt.hash(password, 10);
      dataToUpdate.passwordHash = passwordHash;
    }

    // Update the user
    const updated = await prisma.user.update({
      where: { username },
      data: dataToUpdate,
    });

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