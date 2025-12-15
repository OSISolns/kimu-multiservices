/**
 * KIMU Document Generator
 * Utility for generating professional invoices, quotes, and receipts
 */

export type DocumentType = 'INVOICE' | 'QUOTE' | 'RECEIPT' | 'PROFORMA INVOICE';

export type DocumentStatus = 'PAID' | 'PENDING' | 'OVERDUE' | 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'OUTSTANDING';

export interface DocumentItem {
    description: string;
    quantity: number;
    unitPrice: string; // Formatted with currency
    total: string; // Formatted with currency
}

export interface ClientInfo {
    name: string;
    address?: string;
    email?: string;
    phone?: string;
}

export interface DocumentData {
    // Document Info
    documentType: DocumentType;
    type?: 'invoice' | 'quote' | 'receipt'; // Lowercase version for API compatibility
    documentNumber: string;
    issueDate: string;
    dueDate?: string;
    validUntil?: string;

    // Client Info
    client: ClientInfo;

    // Items and Pricing
    items: DocumentItem[];
    subtotal: string;
    taxRate?: number;
    taxAmount?: string;
    discount?: string;
    totalAmount: string;

    // Status
    status: DocumentStatus;

    // Optional Fields
    serviceDescription?: string;
    notes?: string;
    paymentTerms?: number; // Days

    // Display Options
    showPaymentInfo?: boolean;
    showTerms?: boolean;
    logoDataUrl?: string;
}

/**
 * Format currency in RWF
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-RW', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount) + ' RWF';
}

/**
 * Format date to DD/MM/YYYY
 */
export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

/**
 * Get status CSS class
 */
function getStatusClass(status: DocumentStatus): string {
    const statusMap: Record<DocumentStatus, string> = {
        'PAID': 'paid',
        'PENDING': 'pending',
        'OVERDUE': 'overdue',
        'DRAFT': 'draft',
        'SENT': 'pending',
        'ACCEPTED': 'paid',
        'REJECTED': 'overdue',
        'OUTSTANDING': 'overdue',
    };
    return statusMap[status] || 'pending';
}

/**
 * Get recipient label based on document type
 */
function getRecipientLabel(documentType: DocumentType): string {
    if (documentType === 'QUOTE') return 'Quote For';
    if (documentType === 'RECEIPT') return 'Received From';
    return 'Bill To';
}

/**
 * Replace template variables with actual data
 */
function replaceTemplateVariables(template: string, data: DocumentData): string {
    let result = template;

    // Simple replacements
    const replacements: Record<string, string> = {
        '{{DOCUMENT_TYPE}}': data.documentType,
        '{{DOCUMENT_NUMBER}}': data.documentNumber,
        '{{ISSUE_DATE}}': data.issueDate,
        '{{CLIENT_NAME}}': data.client.name,
        '{{SUBTOTAL}}': data.subtotal,
        '{{TOTAL_AMOUNT}}': data.totalAmount,
        '{{STATUS}}': data.status,
        '{{STATUS_CLASS}}': getStatusClass(data.status),
        '{{RECIPIENT_LABEL}}': getRecipientLabel(data.documentType),
    };

    // Handle Logo
    if (data.logoDataUrl) {
        // If we have a data URL, replace the src attribute entirely
        result = result.replace(/src="\/logo\.png"/g, `src="${data.logoDataUrl}"`);
    }

    // Optional replacements
    if (data.dueDate) replacements['{{DUE_DATE}}'] = data.dueDate;
    if (data.validUntil) replacements['{{VALID_UNTIL}}'] = data.validUntil;
    if (data.client.address) replacements['{{CLIENT_ADDRESS}}'] = data.client.address;
    if (data.client.email) replacements['{{CLIENT_EMAIL}}'] = data.client.email;
    if (data.client.phone) replacements['{{CLIENT_PHONE}}'] = data.client.phone;
    if (data.serviceDescription) replacements['{{SERVICE_DESCRIPTION}}'] = data.serviceDescription;
    if (data.taxRate) replacements['{{TAX_RATE}}'] = data.taxRate.toString();
    if (data.taxAmount) replacements['{{TAX_AMOUNT}}'] = data.taxAmount;
    if (data.discount) replacements['{{DISCOUNT}}'] = data.discount;
    if (data.notes) replacements['{{NOTES}}'] = data.notes;
    if (data.paymentTerms) replacements['{{PAYMENT_TERMS}}'] = data.paymentTerms.toString();

    // Apply all replacements
    Object.entries(replacements).forEach(([key, value]) => {
        result = result.replace(new RegExp(key, 'g'), value);
    });

    // Handle conditional blocks
    result = handleConditionals(result, data);

    // Handle items loop
    result = handleItemsLoop(result, data.items);

    return result;
}

