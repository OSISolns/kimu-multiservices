import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/app/services/email';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            documentId,
            documentType,
            recipientEmail,
            recipientName,
            subject,
            message,
            pdfBase64
        } = body;

        if (!recipientEmail) {
            return NextResponse.json(
                { error: 'Recipient email is required' },
                { status: 400 }
            );
        }

        const emailSubject = subject || `${documentType} #${documentId} from KIMU Transport`;
        const emailText = message || `Dear ${recipientName || 'Client'},\n\nPlease find attached the ${documentType} #${documentId}.\n\nBest regards,\nKIMU Transport Team`;

        const attachments = [];
        if (pdfBase64) {
            // pdfBase64 might be a data URI "data:application/pdf;base64,..."
            // Nodemailer handles data URIs in 'path' property
            attachments.push({
                filename: `${documentType}_${documentId}.pdf`,
                path: pdfBase64,
                contentType: 'application/pdf'
            });
        }

        await sendEmail({
            to: recipientEmail,
            subject: emailSubject,
            text: emailText,
            attachments
        });

        return NextResponse.json({ success: true, message: 'Email sent successfully' });

    } catch (error) {
        console.error('Error sending document email:', error);
        return NextResponse.json(
            { error: 'Failed to send email' },
            { status: 500 }
        );
    }
}
