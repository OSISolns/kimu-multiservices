import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import { sendBookingNotification, sendBookingStatusUpdate } from '../../services/notifications'
import { logActivity, ActivityActions, getIpAddress, getUserAgent } from '../../services/activityLog'

const globalForPrisma = global as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.booking.count()
    ])
    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    
    if (data.type === 'Car Rental') {
      if (!data.idOrPassport || !data.nationality) {
        return NextResponse.json({ success: false, error: 'Passport or National ID card and nationality are required for car rentals.' }, { status: 400 })
      }
      
      let rentalDays = 1
      if (data.pickupDate && data.pickupTime && data.returnDate && data.returnTime) {
        const pickup = new Date(`${data.pickupDate}T${data.pickupTime}`)
        const ret = new Date(`${data.returnDate}T${data.returnTime}`)
        const diffMs = ret.getTime() - pickup.getTime()
        const diffHours = diffMs / (1000 * 60 * 60)
        if (diffHours > 12) {
          rentalDays = Math.ceil(diffHours / 12)
        }
      }
      
      const newBooking = await prisma.booking.create({
        data: {
          type: data.type,
          name: data.name,
          phone: data.phone,
          nationality: data.nationality,
          idOrPassport: data.idOrPassport,
          carType: data.carType,
          pickupDate: data.pickupDate,
          pickupTime: data.pickupTime,
          returnDate: data.returnDate,
          returnTime: data.returnTime,
          rentalDays,
          returnConfirmed: false,
          fullTank: false,
          status: 'Active'
        }
      })
      
      // Log activity
      await logActivity({
        action: ActivityActions.BOOKING_CREATED,
        details: {
          bookingId: newBooking.id,
          type: data.type,
          customerName: data.name,
          carType: data.carType
        },
        ipAddress: getIpAddress(req),
        userAgent: getUserAgent(req)
      })
      
      // Send notification
      sendBookingNotification(newBooking).catch(error => {
        console.error('Failed to send booking notification:', error)
      })
      
      return NextResponse.json({ success: true, rentalDays, booking: newBooking })
    } else if (data.type === 'Hotel') {
      const newBooking = await prisma.booking.create({
        data: {
          type: data.type,
          name: data.guestName,
          phone: data.phone,
          pickupDate: data.checkInDate,
          pickupTime: '14:00', // Default check-in time
          returnDate: data.checkOutDate,
          returnTime: '11:00', // Default check-out time
          status: 'Active'
        }
      })
      
      // Send notification
      sendBookingNotification(newBooking).catch(error => {
        console.error('Failed to send booking notification:', error)
      })
      
      return NextResponse.json({ success: true, booking: newBooking })
    } else {
      // Generic handler for other booking types
      const newBooking = await prisma.booking.create({
        data: {
          type: data.type,
          name: data.name || data.guestName || null,
          phone: data.phone || null,
          nationality: data.nationality || null,
          idOrPassport: data.idOrPassport || null,
          carType: data.carType || null,
          pickupDate: data.pickupDate || data.checkInDate || null,
          pickupTime: data.pickupTime || null,
          returnDate: data.returnDate || data.checkOutDate || null,
          returnTime: data.returnTime || null,
          rentalDays: data.rentalDays || null,
          returnConfirmed: false,
          fullTank: false,
          status: 'Active'
        }
      })
      // Optionally: log activity, send notification, etc.
      return NextResponse.json({ success: true, booking: newBooking })
    }
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ success: false, error: 'Failed to create booking' }, { status: 500 })
  }
} 