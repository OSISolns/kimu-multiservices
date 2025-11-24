import { NextRequest, NextResponse } from 'next/server'
import { prisma, retryDatabaseOperation } from '@/lib/prisma'
import { sendBookingNotification, sendBookingStatusUpdate } from '@/app/services/notifications'
import { logActivity, ActivityActions, getIpAddress, getUserAgent } from '@/app/services/activityLog'

// Role-based access control
function checkUserPermissions(user: any, requiredRoles: string[]) {
  if (!user) return false
  return requiredRoles.includes(user.role)
}

// Validate car rental data
function validateCarRentalData(data: any) {
  const errors: string[] = []
  
  if (!data.idOrPassport) {
    errors.push('Valid identification document is required')
  }
  
  if (!data.nationality) {
    errors.push('Nationality must be specified')
  }
  
  if (!data.carType) {
    errors.push('Vehicle type selection is required')
  }
  
  // Check if dates are in the future
  if (data.pickupDate) {
    const pickupDate = new Date(data.pickupDate)
    if (pickupDate < new Date()) {
      errors.push('Pickup date cannot be in the past')
    }
  }
  
  return errors
}

// Calculate rental duration with business logic
function calculateRentalDuration(pickupDate: string, pickupTime: string, returnDate: string, returnTime: string) {
  if (!pickupDate || !pickupTime || !returnDate || !returnTime) {
    return 1 // Default to 1 day if incomplete data
  }
  
  const pickup = new Date(`${pickupDate}T${pickupTime}`)
  const returnDateTime = new Date(`${returnDate}T${returnTime}`)
  
  if (pickup >= returnDateTime) {
    return 1 // Invalid date range, default to 1 day
  }
  
  const diffMs = returnDateTime.getTime() - pickup.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  
  // Business rule: minimum 4 hours = 0.5 days, 12+ hours = 1 day
  if (diffHours < 4) return 0.5
  if (diffHours <= 12) return 1
  
  return Math.ceil(diffHours / 24)
}

