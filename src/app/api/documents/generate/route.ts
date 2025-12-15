import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import {
    DocumentData,
    DocumentItem,
    generateDocumentSync,
    formatCurrency,
    formatDate,
    calculateTotals,
    generateDocumentNumber,
} from '@/lib/document-generator';

/**
 * POST /api/documents/generate
 * Generate a document (invoice, quote, receipt) from template
 */
export async function POST(request: NextRequest) {
    try {
        const data: DocumentData = await request.json();

        // Validate required fields
        if (!data.documentType || !data.documentNumber || !data.client?.name || !data.items?.length) {
            return NextResponse.json(
                { error: 'Missing required fields: documentType, documentNumber, client.name, and items are required' },
                { status: 400 }
            );
        }

        // Load template from file system
        const templatePath = path.join(process.cwd(), 'src', 'templates', 'document-template.html');
        const templateHtml = fs.readFileSync(templatePath, 'utf-8');

        // Load logo and convert to base64
        try {
            const logoPath = path.join(process.cwd(), 'public', 'logo.png');
            if (fs.existsSync(logoPath)) {
                const logoBuffer = fs.readFileSync(logoPath);
                const base64Logo = logoBuffer.toString('base64');
                data.logoDataUrl = `data:image/png;base64,${base64Logo}`;
            }
        } catch (error) {
            console.error('Error loading logo for embedding:', error);
            // Continue without logo embedding, will fall back to URL
        }

        // Generate document HTML
        const documentHtml = generateDocumentSync(data, templateHtml);

        return NextResponse.json({
            success: true,
            html: documentHtml,
            documentNumber: data.documentNumber,
            documentType: data.documentType,
        });

    } catch (error) {
        console.error('Error generating document:', error);
        return NextResponse.json(
            { error: 'Failed to generate document', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/documents/generate?type=invoice&id=123
 * Generate a document from database record
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const type = searchParams.get('type') as 'invoice' | 'quote' | 'receipt';
        const idParam = searchParams.get('id');

        if (!type || !idParam) {
            return NextResponse.json(
                { error: 'Missing required parameters: type and id' },
                { status: 400 }
            );
        }

        const id = parseInt(idParam, 10);
        if (isNaN(id)) {
            return NextResponse.json(
                { error: 'Invalid id parameter' },
                { status: 400 }
            );
        }

        // Import prisma here to avoid edge runtime issues
        const { prisma } = await import('@/lib/prisma');

        let documentData: DocumentData | null = null;

        // Fetch data based on type
        if (type === 'invoice') {
            const invoice = await prisma.invoice.findUnique({
                where: { id },
            });

            if (!invoice) {
                return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
            }

            // Cast items from JSON
            let items: DocumentItem[] = [];
            if (Array.isArray(invoice.items)) {
                items = (invoice.items as any) as DocumentItem[];
            }

            // Convert to DocumentData
            documentData = {
                documentType: 'INVOICE',
                documentNumber: invoice.invoiceNumber,
                issueDate: formatDate(invoice.createdAt),
                dueDate: invoice.dueDate ? formatDate(invoice.dueDate) : undefined,

                client: {
                    name: invoice.clientName,
                    email: invoice.clientEmail,
                    phone: invoice.clientPhone || undefined,
                    address: undefined, // Address not in Invoice model
                },

                items: items.map(item => ({
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: formatCurrency(parseFloat(item.unitPrice.toString().replace(/[^0-9.-]+/g, ''))), // Ensure it's a number first if needed, but assuming it matches DocumentItem
                    total: formatCurrency(parseFloat(item.total.toString().replace(/[^0-9.-]+/g, ''))),
                })),

                subtotal: formatCurrency(invoice.amount),
                taxRate: invoice.taxRate,
                taxAmount: formatCurrency(invoice.taxAmount),
                totalAmount: formatCurrency(invoice.totalAmount),

                status: invoice.status.toUpperCase() as any,
                serviceDescription: invoice.description,
                notes: undefined,

                showPaymentInfo: true,
                showTerms: false,
                paymentTerms: 30,
            };

        } else if (type === 'quote') {
            const quote = await prisma.quote.findUnique({
                where: { id },
                include: {
                    customer: true,
                },
            });

            if (!quote) {
                return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
            }

            // Convert to DocumentData
            documentData = {
                documentType: 'QUOTE',
                documentNumber: `QUO-${String(quote.id).padStart(6, '0')}`, // Generate ID as it's not in DB
                issueDate: formatDate(quote.createdAt),
                validUntil: quote.validUntil ? formatDate(quote.validUntil) : undefined,

                client: {
                    name: quote.customer.name,
                    email: quote.customer.email || undefined,
                    phone: quote.customer.contact || undefined,
                    address: quote.customer.location || undefined,
                },

                // Quote model doesn't have items, so we create one from the service type
                items: [{
                    description: quote.serviceType,
                    quantity: 1,
                    unitPrice: formatCurrency(quote.amount),
                    total: formatCurrency(quote.amount),
                }],

                subtotal: formatCurrency(quote.amount),
                taxRate: 0, // Not specified in Quote model
                taxAmount: formatCurrency(0),
                totalAmount: formatCurrency(quote.amount),

                status: quote.status.toUpperCase() as any,
                notes: quote.notes || undefined,

                showPaymentInfo: false,
                showTerms: true,
                paymentTerms: 30,
            };
        }

        if (!documentData) {
            return NextResponse.json({ error: 'Unsupported document type' }, { status: 400 });
        }

        // Load template and generate
        const templatePath = path.join(process.cwd(), 'src', 'templates', 'document-template.html');
        const templateHtml = fs.readFileSync(templatePath, 'utf-8');

        // Load logo and convert to base64
        try {
            const logoPath = path.join(process.cwd(), 'public', 'logo.png');
            if (fs.existsSync(logoPath)) {
                const logoBuffer = fs.readFileSync(logoPath);
                const base64Logo = logoBuffer.toString('base64');
                documentData.logoDataUrl = `data:image/png;base64,${base64Logo}`;
            }
        } catch (error) {
            console.error('Error loading logo for embedding:', error);
        }

        const documentHtml = generateDocumentSync(documentData, templateHtml);

        // Return HTML directly for preview/download
        return new NextResponse(documentHtml, {
            headers: {
                'Content-Type': 'text/html',
                'Content-Disposition': `inline; filename="${documentData.documentNumber}.html"`,
            },
        });

    } catch (error) {
        console.error('Error generating document from database:', error);
        return NextResponse.json(
            { error: 'Failed to generate document', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
