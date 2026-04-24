import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/app/services/email';

export async function POST(req: NextRequest) {
    try {
        const { to, subject, documentHtml, documentNumber, documentType } = await req.json();

        if (!to || !documentHtml || !documentNumber || !documentType) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(to)) {
            return NextResponse.json(
                { success: false, error: 'Invalid email address' },
                { status: 400 }
            );
        }

        const documentTypeLabel = documentType === 'invoice' ? 'Invoice' :
            documentType === 'quote' ? 'Quote' : 'Receipt';

        const emailSubject = subject || `${documentTypeLabel} ${documentNumber} from KIMU Multi-Services`;

        // Create email body with professional template
        const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">KIMU Multi-Services</h1>
        </div>
        
        <div style="padding: 30px; background-color: #f9fafb;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Dear Valued Customer,
          </p>
          
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Please find attached your ${documentTypeLabel.toLowerCase()} <strong>${documentNumber}</strong>.
          </p>
          
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            If you have any questions or concerns, please don't hesitate to contact us.
          </p>
          
          <div style="margin: 30px 0; padding: 20px; background-color: white; border-radius: 8px; border-left: 4px solid #667eea;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              <strong>Contact Information:</strong><br/>
              Email: info@kimumultiservices.com<br/>
              Phone: +250 792 958 752
            </p>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
            Best regards,<br/>
            <strong>KIMU Multi-Services Team</strong>
          </p>
        </div>
        
        <div style="background-color: #1f2937; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} KIMU Multi-Services. All rights reserved.
          </p>
        </div>
      </div>
    `;

        // Send email with HTML attachment
        await sendEmail({
            to,
            subject: emailSubject,
            html: emailBody,
            attachments: [
                {
                    filename: `${documentType}_${documentNumber}.html`,
                    content: documentHtml,
                    contentType: 'text/html'
                }
            ]
        });

        return NextResponse.json({
            success: true,
            message: `${documentTypeLabel} sent successfully to ${to}`
        });

    } catch (error) {
        console.error('Error sending document email:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to send email'
            },
            { status: 500 }
        );
    }
}
