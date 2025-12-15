# KIMU Official Document Template System

Professional document generation system for KIMU Transport & Multiservices invoices, quotes, and receipts.

## 📁 Files

- **Template**: `src/templates/document-template.html` - HTML template with KIMU branding
- **Generator**: `src/lib/document-generator.ts` - TypeScript utilities for document generation
- **API Route**: `src/app/api/documents/generate/route.ts` - Server-side document generation endpoint

## 🎨 Features

### Professional Design
- **KIMU Branding**: Orange (#FF8C00) color scheme matching company identity
- **Responsive Layout**: Works on desktop, tablet, and mobile devices
- **Print-Optimized**: Clean print styles for physical documents
- **Modern Typography**: Professional fonts and spacing

### Document Types
- **Invoices**: Full invoices with payment terms and due dates
- **Quotes**: Quotations with validity periods
- **Receipts**: Payment receipts
- **Proforma Invoices**: Preliminary invoices

### Included Sections
- ✅ Company header with logo
- ✅ Document information (number, date, due date)
- ✅ Client/recipient details
- ✅ Service description
- ✅ Itemized list with quantities and prices
- ✅ Subtotal, tax, discount, and total calculations
- ✅ Status badges (Paid, Pending, Overdue, Draft)
- ✅ Payment information (bank accounts, mobile money)
- ✅ Notes section
- ✅ Terms and conditions
- ✅ Professional footer

## 🚀 Usage

### 1. Using the API Route

#### Generate from Database Record

```typescript
// GET request to generate document from existing invoice/quote
const response = await fetch('/api/documents/generate?type=invoice&id=123');
const html = await response.text();

// Display in iframe or new window
const iframe = document.createElement('iframe');
iframe.srcdoc = html;
document.body.appendChild(iframe);

// Or open in new window for printing
const printWindow = window.open('', '_blank');
printWindow?.document.write(html);
printWindow?.document.close();
printWindow?.print();
```

#### Generate from Custom Data

```typescript
import { DocumentData } from '@/lib/document-generator';

const documentData: DocumentData = {
  documentType: 'INVOICE',
  documentNumber: 'INV-593250',
  issueDate: '28/11/2025',
  dueDate: '28/12/2025',
  
  client: {
    name: 'Eric Ndayambaje',
    email: 'valery.ossoh@gmail.com',
  },
  
  items: [
    {
      description: 'BYD Electric Vehicle',
      quantity: 1,
      unitPrice: '5,000,000 RWF',
      total: '5,000,000 RWF',
    },
  ],
  
  subtotal: '5,000,000 RWF',
  taxRate: 18,
  taxAmount: '900,000 RWF',
  totalAmount: '5,900,000 RWF',
  
  status: 'PENDING',
  showPaymentInfo: true,
  showTerms: true,
  paymentTerms: 30,
};

const response = await fetch('/api/documents/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(documentData),
});

const result = await response.json();
console.log(result.html); // Generated HTML
```

### 2. Using the Generator Utility

```typescript
import {
  formatCurrency,
  formatDate,
  calculateTotals,
  generateDocumentNumber,
  createSampleInvoice,
} from '@/lib/document-generator';

// Format currency
const price = formatCurrency(5000000); // "5,000,000 RWF"

// Format date
const date = formatDate(new Date()); // "28/11/2025"

// Calculate totals
const items = [
  { quantity: 1, unitPrice: 5000000 },
  { quantity: 2, unitPrice: 150000 },
];
const totals = calculateTotals(items, 18); // 18% tax
// Returns: { subtotal: 5300000, taxAmount: 954000, discount: 0, total: 6254000 }

// Generate document number
const invoiceNumber = generateDocumentNumber('INVOICE', 593250); // "INV-593250"
const quoteNumber = generateDocumentNumber('QUOTE', 1234); // "QUO-001234"

// Create sample invoice
const sampleInvoice = createSampleInvoice();
```

### 3. Direct Template Usage

```typescript
import fs from 'fs';
import path from 'path';
import { generateDocumentSync, DocumentData } from '@/lib/document-generator';

// Load template
const templatePath = path.join(process.cwd(), 'src', 'templates', 'document-template.html');
const templateHtml = fs.readFileSync(templatePath, 'utf-8');

// Generate document
const documentData: DocumentData = { /* ... */ };
const html = generateDocumentSync(documentData, templateHtml);

// Save to file or send as response
fs.writeFileSync('invoice.html', html);
```

## 📋 Document Data Structure

```typescript
interface DocumentData {
  // Required
  documentType: 'INVOICE' | 'QUOTE' | 'RECEIPT' | 'PROFORMA INVOICE';
  documentNumber: string;
  issueDate: string; // Format: DD/MM/YYYY
  client: {
    name: string;
    address?: string;
    email?: string;
    phone?: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: string; // Formatted with currency
    total: string; // Formatted with currency
  }>;
  subtotal: string;
  totalAmount: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE' | 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED';
  
  // Optional
  dueDate?: string; // For invoices
  validUntil?: string; // For quotes
  taxRate?: number; // Percentage
  taxAmount?: string;
  discount?: string;
  serviceDescription?: string;
  notes?: string;
  paymentTerms?: number; // Days
  showPaymentInfo?: boolean; // Default: true
  showTerms?: boolean; // Default: true
}
```

## 🎯 Examples

### Invoice Example

```typescript
const invoice: DocumentData = {
  documentType: 'INVOICE',
  documentNumber: 'INV-593250',
  issueDate: '28/11/2025',
  dueDate: '28/12/2025',
  
  client: {
    name: 'Eric Ndayambaje',
    email: 'valery.ossoh@gmail.com',
  },
  
  items: [
    {
      description: 'BYD Electric Vehicle',
      quantity: 1,
      unitPrice: '5,000,000 RWF',
      total: '5,000,000 RWF',
    },
  ],
  
  subtotal: '5,000,000 RWF',
  taxRate: 18,
  taxAmount: '900,000 RWF',
  totalAmount: '5,900,000 RWF',
  
  status: 'PENDING',
  serviceDescription: 'BYD Electric Vehicle Purchase',
  showPaymentInfo: true,
  showTerms: true,
  paymentTerms: 30,
};
```

### Quote Example

```typescript
const quote: DocumentData = {
  documentType: 'QUOTE',
  documentNumber: 'QUO-001234',
  issueDate: '28/11/2025',
  validUntil: '28/12/2025',
  
  client: {
    name: 'ABC Company Ltd',
    email: 'contact@abccompany.rw',
    phone: '+250 788 123 456',
    address: 'Kigali, Rwanda',
  },
  
  items: [
    {
      description: 'Airport Transfer - Kigali to Rubavu',
      quantity: 2,
      unitPrice: '150,000 RWF',
      total: '300,000 RWF',
    },
    {
      description: 'City Tour - Full Day',
      quantity: 1,
      unitPrice: '200,000 RWF',
      total: '200,000 RWF',
    },
  ],
  
  subtotal: '500,000 RWF',
  taxRate: 18,
  taxAmount: '90,000 RWF',
  totalAmount: '590,000 RWF',
  
  status: 'SENT',
  notes: 'This quote is valid for 30 days from the issue date.',
  showPaymentInfo: false, // Don't show payment info on quotes
  showTerms: true,
};
```

### Receipt Example

```typescript
const receipt: DocumentData = {
  documentType: 'RECEIPT',
  documentNumber: 'REC-000456',
  issueDate: '28/11/2025',
  
  client: {
    name: 'John Doe',
    email: 'john.doe@email.com',
  },
  
  items: [
    {
      description: 'Payment for Invoice INV-593250',
      quantity: 1,
      unitPrice: '5,900,000 RWF',
      total: '5,900,000 RWF',
    },
  ],
  
  subtotal: '5,900,000 RWF',
  totalAmount: '5,900,000 RWF',
  
  status: 'PAID',
  notes: 'Payment received via Bank Transfer - COPEDU Bank',
  showPaymentInfo: false,
  showTerms: false,
};
```

## 🖨️ Printing and PDF Generation

### Print from Browser

```typescript
// Generate document
const response = await fetch('/api/documents/generate?type=invoice&id=123');
const html = await response.text();

// Open in new window and print
const printWindow = window.open('', '_blank');
if (printWindow) {
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.print();
  };
}
```

### Generate PDF (Server-Side)

For PDF generation, you can use libraries like `puppeteer` or `playwright`:

```typescript
import puppeteer from 'puppeteer';

async function generatePDF(documentData: DocumentData) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Generate HTML
  const html = generateDocumentSync(documentData, templateHtml);
  
  // Set content and generate PDF
  await page.setContent(html);
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20px',
      right: '20px',
      bottom: '20px',
      left: '20px',
    },
  });
  
  await browser.close();
  return pdf;
}
```

## 🎨 Customization

### Modify Template

Edit `src/templates/document-template.html` to customize:
- Colors and branding
- Layout and spacing
- Sections and content
- Styles and fonts

### Add Custom Fields

1. Add placeholder in template: `{{CUSTOM_FIELD}}`
2. Add to `DocumentData` interface in `document-generator.ts`
3. Add to replacements in `replaceTemplateVariables` function

### Conditional Sections

Use conditional blocks in template:

```html
{{#if CUSTOM_FIELD}}
  <div>{{CUSTOM_FIELD}}</div>
{{/if}}
```

Then add to conditions in `handleConditionals` function.

## 📝 Best Practices

1. **Always format currency** using `formatCurrency()` helper
2. **Always format dates** using `formatDate()` helper
3. **Calculate totals** using `calculateTotals()` for consistency
4. **Generate document numbers** using `generateDocumentNumber()` for proper formatting
5. **Validate data** before generating documents
6. **Handle errors** gracefully with try-catch blocks
7. **Test print output** before sending to clients

## 🔧 Integration with Existing System

### Update Invoice Manager

```typescript
// In InvoiceManager.tsx or similar component
const handlePrintInvoice = async (invoiceId: string) => {
  try {
    const response = await fetch(`/api/documents/generate?type=invoice&id=${invoiceId}`);
    const html = await response.text();
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    }
  } catch (error) {
    console.error('Error printing invoice:', error);
    toast.error('Failed to print invoice');
  }
};
```

### Update Quote Manager

```typescript
// In QuoteManager.tsx or similar component
const handlePrintQuote = async (quoteId: string) => {
  try {
    const response = await fetch(`/api/documents/generate?type=quote&id=${quoteId}`);
    const html = await response.text();
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    }
  } catch (error) {
    console.error('Error printing quote:', error);
    toast.error('Failed to print quote');
  }
};
```

## 📞 Support

For questions or issues with the document template system:
- Email: kimutransport5@gmail.com
- Phone: +250 788 284 312 / +250 788 447 574

---

**KIMU Transport & Multiservices** - Your Trusted Travel Partner
