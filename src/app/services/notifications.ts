import { sendEmail } from './email';

// Agent phone numbers - these should be stored in environment variables in production
const AGENT_PHONE_NUMBERS = [
  process.env.AGENT_PHONE_1 || '+250788647452',
  //process.env.AGENT_PHONE_2 || '+250789654321',
];

const AGENT_EMAILS = [
  'valery.osisolns@gmail.com',
];

interface BookingData {
  id: number;
  type: 'Car Rental' | 'Hotel';
  name?: string;
  guestName?: string;
  phone: string;
  carType?: string;
  roomType?: string;
  pickupDate?: string;
  pickupTime?: string;
  returnDate?: string;
  returnTime?: string;
  checkInDate?: string;
  checkOutDate?: string;
  guests?: string;
  nationality?: string;
  createdAt: string;
}

export async function sendBookingNotification(booking: BookingData) {
  try {
    const clientName = booking.name || booking.guestName || 'Unknown';
    const bookingType = booking.type;
    const bookingId = booking.id;
    const createdAt = new Date(booking.createdAt).toLocaleString('en-US', {
      timeZone: 'Africa/Kigali',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let subject = `New Booking Received: KIMU-${bookingId.toString().padStart(6, '0')}`;
    let text = `NEW BOOKING RECEIVED\n\n`;
    text += `Booking ID: KIMU-${bookingId.toString().padStart(6, '0')}\n`;
    text += `Client: ${clientName}\n`;
    text += `Phone: ${booking.phone}\n`;
    text += `Type: ${bookingType}\n`;
    text += `Received: ${createdAt}\n\n`;

    if (bookingType === 'Car Rental') {
      text += `Vehicle: ${booking.carType}\n`;
      text += `Pickup: ${booking.pickupDate} at ${booking.pickupTime}\n`;
      text += `Return: ${booking.returnDate} at ${booking.returnTime}\n`;
      text += `Nationality: ${booking.nationality}\n`;
    } else if (bookingType === 'Hotel') {
      text += `Room Type: ${booking.roomType}\n`;
      text += `Check-in: ${booking.checkInDate}\n`;
      text += `Check-out: ${booking.checkOutDate}\n`;
      text += `Guests: ${booking.guests}\n`;
    }

    text += `\nPlease check the agent dashboard for full details.\n`;
    text += `http://localhost:3001/agent/dashboard`;

    // Send email to all agents
    const emailPromises = AGENT_EMAILS.map(email =>
      sendEmail({
        to: email,
        subject,
        text,
      })
    );
    await Promise.allSettled(emailPromises);
    console.log(`Booking email notification sent to ${AGENT_EMAILS.length} agents for booking ${bookingId}`);
    return true;
  } catch (error) {
    console.error('Error sending booking email notification:', error);
    return false;
  }
}

export async function sendBookingStatusUpdate(booking: BookingData, status: string) {
  try {
    const clientName = booking.name || booking.guestName || 'Unknown';
    const bookingId = booking.id;
    let subject = `Booking Status Update: KIMU-${bookingId.toString().padStart(6, '0')}`;
    let text = `BOOKING STATUS UPDATE\n\n`;
    text += `Booking ID: KIMU-${bookingId.toString().padStart(6, '0')}\n`;
    text += `Client: ${clientName}\n`;
    text += `New Status: ${status}\n`;
    text += `Updated: ${new Date().toLocaleString('en-US', {
      timeZone: 'Africa/Kigali',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}\n\n`;
    text += `Check the agent dashboard for details.\n`;
    text += `http://localhost:3001/agent/dashboard`;

    const emailPromises = AGENT_EMAILS.map(email =>
      sendEmail({
        to: email,
        subject,
        text,
      })
    );
    await Promise.allSettled(emailPromises);
    console.log(`Status update email sent to ${AGENT_EMAILS.length} agents for booking ${bookingId}`);
    return true;
  } catch (error) {
    console.error('Error sending status update email:', error);
    return false;
  }
}

export async function sendUrgentNotification(message: string) {
  try {
    let subject = 'URGENT AGENT NOTIFICATION';
    let text = `URGENT NOTIFICATION\n\n${message}\n\nCheck the agent dashboard immediately.\nhttp://localhost:3001/agent/dashboard`;
    const emailPromises = AGENT_EMAILS.map(email =>
      sendEmail({
        to: email,
        subject,
        text,
      })
    );
    await Promise.allSettled(emailPromises);
    console.log(`Urgent email notification sent to ${AGENT_EMAILS.length} agents`);
    return true;
  } catch (error) {
    console.error('Error sending urgent email notification:', error);
    return false;
  }
} 