import { NextRequest, NextResponse } from 'next/server'
import { sendBookingNotification, sendBookingStatusUpdate } from '../../services/notifications'

let bookings: any[] = [
  {
    id: 1,
    type: 'Car Rental',
    name: 'Jean Uwimana',
    phone: '+250788123456',
    nationality: 'Rwandan',
    idOrPassport: '1199999999999999',
    carType: 'Toyota Prado TXL',
    pickupDate: '2024-06-10',
    pickupTime: '08:00',
    returnDate: '2024-06-10',
    returnTime: '20:00',
    rentalDays: 1,
    returnConfirmed: false,
    fullTank: false,
    status: 'Active',
    createdAt: '2024-06-08T10:00:00Z'
  },
  {
    id: 2,
    type: 'Car Rental',
    name: 'Alice Smith',
    phone: '+254712345678',
    nationality: 'Kenyan',
    idOrPassport: 'A1234567',
    carType: 'Hyundai Sonata',
    pickupDate: '2024-06-09',
    pickupTime: '09:00',
    returnDate: '2024-06-10',
    returnTime: '10:00',
    rentalDays: 2,
    returnConfirmed: true,
    fullTank: true,
    status: 'Completed',
    createdAt: '2024-06-07T14:30:00Z'
  },
  {
    id: 3,
    type: 'Car Rental',
    name: 'John Doe',
    phone: '+250789654321',
    nationality: 'Rwandan',
    idOrPassport: '1200000000000000',
    carType: 'Toyota Noah',
    pickupDate: '2024-06-11',
    pickupTime: '07:00',
    returnDate: '2024-06-11',
    returnTime: '19:00',
    rentalDays: 1,
    returnConfirmed: false,
    fullTank: false,
    status: 'Active',
    createdAt: '2024-06-09T08:15:00Z'
  },
  {
    id: 4,
    type: 'Car Rental',
    name: 'Maria Garcia',
    phone: '+33712345678',
    nationality: 'French',
    idOrPassport: 'X9876543',
    carType: 'Toyota Coaster',
    pickupDate: '2024-06-08',
    pickupTime: '10:00',
    returnDate: '2024-06-09',
    returnTime: '12:00',
    rentalDays: 2,
    returnConfirmed: true,
    fullTank: true,
    status: 'Completed',
    createdAt: '2024-06-06T16:45:00Z'
  },
  {
    id: 5,
    type: 'Hotel',
    guestName: 'David Wilson',
    email: 'david.wilson@email.com',
    phone: '+250788999888',
    checkInDate: '2024-06-15',
    checkOutDate: '2024-06-18',
    roomType: 'Luxury',
    guests: '2',
    specialRequests: 'High floor room with city view',
    status: 'Pending',
    createdAt: '2024-06-10T11:20:00Z'
  },
  {
    id: 6,
    type: 'Hotel',
    guestName: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+250777123456',
    checkInDate: '2024-06-12',
    checkOutDate: '2024-06-14',
    roomType: 'Mid-Range',
    guests: '1',
    specialRequests: '',
    status: 'Confirmed',
    createdAt: '2024-06-08T09:30:00Z'
  }
];

export async function GET() {
  return NextResponse.json(bookings);
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Generate unique ID
    const newId = Math.max(...bookings.map(b => b.id), 0) + 1;
    
    if (data.type === 'Car Rental') {
      // Validate car rental data
      if (!data.idOrPassport || !data.nationality) {
        return NextResponse.json({ success: false, error: 'Passport or National ID card and nationality are required for car rentals.' }, { status: 400 });
      }

      // Calculate rental days based on pickup and return times
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
      
      // Send WhatsApp notification to agents (non-blocking)
      sendBookingNotification(newBooking).catch(error => {
        console.error('Failed to send booking notification:', error);
      });
      
      return NextResponse.json({ success: true, rentalDays, booking: newBooking });
    } else if (data.type === 'Hotel') {
      // Validate hotel booking data
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
      
      // Send WhatsApp notification to agents (non-blocking)
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