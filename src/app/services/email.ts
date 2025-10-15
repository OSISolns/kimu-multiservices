import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  if (!resend) {
    console.warn('Resend API key not configured. Email not sent:', { to, subject });
    return { id: 'no-resend-key', success: false };
  }

  try {
    const info = await resend.emails.send({
      from: process.env.SMTP_FROM || 'valery.osisolns@gmail.com',
      to,
      subject,
      text,
      html,
    });
    return info;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
} 