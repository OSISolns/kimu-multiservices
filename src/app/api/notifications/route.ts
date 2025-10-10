import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logActivity, logError } from '@/lib/logger'

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
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit to 100 notifications for performance
    })
    
    // Add cache headers
    const headers = new Headers()
    headers.set('Cache-Control', 'public, max-age=60') // 1 minute cache
    
    return NextResponse.json(notifications, { headers })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    await logError('Failed to fetch notifications', error as Error, {
      action: 'FETCH_NOTIFICATIONS_FAILED'
    })
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
    if (data.userId) {
      await logActivity(
        parseInt(data.userId),
        'NOTIFICATION_CREATED',
        `Notification created: ${data.type} - ${data.message}`,
        {
          ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
          userAgent: req.headers.get('user-agent') || 'unknown'
        }
      )
    }
    
    return NextResponse.json({ success: true, notification })
  } catch (error) {
    console.error('Error creating notification:', error)
    await logError('Failed to create notification', error as Error, {
      action: 'CREATE_NOTIFICATION_FAILED'
    })
    return NextResponse.json({ success: false, error: 'Failed to create notification' }, { status: 500 })
  }
} 