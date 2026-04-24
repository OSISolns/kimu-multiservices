import jsPDF from 'jspdf';
import { LOGO_BASE64 } from './logo-base64';

interface InvoiceData {
    invoiceNumber: string;
    clientName: string;
    clientEmail: string;
    date: string;
    dueDate: string;
    items: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        total: number;
    }>;
    subtotal: number;
    tax?: number;
    total: number;
    status: string;
}

interface QuoteData {
    quoteNumber: string;
    customerName: string;
    customerEmail: string;
    date: string;
    validUntil: string;
    serviceType: string;
    amount: number;
    notes?: string;
    status: string;
}

export const addWatermark = (doc: jsPDF) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const imgWidth = 100;
    const imgHeight = 100;
    const x = (pageWidth - imgWidth) / 2;
    const y = (pageHeight - imgHeight) / 2;

    // Save current state
    doc.saveGraphicsState();
    
    // Set transparency for watermark
    try {
        // @ts-ignore - jspdf types might be missing GState
        doc.setGState(new doc.GState({ opacity: 0.1 }));
    } catch (e) {
        // Fallback or ignore if GState is not available
    }

    doc.addImage(LOGO_BASE64, 'PNG', x, y, imgWidth, imgHeight, undefined, 'FAST');
    
    // Restore state
    doc.restoreGraphicsState();
};

