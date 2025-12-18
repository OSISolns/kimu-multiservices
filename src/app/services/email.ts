import nodemailer from 'nodemailer';
import type { SendMailOptions } from 'nodemailer';

interface SendEmailParams {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  // Improved typing for attachments
  attachments?: SendMailOptions['attachments'];
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
  attachments,
}: SendEmailParams) {
  try {
    // 1. Configure SMTP Settings
    // Ensure SMTP_PORT is read as a number. Default to 587 if missing.
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');

    // 2. Dynamic SSL Logic
    // Fix: Port 465 requires secure: true. Port 587 requires secure: false.
    const isSecure = smtpPort === 465;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
      port: smtpPort,
      secure: isSecure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // 3. Define Sender
    // Critical: I replaced the hardcoded personal Gmail with a generic fallback 
    // to protect your privacy and prevent spam.
    const from = process.env.SMTP_FROM || 'KIMU Transport <noreply@kimutransport.com>';

    console.log(`[Email Service] Attempting to send email to ${to} from ${from}`);

    // 4. Send Email
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
    // Throwing the error ensures the calling function knows the email failed
    throw error;
  }
}