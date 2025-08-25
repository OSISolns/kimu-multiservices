import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'profile-pics');

async function ensureUploadsDir() {
  try {
    await mkdir(uploadsDir, { recursive: true });
  } catch (error) {
    // Directory might already exist, ignore error
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureUploadsDir();

    const formData = await req.formData();
    const file = formData.get('profilePicture') as File;
    const username = formData.get('username') as string;

    if (!file || !username) {
      return NextResponse.json(
        { error: 'Missing required fields: profilePicture or username' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = path.extname(file.name) || '.jpg';
    const filename = `user-${username}-${timestamp}${extension}`;
    const filepath = path.join(uploadsDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Update user's profile picture in database
    const profilePicturePath = `/uploads/profile-pics/${filename}`;
    await prisma.user.update({
      where: { username },
      data: { profilePicture: profilePicturePath }
    });

    console.log(`Profile picture uploaded for user ${username}`);

    return NextResponse.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      profilePicture: profilePicturePath,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName
      }
    });

  } catch (error) {
    console.error('Profile picture upload error:', error);
    return NextResponse.json(
      { error: 'Server error during upload' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { error: 'Missing required parameter: username' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove profile picture from database
    await prisma.user.update({
      where: { username },
      data: { profilePicture: null }
    });

    // Note: We're not deleting the actual file from disk to avoid issues
    // with concurrent requests or caching. A cleanup job could be implemented later.

    console.log(`Profile picture removed for user ${username}`);

    return NextResponse.json({
      success: true,
      message: 'Profile picture removed successfully'
    });

  } catch (error) {
    console.error('Profile picture removal error:', error);
    return NextResponse.json(
      { error: 'Server error during removal' },
      { status: 500 }
    );
  }
}
