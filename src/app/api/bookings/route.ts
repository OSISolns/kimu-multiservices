import { NextRequest, NextResponse } from 'next/server'
import { sendBookingNotification, sendBookingStatusUpdate } from '../../services/notifications'

// Start with an empty bookings array
let bookings: any[] = [];

export async function GET() {
  return NextResponse.json(bookings);
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    // Generate unique ID
    const newId = Math.max(...bookings.map(b => b.id), 0) + 1;
    if (data.type === 'Car Rental') {
      if (!data.idOrPassport || !data.nationality) {
        return NextResponse.json({ success: false, error: 'Passport or National ID card and nationality are required for car rentals.' }, { status: 400 });
      }
      let rentalDays = 1;
      if (data.pickupDate && data.pickupTime && data.returnDate && data.returnTime) {
        const pickup = new Date(`${data.pickupDate}T${data.pickupTime}`);
        const ret = new Date(`${data.returnDate}T${data.returnTime}`);
        const diffMs = ret.getTime() - pickup.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        if (diffHours > 12) {
          rentalDays = Math.ceil(diffHours / 12);
        }
      }
      const newBooking = {
        id: newId,
        ...data,
        rentalDays,
        returnConfirmed: false,
        fullTank: false,
        status: 'Active',
        createdAt: new Date().toISOString()
      };
      bookings.push(newBooking);
      sendBookingNotification(newBooking).catch(error => {
        console.error('Failed to send booking notification:', error);
      });
      return NextResponse.json({ success: true, rentalDays, booking: newBooking });
    } else if (data.type === 'Hotel') {
      if (!data.guestName || !data.email || !data.phone || !data.checkInDate || !data.checkOutDate || !data.roomType || !data.guests) {
        return NextResponse.json({ success: false, error: 'All required fields must be filled for hotel bookings.' }, { status: 400 });
      }
      const newBooking = {
        id: newId,
        ...data,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };
      bookings.push(newBooking);
      sendBookingNotification(newBooking).catch(error => {
        console.error('Failed to send booking notification:', error);
      });
      return NextResponse.json({ success: true, booking: newBooking });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid booking type. Must be either "Car Rental" or "Hotel".' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
} 