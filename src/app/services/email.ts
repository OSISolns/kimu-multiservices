import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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
  const info = await resend.emails.send({
    from: process.env.SMTP_FROM || 'valery.osisolns@gmail.com',
    to,
    subject,
    text,
    html,
  });
  return info;
} 