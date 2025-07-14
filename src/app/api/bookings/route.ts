import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import { sendBookingNotification, sendBookingStatusUpdate } from '../../services/notifications'
import { logActivity, ActivityActions, getIpAddress, getUserAgent } from '../../services/activityLog'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(bookings)
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
      return NextResponse.json({ success: false, error: 'Invalid booking type' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ success: false, error: 'Failed to create booking' }, { status: 500 })
  }
} 