export async function GET(req: NextRequest) {
  try {
    console.log('GET /api/bookings - Request received');
    
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    
    console.log('GET /api/bookings - Params:', { page, limit, status, type });
    
    const skip = (page - 1) * limit
    
    // Build where clause dynamically
    const whereClause: any = {}
    if (status) whereClause.status = status
    if (type) whereClause.type = type
    
    console.log('GET /api/bookings - Where clause:', whereClause);
    
    const [bookings, total] = await retryDatabaseOperation(async () => {
      return await Promise.all([
        prisma.booking.findMany({
          where: whereClause,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.booking.count({ where: whereClause })
      ]);
    });
    
    console.log('GET /api/bookings - Found bookings:', bookings.length, 'Total:', total);
    console.log('GET /api/bookings - Sample booking:', bookings[0]);
    
    return NextResponse.json({
      data: bookings,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalRecords: total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1
      }
    })
  } catch (error) {
    console.error('Failed to retrieve bookings:', error)
    return NextResponse.json(
      { error: 'Unable to fetch booking information' }, 
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('POST /api/bookings - Request received');
    
    // Authentication check
    const username = req.headers.get('x-username')
    console.log('POST /api/bookings - Username from header:', username);
    
    if (!username) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    const user = await prisma.user.findUnique({ where: { username } })
    console.log('POST /api/bookings - User found:', user ? { username: user.username, role: user.role } : 'Not found');
    
    if (!user || !checkUserPermissions(user, ['staff', 'admin', 'tofficer', 'agent'])) {
      console.log('POST /api/bookings - Permission denied for user:', username);
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }
    
    const requestData = await req.json()
    console.log('POST /api/bookings - Request data:', requestData);
    
    // Validate booking type
    if (!requestData.type || !['Car Rental', 'Hotel', 'Taxi Service', 'Airport Transfer', 'City Tour'].includes(requestData.type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid booking type specified' 
      }, { status: 400 })
    }
    
    let newBooking: any
    let rentalDays = null
    
    // Handle car rental bookings
    if (requestData.type === 'Car Rental') {
      const validationErrors = validateCarRentalData(requestData)
      if (validationErrors.length > 0) {
        return NextResponse.json({ 
          success: false, 
          errors: validationErrors 
        }, { status: 400 })
      }
      
      rentalDays = calculateRentalDuration(
        requestData.pickupDate, 
        requestData.pickupTime, 
        requestData.returnDate, 
        requestData.returnTime
      )
      
      newBooking = await prisma.booking.create({
        data: {
          type: requestData.type,
          name: requestData.name?.trim(),
          email: requestData.email?.trim(),
          phone: requestData.phone?.trim(),
          nationality: requestData.nationality?.trim(),
          idOrPassport: requestData.idOrPassport?.trim(),
          carType: requestData.carType,
          pickupDate: requestData.pickupDate,
          pickupTime: requestData.pickupTime,
          returnDate: requestData.returnDate,
          returnTime: requestData.returnTime,
          rentalDays,
          returnConfirmed: false,
          fullTank: false,
          status: 'Confirmed'
        }
      })
    }
    // Handle taxi service bookings
    else if (requestData.type === 'Taxi Service') {
      if (!requestData.name?.trim() || !requestData.phone?.trim()) {
        return NextResponse.json({ 
          success: false, 
          error: 'Customer name and contact number are required for taxi service' 
        }, { status: 400 })
      }
      
      newBooking = await prisma.booking.create({
        data: {
          type: requestData.type,
          name: requestData.name?.trim(),
          email: requestData.email?.trim(),
          phone: requestData.phone?.trim(),
          nationality: requestData.nationality?.trim(),
          idOrPassport: requestData.idOrPassport?.trim(),
          pickupDate: requestData.pickupDate,
          pickupTime: requestData.pickupTime,
          returnDate: requestData.returnDate,
          returnTime: requestData.returnTime,
          status: 'Active'
        }
      })
    }
    // Handle hotel bookings
    else if (requestData.type === 'Hotel') {
      if (!requestData.guestName?.trim() || !requestData.phone?.trim()) {
        return NextResponse.json({ 
          success: false, 
          error: 'Guest name and contact number are required' 
        }, { status: 400 })
      }
      
      newBooking = await prisma.booking.create({
        data: {
          type: requestData.type,
          name: requestData.guestName.trim(),
          email: requestData.email?.trim(),
          phone: requestData.phone.trim(),
          pickupDate: requestData.checkInDate,
          pickupTime: '14:00', // Standard check-in
          returnDate: requestData.checkOutDate,
          returnTime: '11:00', // Standard check-out
          status: 'Confirmed'
        }
      })
    }
    // Handle taxi service bookings
    else if (requestData.type === 'Taxi Service') {
      if (!requestData.name?.trim() || !requestData.phone?.trim() || !requestData.idOrPassport?.trim() || !requestData.nationality?.trim()) {
        return NextResponse.json({ 
          success: false, 
          error: 'Customer name, phone, ID/Passport, and nationality are required for taxi service' 
        }, { status: 400 })
      }
      
      newBooking = await prisma.booking.create({
        data: {
          type: requestData.type,
          name: requestData.name.trim(),
          email: requestData.email?.trim(),
          phone: requestData.phone.trim(),
          nationality: requestData.nationality.trim(),
          idOrPassport: requestData.idOrPassport.trim(),
          pickupDate: requestData.pickupDate,
          pickupTime: requestData.pickupTime,
          returnDate: requestData.returnDate,
          returnTime: requestData.returnTime,
          status: 'Confirmed'
        }
      })
    }
    // Handle other booking types
    else {
      const requiredFields = ['name', 'phone']
      const missingFields = requiredFields.filter(field => !requestData[field]?.trim())
      
      if (missingFields.length > 0) {
        return NextResponse.json({ 
          success: false, 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        }, { status: 400 })
      }
      
      newBooking = await prisma.booking.create({
        data: {
          type: requestData.type,
          name: requestData.name?.trim() || requestData.guestName?.trim(),
          email: requestData.email?.trim(),
          phone: requestData.phone?.trim(),
          nationality: requestData.nationality?.trim() || null,
          idOrPassport: requestData.idOrPassport?.trim() || null,
          carType: requestData.carType || null,
          pickupDate: requestData.pickupDate || requestData.checkInDate || null,
          pickupTime: requestData.pickupTime || null,
          returnDate: requestData.returnDate || requestData.checkOutDate || null,
          returnTime: requestData.returnTime || null,
          rentalDays: requestData.rentalDays || null,
          returnConfirmed: false,
          fullTank: false,
          status: 'Confirmed'
        }
      })
    }
    
    console.log('POST /api/bookings - Booking created successfully:', newBooking);
    
    // Log the activity
    await logActivity({
      action: ActivityActions.BOOKING_CREATED,
      details: {
        bookingId: newBooking.id,
        type: requestData.type,
        customerName: newBooking.name,
        carType: newBooking.carType,
        rentalDays
      },
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req)
    }).catch(err => {
      console.warn('Activity logging failed:', err)
    })
    
    // Send notification asynchronously
    sendBookingNotification(newBooking).catch(err => {
      console.error('Notification delivery failed:', err)
    })
    
    const response: any = { 
      success: true, 
      bookingId: newBooking.id,
      message: 'Booking created successfully'
    }
    
    if (rentalDays) {
      response.rentalDays = rentalDays
    }
    
    console.log('POST /api/bookings - Sending response:', response);
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Booking creation failed:', error)
    
    // Handle specific database errors
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ 
        success: false, 
        error: 'Duplicate booking detected' 
      }, { status: 409 })
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'Unable to process booking request' 
    }, { status: 500 })
  }
} 