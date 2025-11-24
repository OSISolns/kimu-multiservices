import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { username, deviceId } = await req.json();

    if (!username || !deviceId) {
      return NextResponse.json({ 
        trusted: false, 
        error: 'Username and deviceId are required' 
      }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return NextResponse.json({ 
        trusted: false, 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Check if device is trusted and not expired
    const trustedDevice = await prisma.trustedDevice.findUnique({
      where: {
        userId_deviceId: {
          userId: user.id,
          deviceId: deviceId
        }
      }
    });

    const currentTime = new Date();
    const isTrusted = trustedDevice && trustedDevice.expiresAt > currentTime;

    if (isTrusted && trustedDevice) {
      // Update last used timestamp
      await prisma.trustedDevice.update({
        where: { id: trustedDevice.id },
        data: { lastUsed: currentTime }
      });

      console.log(`Device ${deviceId} is trusted for user ${username}`);
      
      return NextResponse.json({ 
        trusted: true,
        deviceName: trustedDevice.deviceName,
        expiresAt: trustedDevice.expiresAt
      });
    } else {
      // Clean up expired device if it exists
      if (trustedDevice && trustedDevice.expiresAt <= currentTime) {
        await prisma.trustedDevice.delete({
          where: { id: trustedDevice.id }
        });
        console.log(`Expired trusted device removed for user ${username}: ${deviceId}`);
      }

      console.log(`Device ${deviceId} is not trusted for user ${username}`);
      
      return NextResponse.json({ 
        trusted: false,
        message: 'Device is not trusted or trust has expired'
      });
    }
  } catch (error) {
    console.error('Error checking trusted device:', error);
    return NextResponse.json({ 
      trusted: false, 
      error: 'Server error' 
    }, { status: 500 });
  }
}