/**
 * Handle conditional blocks ({{#if CONDITION}}...{{/if}})
 */
function handleConditionals(template: string, data: DocumentData): string {
    let result = template;

    const conditions: Record<string, boolean> = {
        'DUE_DATE': !!data.dueDate,
        'VALID_UNTIL': !!data.validUntil,
        'CLIENT_ADDRESS': !!data.client.address,
        'CLIENT_EMAIL': !!data.client.email,
        'CLIENT_PHONE': !!data.client.phone,
        'SERVICE_DESCRIPTION': !!data.serviceDescription,
        'TAX_RATE': !!data.taxRate,
        'DISCOUNT': !!data.discount,
        'NOTES': !!data.notes,
        'SHOW_PAYMENT_INFO': data.showPaymentInfo !== false,
        'SHOW_TERMS': data.showTerms !== false,
    };

    Object.entries(conditions).forEach(([condition, shouldShow]) => {
        const ifPattern = new RegExp(`{{#if ${condition}}}([\\s\\S]*?){{/if}}`, 'g');
        if (shouldShow) {
            result = result.replace(ifPattern, '$1');
        } else {
            result = result.replace(ifPattern, '');
        }
    });

    return result;
}

/**
 * Handle items loop ({{#each ITEMS}}...{{/each}})
 */
function handleItemsLoop(template: string, items: DocumentItem[]): string {
    const loopPattern = /{{#each ITEMS}}([\s\S]*?){{\/each}}/;
    const match = template.match(loopPattern);

    if (!match) return template;

    const itemTemplate = match[1];
    const itemsHtml = items.map(item => {
        return itemTemplate
            .replace(/{{this\.description}}/g, item.description)
            .replace(/{{this\.quantity}}/g, item.quantity.toString())
            .replace(/{{this\.unitPrice}}/g, item.unitPrice)
            .replace(/{{this\.total}}/g, item.total);
    }).join('');

    return template.replace(loopPattern, itemsHtml);
}

/**
 * Generate HTML document from template
 */
export async function generateDocument(data: DocumentData): Promise<string> {
    // In a real implementation, you would load the template from the file system
    // For now, we'll use a fetch or import
    const templatePath = '/src/templates/document-template.html';

    try {
        // This would be loaded server-side in a real implementation
        const response = await fetch(templatePath);
        const template = await response.text();

        return replaceTemplateVariables(template, data);
    } catch (error) {
        console.error('Error loading template:', error);
        throw new Error('Failed to load document template');
    }
}

/**
 * Generate document HTML (server-side version using fs)
 */
export function generateDocumentSync(data: DocumentData, templateHtml: string): string {
    return replaceTemplateVariables(templateHtml, data);
}

/**
 * Calculate totals from items
 */
export function calculateTotals(
    items: Array<{ quantity: number; unitPrice: number }>,
    taxRate: number = 0,
    discountAmount: number = 0
): {
    subtotal: number;
    taxAmount: number;
    discount: number;
    total: number;
} {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount - discountAmount;

    return {
        subtotal,
        taxAmount,
        discount: discountAmount,
        total,
    };
}

/**
 * Generate document number
 */
export function generateDocumentNumber(
    type: DocumentType,
    sequenceNumber: number
): string {
    const prefix = {
        'INVOICE': 'INV',
        'QUOTE': 'QUO',
        'RECEIPT': 'REC',
        'PROFORMA INVOICE': 'PRO',
    }[type];

    const paddedNumber = String(sequenceNumber).padStart(6, '0');
    return `${prefix}-${paddedNumber}`;
}

/**
 * Example usage helper
 */
export function createSampleInvoice(): DocumentData {
    const items = [
        { quantity: 1, unitPrice: 5000000, description: 'BYD' }
    ];

    const totals = calculateTotals(items, 18);

    return {
        documentType: 'INVOICE',
        documentNumber: generateDocumentNumber('INVOICE', 593250),
        issueDate: formatDate(new Date('2025-11-28')),
        dueDate: formatDate(new Date('2025-12-28')),

        client: {
            name: 'Eric Ndayambaje',
            email: 'valery.ossoh@gmail.com',
        },

        items: items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: formatCurrency(item.unitPrice),
            total: formatCurrency(item.quantity * item.unitPrice),
        })),

        subtotal: formatCurrency(totals.subtotal),
        taxRate: 18,
        taxAmount: formatCurrency(totals.taxAmount),
        totalAmount: formatCurrency(totals.total),

        status: 'PENDING',
        serviceDescription: 'BYD',

        showPaymentInfo: true,
        showTerms: true,
        paymentTerms: 30,
    };
}
