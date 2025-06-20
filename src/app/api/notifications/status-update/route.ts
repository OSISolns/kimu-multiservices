import { NextRequest, NextResponse } from 'next/server';
import { sendBookingStatusUpdate } from '../../../services/notifications';

export async function POST(req: NextRequest) {
  try {
    const { booking, status } = await req.json();
    
    if (!booking || !status) {
      return NextResponse.json({ 
        success: false, 
        error: 'Booking and status are required' 
      }, { status: 400 });
    }

    // Send status update notification to agents
    const notificationSent = await sendBookingStatusUpdate(booking, status);
    
    if (notificationSent) {
      return NextResponse.json({ 
        success: true, 
        message: 'Status update notification sent successfully' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to send status update notification' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in status update notification:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 