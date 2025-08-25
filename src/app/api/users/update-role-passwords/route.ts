import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

function hasRole(user: any, allowedRoles: string[]) {
  return allowedRoles.includes(user.role);
}

export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    const adminUsername = req.headers.get('x-username');
    const admin = adminUsername ? await prisma.user.findUnique({ where: { username: adminUsername } }) : null;
    
    if (!admin || !hasRole(admin, ['admin'])) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { password, roles } = await req.json();

    if (!password || !roles || !Array.isArray(roles)) {
      return NextResponse.json({ 
        error: 'Password and roles array are required' 
      }, { status: 400 });
    }

    // Validate roles
    const validRoles = ['accountant', 'transport-officer', 'staff', 'admin', 'manager', 'driver', 'customer-service', 'operations'];
    const invalidRoles = roles.filter(role => !validRoles.includes(role));
    
    if (invalidRoles.length > 0) {
      return NextResponse.json({ 
        error: `Invalid roles: ${invalidRoles.join(', ')}` 
      }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Find users with specified roles
    const usersToUpdate = await prisma.user.findMany({
      where: {
        role: {
          in: roles
        }
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true
      }
    });

    if (usersToUpdate.length === 0) {
      return NextResponse.json({ 
        success: true,
        message: `No users found with roles: ${roles.join(', ')}`,
        usersUpdated: []
      });
    }

    // Update passwords for all found users
    const updateResult = await prisma.user.updateMany({
      where: {
        role: {
          in: roles
        }
      },
      data: {
        passwordHash: hashedPassword
      }
    });

    // Log the operation
    console.log(`Admin ${adminUsername} updated passwords for ${updateResult.count} users with roles: ${roles.join(', ')}`);

    return NextResponse.json({
      success: true,
      message: `Successfully updated passwords for ${updateResult.count} users`,
      usersUpdated: usersToUpdate.map(user => ({
        username: user.username,
        fullName: user.fullName,
        role: user.role
      })),
      updatedCount: updateResult.count
    });

  } catch (error) {
    console.error('Role password update error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

