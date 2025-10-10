import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logActivity, logError } from '@/lib/logger'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const parsedId = parseInt(id);
    const data = await req.json()

    const notification = await prisma.notification.update({
      where: { id: parsedId },
      data: {
        ...(data.read !== undefined && { read: data.read }),
        ...(data.message && { message: data.message }),
        ...(data.type && { type: data.type })
      }
    })

    if (notification.userId) {
      await logActivity(
        notification.userId,
        data.read !== undefined ? 'NOTIFICATION_READ' : 'NOTIFICATION_UPDATED',
        `Notification ${parsedId} ${data.read !== undefined ? 'marked as read' : 'updated'}`,
        {
          ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
          userAgent: req.headers.get('user-agent') || 'unknown'
        }
      )
    }

    return NextResponse.json({ success: true, notification })
  } catch (error) {
    console.error('Error updating notification:', error)
    await logError('Failed to update notification', error as Error, {
      action: 'UPDATE_NOTIFICATION_FAILED'
    })
    return NextResponse.json(
      { success: false, error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('DELETE request received for notification');
    
    // Check if user is authenticated
    const username = req.headers.get('x-username');
    console.log('Username from header:', username);
    
    if (!username) {
      console.log('No username provided');
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const { id } = await params;
    console.log('Notification ID to delete:', id);
    const parsedId = parseInt(id);
    console.log('Parsed ID:', parsedId);
    
    const notification = await prisma.notification.findUnique({
      where: { id: parsedId }
    })
    console.log('Found notification:', notification);

    if (!notification) {
      console.log('Notification not found');
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      )
    }

    await prisma.notification.delete({
      where: { id: parsedId }
    })
    console.log('Notification deleted from database');

    if (notification?.userId) {
      await logActivity(
        notification.userId,
        'NOTIFICATION_DELETED',
        `Notification ${parsedId} deleted: ${notification.message}`,
        {
          ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
          userAgent: req.headers.get('user-agent') || 'unknown'
        }
      )
    }
    console.log('Activity logged');

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting notification:', error)
    await logError('Failed to delete notification', error as Error, {
      action: 'DELETE_NOTIFICATION_FAILED'
    })
    return NextResponse.json(
      { success: false, error: 'Failed to delete notification' },
      { status: 500 }
    )
  }
}
