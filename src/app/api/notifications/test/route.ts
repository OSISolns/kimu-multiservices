import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Test endpoint to create sample notifications (admin-only)
export async function POST(req: NextRequest) {
  try {
    const adminUsername = req.headers.get('x-username');
    const admin = adminUsername ? await prisma.user.findUnique({ where: { username: adminUsername } }) : null;
    
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Create sample notifications
    const sampleNotifications = [
      {
        message: "New booking received for Car Rental",
        type: "booking",
        read: false
      },
      {
        message: "Payment pending for Hotel booking #12345",
        type: "payment",
        read: false
      },
      {
        message: "Vehicle maintenance scheduled for tomorrow",
        type: "maintenance",
        read: false
      },
      {
        message: "Monthly financial report is ready for review",
        type: "report",
        read: false
      },
      {
        message: "New user registration requires approval",
        type: "user",
        read: false
      }
    ];

    const createdNotifications = [];
    for (const notification of sampleNotifications) {
      const created = await prisma.notification.create({
        data: notification
      });
      createdNotifications.push(created);
    }

    return NextResponse.json({
      success: true,
      message: `Created ${createdNotifications.length} test notifications`,
      notifications: createdNotifications
    });

  } catch (error) {
    console.error('Error creating test notifications:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Clear all notifications (admin-only)
export async function DELETE(req: NextRequest) {
  try {
    const adminUsername = req.headers.get('x-username');
    const admin = adminUsername ? await prisma.user.findUnique({ where: { username: adminUsername } }) : null;
    
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const deleted = await prisma.notification.deleteMany({});

    return NextResponse.json({
      success: true,
      message: `Deleted ${deleted.count} notifications`
    });

  } catch (error) {
    console.error('Error deleting notifications:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}