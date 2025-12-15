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
    // Configure SMTP transporter using Brevo (formerly Sendinblue)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || '9c4ca5001@smtp-brevo.com',
        pass: process.env.SMTP_PASSWORD || 'xsmtpsib-fea4c8ccc4e301e73030a9c6874c140e27e57337a1fa936b0748e869243e04c0-Cf7gtDZCP2moDrDG',
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