export const generateInvoicePDF = (invoice: InvoiceData): jsPDF => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Add Watermark
    addWatermark(doc);

    // Header
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth / 2, 20, { align: 'center' });

    // Company Info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('KIMU Transport & Multiservices', 15, 35);
    doc.text('Kigali, Rwanda', 15, 40);
    doc.text('kimutransport6@gmail.com', 15, 45);
    doc.text('+250 792 958 752', 15, 50);
    doc.text('+250 792 958 752', 15, 55);

    // Invoice Details
    doc.setFont('helvetica', 'bold');
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, pageWidth - 15, 35, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${invoice.date}`, pageWidth - 15, 40, { align: 'right' });
    doc.text(`Due Date: ${invoice.dueDate}`, pageWidth - 15, 45, { align: 'right' });

    // Status Badge
    const statusColor = invoice.status === 'paid' ? [34, 197, 94] :
        invoice.status === 'overdue' ? [239, 68, 68] : [234, 179, 8];
    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.rect(pageWidth - 35, 48, 20, 6, 'F');
    doc.text(invoice.status.toUpperCase(), pageWidth - 25, 52, { align: 'center' });
    doc.setTextColor(0, 0, 0);

    // Client Info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 15, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.clientName, 15, 70);
    doc.text(invoice.clientEmail, 15, 75);

    // Line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 85, pageWidth - 15, 85);

    // Table Header
    let yPos = 95;
    doc.setFillColor(240, 240, 240);
    doc.rect(15, yPos - 5, pageWidth - 30, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Description', 20, yPos);
    doc.text('Qty', pageWidth - 80, yPos, { align: 'right' });
    doc.text('Unit Price', pageWidth - 55, yPos, { align: 'right' });
    doc.text('Total', pageWidth - 20, yPos, { align: 'right' });

    // Table Items
    doc.setFont('helvetica', 'normal');
    yPos += 10;
    invoice.items.forEach((item) => {
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
        doc.text(item.description, 20, yPos);
        doc.text(item.quantity.toString(), pageWidth - 80, yPos, { align: 'right' });
        doc.text(`RWF ${item.unitPrice.toLocaleString()}`, pageWidth - 55, yPos, { align: 'right' });
        doc.text(`RWF ${item.total.toLocaleString()}`, pageWidth - 20, yPos, { align: 'right' });
        yPos += 7;
    });

    // Line separator
    yPos += 5;
    doc.line(15, yPos, pageWidth - 15, yPos);

    // Totals
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', pageWidth - 70, yPos);
    doc.text(`RWF ${invoice.subtotal.toLocaleString()}`, pageWidth - 20, yPos, { align: 'right' });



    yPos += 7;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Total:', pageWidth - 70, yPos);
    doc.text(`RWF ${invoice.total.toLocaleString()}`, pageWidth - 20, yPos, { align: 'right' });

    // Payment Information
    yPos += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Information:', 15, yPos);

    yPos += 7;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');

    // Bank Details Columns
    const col1 = 15;
    const col2 = 80;
    const col3 = 145;

    // Row 1
    doc.setFont('helvetica', 'bold');
    doc.text('COPEDU Bank:', col1, yPos);
    doc.text('Equity Bank:', col2, yPos);
    doc.text('BK Bank:', col3, yPos);

    doc.setFont('helvetica', 'normal');
    yPos += 4;
    doc.text('Account: KIMU Transport & Multiservices Ltd', col1, yPos);
    doc.text('Account: KIMU Transport Multiservices Ltd', col2, yPos);
    doc.text('Account: KIMU Transport Multiservices Ltd', col3, yPos);

    yPos += 4;
    doc.text('Account #: 1011020164888', col1, yPos);
    doc.text('Account #: 4019201132304', col2, yPos);
    doc.text('Account #: 100185378726', col3, yPos);

    // Row 2
    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('BANK OF AFRICA:', col1, yPos);
    doc.text('Access BANK:', col2, yPos);

    doc.setFont('helvetica', 'normal');
    yPos += 4;
    doc.text('Account: KIMU Transport & Multiservices Ltd', col1, yPos);
    doc.text('Account: KIMU Transport & Multiservices Ltd', col2, yPos);

    yPos += 4;
    doc.text('Account #: 1002100203435401', col1, yPos);
    doc.text('Account #: 01766750009', col2, yPos);

    // Mobile Money
    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Mobile Money:', col1, yPos);
    doc.setFont('helvetica', 'normal');
    yPos += 4;
    doc.text('MOMO PAY: 627309 - Kimu Transport', col1, yPos);

    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for your business!', pageWidth / 2, 280, { align: 'center' });
    doc.text('For any questions, please contact us at info@kimutransport.com', pageWidth / 2, 285, { align: 'center' });

    return doc;
};

export const generateQuotePDF = (quote: QuoteData): jsPDF => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Add Watermark
    addWatermark(doc);

    // Header
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('QUOTATION', pageWidth / 2, 20, { align: 'center' });

    // Company Info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('KIMU Transport & Multiservices', 15, 35);
    doc.text('Kigali, Rwanda', 15, 40);
    doc.text('kimutransport6@gmail.com', 15, 45);
    doc.text('+250 792 958 752', 15, 50);
    doc.text('+250 792 958 752', 15, 55);

    // Quote Details
    doc.setFont('helvetica', 'bold');
    doc.text(`Quote #: ${quote.quoteNumber}`, pageWidth - 15, 35, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${quote.date}`, pageWidth - 15, 40, { align: 'right' });
    doc.text(`Valid Until: ${quote.validUntil}`, pageWidth - 15, 45, { align: 'right' });

    // Status Badge
    const statusColor = quote.status === 'accepted' ? [34, 197, 94] :
        quote.status === 'rejected' ? [239, 68, 68] : [59, 130, 246];
    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.rect(pageWidth - 35, 48, 20, 6, 'F');
    doc.text(quote.status.toUpperCase(), pageWidth - 25, 52, { align: 'center' });
    doc.setTextColor(0, 0, 0);

    // Customer Info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Prepared For:', 15, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(quote.customerName, 15, 70);
    doc.text(quote.customerEmail, 15, 75);

    // Line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 85, pageWidth - 15, 85);

    // Service Details
    let yPos = 100;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Service Details', 15, yPos);

    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Service Type:', 20, yPos);
    doc.text(quote.serviceType, 70, yPos);

    yPos += 10;
    doc.text('Description:', 20, yPos);
    if (quote.notes) {
        const lines = doc.splitTextToSize(quote.notes, pageWidth - 80);
        doc.text(lines, 70, yPos);
        yPos += lines.length * 5;
    }

    // Amount Box
    yPos += 20;
    doc.setFillColor(240, 240, 240);
    doc.rect(15, yPos - 5, pageWidth - 30, 25, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Quoted Amount:', 20, yPos + 5);
    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235);
    doc.text(`RWF ${quote.amount.toLocaleString()}`, pageWidth - 20, yPos + 5, { align: 'right' });
    doc.setTextColor(0, 0, 0);

    // Terms & Conditions
    yPos += 40;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Terms & Conditions:', 15, yPos);

    yPos += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const terms = [
        '1. This quotation is valid until the date specified above.',
        '2. Prices are subject to change without notice after the validity period.',
        '3. Payment terms: 50% deposit required to confirm booking.',
        '4. Cancellation policy applies as per our standard terms.',
        '5. Additional charges may apply for services not included in this quote.'
    ];

    terms.forEach(term => {
        doc.text(term, 20, yPos);
        yPos += 5;
    });

    // Payment Information
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Information:', 15, yPos);

    yPos += 7;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');

    // Bank Details Columns
    const col1 = 15;
    const col2 = 80;
    const col3 = 145;

    // Row 1
    doc.setFont('helvetica', 'bold');
    doc.text('COPEDU Bank:', col1, yPos);
    doc.text('Equity Bank:', col2, yPos);
    doc.text('BK Bank:', col3, yPos);

    doc.setFont('helvetica', 'normal');
    yPos += 4;
    doc.text('Account: KIMU Transport & Multiservices Ltd', col1, yPos);
    doc.text('Account: KIMU Transport Multiservices Ltd', col2, yPos);
    doc.text('Account: KIMU Transport Multiservices Ltd', col3, yPos);

    yPos += 4;
    doc.text('Account #: 1011020164888', col1, yPos);
    doc.text('Account #: 4019201132304', col2, yPos);
    doc.text('Account #: 100185378726', col3, yPos);

    // Row 2
    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('BANK OF AFRICA:', col1, yPos);
    doc.text('Access BANK:', col2, yPos);

    doc.setFont('helvetica', 'normal');
    yPos += 4;
    doc.text('Account: KIMU Transport & Multiservices Ltd', col1, yPos);
    doc.text('Account: KIMU Transport & Multiservices Ltd', col2, yPos);

    yPos += 4;
    doc.text('Account #: 1002100203435401', col1, yPos);
    doc.text('Account #: 01766750009', col2, yPos);

    // Mobile Money
    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Mobile Money:', col1, yPos);
    doc.setFont('helvetica', 'normal');
    yPos += 4;
    doc.text('MOMO PAY: 627309 - Kimu Transport', col1, yPos);

    // Footer
    yPos = 270;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for considering our services!', pageWidth / 2, yPos, { align: 'center' });
    doc.text('We look forward to working with you.', pageWidth / 2, yPos + 5, { align: 'center' });
    doc.text('For any questions, please contact us at info@kimutransport.com', pageWidth / 2, yPos + 10, { align: 'center' });

    return doc;
};

export const downloadPDF = (doc: jsPDF, filename: string) => {
    doc.save(filename);
};

export const getPDFBlob = (doc: jsPDF): Blob => {
    return doc.output('blob');
};

export const getPDFBase64 = (doc: jsPDF): string => {
    return doc.output('dataurlstring');
};
