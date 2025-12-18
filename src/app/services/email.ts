import nodemailer from 'nodemailer';

export async function sendEmail({
  to,
  subject,
  text,
  html,
  attachments,
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: any[];
}) {
  try {
    // In development logic: Mock email if no SMTP_HOST or SMTP_USER is set
    if (process.env.NODE_ENV === 'development' && (!process.env.SMTP_HOST || !process.env.SMTP_USER)) {
      console.log(`[Email Service] Dev Mode: Mocking email to ${to}`);
      console.log(`[Email Content]: ${text || html}`);
      return { id: `mock-${Date.now()}`, success: true };
    }

    // Configure SMTP transporter using Brevo (formerly Sendinblue)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const from = process.env.SMTP_FROM || 'KIMU Transport <valery.osisolns@gmail.com>';

    console.log(`[Email Service] Sending email to ${to} from ${from}`);

    // Send email
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: text || '',
      html: html || text || '',
      attachments,
    });

    console.log(`[Email Service] Email sent successfully: ${info.messageId}`);
    return { id: info.messageId, success: true };
  } catch (error) {
    console.error('[Email Service] Failed to send email:', error);
    throw error;
  }
}