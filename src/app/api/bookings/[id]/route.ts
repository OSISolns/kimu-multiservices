import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// API route for individual booking operations (DELETE)

// Role-based access control
function checkUserPermissions(user: any, requiredRoles: string[]) {
  if (!user) return false
  return requiredRoles.includes(user.role)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('=== DELETE /api/bookings/[id] START ===');
    
    // Await params since it's a Promise in Next.js 15
    const resolvedParams = await params;
    console.log('Request received for ID:', resolvedParams.id);
    console.log('Request URL:', req.url);
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    // Authentication check
    const username = req.headers.get('x-username')
    console.log('Username from header:', username);
    
    if (!username) {
      console.log('Authentication failed: No username header');
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    const user = await prisma.user.findUnique({ where: { username } })
    console.log('User found:', user ? { username: user.username, role: user.role } : 'Not found');
    
    if (!user || !checkUserPermissions(user, ['staff', 'admin', 'tofficer', 'agent'])) {
      console.log('Permission denied for user:', username);
      console.log('User role:', user?.role);
      console.log('Allowed roles:', ['staff', 'admin', 'tofficer', 'agent']);
      console.log('checkUserPermissions result:', checkUserPermissions(user, ['staff', 'admin', 'tofficer', 'agent']));
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }
    
    const bookingId = parseInt(resolvedParams.id)
    console.log('Parsed booking ID:', bookingId);
    
    if (isNaN(bookingId)) {
      console.log('Invalid booking ID');
      return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 })
    }
    
    // Check if booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId }
    })
    console.log('Existing booking found:', existingBooking);
    
    if (!existingBooking) {
      console.log('Booking not found');
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    
    console.log('Deleting booking:', existingBooking);
    
    // Delete the booking
    await prisma.booking.delete({
      where: { id: bookingId }
    })
    
    console.log('Booking deleted successfully');
    console.log('=== DELETE /api/bookings/[id] SUCCESS ===');
    
    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully'
    })
    
  } catch (error) {
    console.error('=== DELETE /api/bookings/[id] ERROR ===');
    console.error('Error details:', error);
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      console.log('Prisma error P2025: Record not found');
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 })
    }
    
    console.error('Generic error, returning 500');
    return NextResponse.json({ success: false, error: 'Unable to delete booking' }, { status: 500 })
  }
}
