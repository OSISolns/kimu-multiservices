import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import { logActivity, ActivityActions, getIpAddress, getUserAgent } from '../../../services/activityLog'

const prisma = new PrismaClient()

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const data = await req.json()
    
    const notification = await prisma.notification.update({
      where: { id },
      data: {
        ...(data.read !== undefined && { read: data.read }),
        ...(data.message && { message: data.message }),
        ...(data.type && { type: data.type })
      }
    })
    
    // Log activity
    await logActivity({
      userId: notification.userId || undefined,
      action: data.read !== undefined ? ActivityActions.NOTIFICATION_READ : ActivityActions.NOTIFICATION_CREATED,
      details: {
        notificationId: id,
        action: data.read !== undefined ? 'marked as read' : 'updated',
        read: data.read
      },
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req)
    })
    
    return NextResponse.json({ success: true, notification })
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json({ success: false, error: 'Failed to update notification' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    const notification = await prisma.notification.findUnique({
      where: { id }
    })
    
    await prisma.notification.delete({
      where: { id }
    })
    
    // Log activity
    await logActivity({
      userId: notification?.userId || undefined,
      action: ActivityActions.NOTIFICATION_DELETED,
      details: {
        notificationId: id,
        message: notification?.message
      },
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req)
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting notification:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete notification' }, { status: 500 })
  }
} 