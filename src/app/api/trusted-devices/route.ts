import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get trusted devices for a user
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        trustedDevices: {
          where: {
            expiresAt: {
              gt: new Date() // Only get non-expired devices
            }
          },
          orderBy: { lastUsed: 'desc' }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      trustedDevices: user.trustedDevices.map(device => ({
        id: device.id,
        deviceName: device.deviceName,
        createdAt: device.createdAt,
        lastUsed: device.lastUsed,
        expiresAt: device.expiresAt
      }))
    });
  } catch (error) {
    console.error('Error fetching trusted devices:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Add a trusted device
export async function POST(req: NextRequest) {
  try {
    const { username, deviceId, deviceName, userAgent, ipAddress } = await req.json();

    if (!username || !deviceId) {
      return NextResponse.json({ 
        error: 'Username and deviceId are required' 
      }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Set expiration to 30 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Check if device is already trusted
    const existingDevice = await prisma.trustedDevice.findUnique({
      where: {
        userId_deviceId: {
          userId: user.id,
          deviceId: deviceId
        }
      }
    });

    let trustedDevice;

    if (existingDevice) {
      // Update existing device with new expiration
      trustedDevice = await prisma.trustedDevice.update({
        where: { id: existingDevice.id },
        data: {
          expiresAt,
          lastUsed: new Date(),
          deviceName: deviceName || existingDevice.deviceName,
          userAgent: userAgent || existingDevice.userAgent,
          ipAddress: ipAddress || existingDevice.ipAddress
        }
      });
    } else {
      // Create new trusted device
      trustedDevice = await prisma.trustedDevice.create({
        data: {
          userId: user.id,
          deviceId,
          deviceName: deviceName || 'Unknown Device',
          userAgent,
          ipAddress,
          expiresAt
        }
      });
    }

    console.log(`Device trusted for user ${username}: ${deviceName || deviceId}`);

    return NextResponse.json({ 
      success: true,
      message: 'Device has been trusted for 30 days',
      trustedDevice: {
        id: trustedDevice.id,
        deviceName: trustedDevice.deviceName,
        expiresAt: trustedDevice.expiresAt
      }
    });
  } catch (error) {
    console.error('Error adding trusted device:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Remove a trusted device
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get('deviceId');
    const username = searchParams.get('username');

    if (!deviceId || !username) {
      return NextResponse.json({ 
        error: 'Device ID and username are required' 
      }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await prisma.trustedDevice.deleteMany({
      where: {
        userId: user.id,
        deviceId: deviceId
      }
    });

    console.log(`Trusted device removed for user ${username}: ${deviceId}`);

    return NextResponse.json({ 
      success: true,
      message: 'Device trust has been revoked'
    });
  } catch (error) {
    console.error('Error removing trusted device:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
