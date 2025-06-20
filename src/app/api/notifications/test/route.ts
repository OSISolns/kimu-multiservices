import { NextRequest, NextResponse } from 'next/server';
import { sendBookingNotification, sendUrgentNotification } from '../../../services/notifications';

export async function POST(req: NextRequest) {
  try {
    const { type, message } = await req.json();
    
    if (type === 'booking') {
      // Test booking notification
      const testBooking = {
        id: 999,
        type: 'Car Rental' as const,
        name: 'Test Client',
        phone: '+250788123456',
        carType: 'Toyota Prado TXL',
        pickupDate: '2024-06-20',
        pickupTime: '08:00',
        returnDate: '2024-06-22',
        returnTime: '18:00',
        nationality: 'Rwandan',
        createdAt: new Date().toISOString()
      };
      
      const result = await sendBookingNotification(testBooking);
      return NextResponse.json({ 
        success: result, 
        message: result ? 'Test booking notification sent' : 'Failed to send test notification' 
      });
    } else if (type === 'urgent') {
      // Test urgent notification
      const result = await sendUrgentNotification(message || 'This is a test urgent notification');
      return NextResponse.json({ 
        success: result, 
        message: result ? 'Test urgent notification sent' : 'Failed to send test notification' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid notification type. Use "booking" or "urgent"' 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in test notification:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 