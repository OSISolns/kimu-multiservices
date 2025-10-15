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
  // Check if Resend API key is available
  if (!process.env.RESEND_API_KEY) {
    console.warn('Resend API key not configured. Email not sent:', { to, subject });
    return { id: 'no-resend-key', success: false };
  }

  try {
    // Dynamic import to avoid build-time issues
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    
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