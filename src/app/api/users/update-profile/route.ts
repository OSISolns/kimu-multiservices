import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, fullName, email, phone, department, emailNotifications, whatsappNotifications } = body;

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Update the user in the database
    const updatedUser = await prisma.user.update({
      where: { username },
      data: {
        ...(fullName !== undefined && { fullName }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(department !== undefined && { department }),
        ...(emailNotifications !== undefined && { emailNotifications }),
        ...(whatsappNotifications !== undefined && { whatsappNotifications })
      }
    });
    
    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        username: updatedUser.username,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        department: updatedUser.department,
        emailNotifications: updatedUser.emailNotifications,
        whatsappNotifications: updatedUser.whatsappNotifications
      }
    });
    
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
