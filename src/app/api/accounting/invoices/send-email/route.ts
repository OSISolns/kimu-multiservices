import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/app/services/email';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const sendEmailSchema = z.object({
  invoiceId: z.number(),
  recipientEmail: z.string().email(),
  subject: z.string().optional(),
  message: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { invoiceId, recipientEmail, subject, message } = sendEmailSchema.parse(body);

    // Get the invoice with all details
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId }
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Create email subject
    const emailSubject = subject || `Invoice ${invoice.invoiceNumber} - KIMU Transport & Multiservices`;

    // Create email HTML template
    const emailHtml = createInvoiceEmailTemplate(invoice, message);

    // Send email using the shared email service
    try {
      const result = await sendEmail({
        to: recipientEmail,
        subject: emailSubject,
        text: `Invoice ${invoice.invoiceNumber} - KIMU Transport & Multiservices`,
        html: emailHtml,
      });

      if (!result.success) {
        throw new Error('Email service returned failure');
      }

      // Update invoice status and email tracking
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: invoice.status === 'pending' ? 'outstanding' : invoice.status,
          emailSent: true,
          emailSentAt: new Date(),
          emailSubject: subject,
          emailMessage: message
        }
      });

      return NextResponse.json({
        success: true,
        messageId: result.id,
        message: 'Invoice sent successfully'
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return NextResponse.json({
        error: 'Failed to send invoice email',
        details: emailError instanceof Error ? emailError.message : 'Unknown error',
        code: 'EMAIL_ERROR'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error sending invoice email:', error);
    return NextResponse.json({
      error: 'Failed to send invoice email',
      details: error instanceof Error ? error.message : 'Unknown error',
      code: 'UNKNOWN_ERROR'
    }, { status: 500 });
  }
}

function createInvoiceEmailTemplate(invoice: any, customMessage?: string) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
    }).format(amount);
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice ${invoice.invoiceNumber}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: white;
          padding: 30px;
          border-radius: 10px 10px 0 0;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 32px;
          font-weight: bold;
        }
        .header p {
          margin: 5px 0 0 0;
          font-size: 16px;
          opacity: 0.9;
        }
        .invoice-details {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 0 0 10px 10px;
          margin-bottom: 20px;
        }
        .invoice-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .company-info, .client-info {
          flex: 1;
        }
        .company-info h3, .client-info h3 {
          color: #f97316;
          margin-bottom: 10px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .items-table th {
          background: #f97316;
          color: white;
          padding: 15px;
          text-align: left;
        }
        .items-table td {
          padding: 15px;
          border-bottom: 1px solid #eee;
        }
        .items-table tr:nth-child(even) {
          background: #f8f9fa;
        }
        .totals {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          margin: 10px 0;
        }
        .grand-total {
          font-size: 18px;
          font-weight: bold;
          color: #f97316;
          border-top: 2px solid #f97316;
          padding-top: 10px;
        }
        .payment-info {
          background: #e0f2fe;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .payment-info h3 {
          color: #0369a1;
          margin-bottom: 15px;
        }
        .bank-accounts, .mobile-money {
          margin: 15px 0;
        }
        .status-badge {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 12px;
        }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-outstanding { background: #fee2e2; color: #dc2626; }
        .status-paid { background: #d1fae5; color: #059669; }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
        }
        .btn {
          display: inline-block;
          background: #f97316;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          margin: 10px 5px;
          font-weight: bold;
        }
        .btn:hover {
          background: #ea580c;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>KIMU</h1>
        <p>Transport & Multiservices</p>
        <p>Your Trusted Travel Partner</p>
      </div>

      <div class="invoice-details">
        <div class="invoice-info">
          <div class="company-info">
            <h3>From:</h3>
            <p><strong>KIMU Transport & Multiservices</strong></p>
            <p>Gisozi, KG 780 St, Kigali, Rwanda</p>
            <p>Email: kimutransport6@gmail.com</p>
            <p>Phone: +250 792 958 752</p>
            <p>Phone: +250 792 958 752</p>
          </div>
          <div class="client-info">
            <h3>Bill To:</h3>
            <p><strong>${invoice.clientName}</strong></p>
            <p>${invoice.clientEmail}</p>
            ${invoice.clientPhone ? `<p>${invoice.clientPhone}</p>` : ''}
          </div>
        </div>

        <div style="text-align: right; margin-bottom: 20px;">
          <h2 style="color: #f97316; margin: 0;">INVOICE</h2>
          <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
          <p><strong>Date:</strong> ${new Date(invoice.createdAt).toLocaleDateString()}</p>
          <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
          <p><strong>Status:</strong> 
            <span class="status-badge status-${invoice.status}">${invoice.status}</span>
          </p>
        </div>

        ${customMessage ? `
          <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #0369a1; margin: 0 0 10px 0;">Message:</h4>
            <p style="margin: 0;">${customMessage}</p>
          </div>
        ` : ''}

        <div>
          <h3>Service Description:</h3>
          <p style="background: #f8f9fa; padding: 15px; border-radius: 6px;">${invoice.description}</p>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map((item: any) => `
              <tr>
                <td>${item.description}</td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">${formatCurrency(item.unitPrice)}</td>
                <td style="text-align: right;">${formatCurrency(item.total)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>${formatCurrency(invoice.totalAmount)}</span>
          </div>
          <div class="total-row">
            <span>Tax (${invoice.taxRate}%):</span>
            <span>${formatCurrency(invoice.taxAmount)}</span>
          </div>
          <div class="total-row grand-total">
            <span>Total Amount:</span>
            <span>${formatCurrency(invoice.grandTotal)}</span>
          </div>
        </div>

        <div class="payment-info">
          <h3>Payment Information</h3>
          <div class="bank-accounts">
            <h4>Bank Accounts:</h4>
            <p><strong>COPEDU Bank:</strong> 1011020164888</p>
            <p><strong>Equity Bank:</strong> 4019201132304</p>
            <p><strong>BK Bank:</strong> 100185378726</p>
          </div>
          <div class="mobile-money">
            <h4>Mobile Money:</h4>
            <p><strong>MOMO PAY:</strong> 627309</p>
            <p><strong>MTN:</strong> +250 792 958 752</p>
            <p><strong>MTN:</strong> +250 792 958 752</p>
          </div>
        </div>
      </div>

      <div class="footer">
        <p><strong>Thank you for choosing KIMU!</strong></p>
        <p>For inquiries, contact us at kimutransport6@gmail.com</p>
        <p>This invoice was sent electronically and is valid without a signature.</p>
      </div>
    </body>
    </html>
  `;
}
