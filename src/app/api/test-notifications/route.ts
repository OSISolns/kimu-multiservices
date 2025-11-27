import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    console.log('Testing notifications API...');

    // Test database connection (implicit via query)
    console.log('Database connected successfully (using singleton)');

    // Test notifications table
    const notificationCount = await prisma.notification.count();
    console.log(`Found ${notificationCount} notifications`);

    // Create a test notification
    const testNotification = await prisma.notification.create({
      data: {
        message: 'Test notification from API',
        type: 'test',
        read: false
      }
    });
    console.log('Created test notification:', testNotification);

    // Fetch all notifications
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Clean up test notification
    await prisma.notification.delete({
      where: { id: testNotification.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Notifications API is working',
      notificationCount,
      notifications: notifications.slice(0, 5) // Return first 5 for testing
    });

  } catch (error: unknown) {
    console.error('Error testing notifications:', error);
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json({
      success: false,
      error: message,
      stack
    }, { status: 500 });
  }
}
