import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import { logActivity, ActivityActions, getIpAddress, getUserAgent } from '../../services/activityLog'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')
    const read = searchParams.get('read')
    
    const where: any = {}
    
    if (userId) {
      where.userId = parseInt(userId)
    }
    
    if (type) {
      where.type = type
    }
    
    if (read !== null) {
      where.read = read === 'true'
    }
    
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId ? parseInt(data.userId) : null,
        message: data.message,
        type: data.type,
        read: data.read || false
      }
    })
    
    // Log activity
    await logActivity({
      userId: data.userId ? parseInt(data.userId) : undefined,
      action: ActivityActions.NOTIFICATION_CREATED,
      details: {
        notificationId: notification.id,
        type: data.type,
        message: data.message
      },
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req)
    })
    
    return NextResponse.json({ success: true, notification })
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json({ success: false, error: 'Failed to create notification' }, { status: 500 })
  }
} 