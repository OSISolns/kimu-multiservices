# KIMU Official Document Template System - Summary

## 📦 What Was Created

A complete, professional document generation system for KIMU Transport & Multiservices that can generate invoices, quotes, receipts, and proforma invoices with consistent branding and formatting.

## 📁 Files Created

### 1. **Template File**
- **Location**: `src/templates/document-template.html`
- **Purpose**: HTML template with KIMU branding (orange color scheme)
- **Features**: 
  - Responsive design
  - Print-optimized
  - Professional layout matching your uploaded invoice
  - Conditional sections (payment info, terms, notes)
  - Dynamic item lists

### 2. **TypeScript Generator**
- **Location**: `src/lib/document-generator.ts`
- **Purpose**: Utilities for generating documents programmatically
- **Exports**:
  - `DocumentData` interface
  - `formatCurrency()` - Format numbers as RWF
  - `formatDate()` - Format dates as DD/MM/YYYY
  - `calculateTotals()` - Calculate subtotal, tax, total
  - `generateDocumentNumber()` - Generate INV-XXXXXX, QUO-XXXXXX, etc.
  - `generateDocument()` - Main generation function
  - `createSampleInvoice()` - Example helper

### 3. **API Route**
- **Location**: `src/app/api/documents/generate/route.ts`
- **Endpoints**:
  - `POST /api/documents/generate` - Generate from custom data
  - `GET /api/documents/generate?type=invoice&id=123` - Generate from database
- **Features**:
  - Server-side rendering
  - Database integration with Prisma
  - Error handling
  - Returns HTML ready for display/print

### 4. **React Component**
- **Location**: `src/components/documents/DocumentPreview.tsx`
- **Purpose**: Modal component for previewing and printing documents
- **Features**:
  - Live preview in iframe
  - Print button
  - Download as HTML
  - Loading and error states
  - Clean, professional UI

### 5. **Documentation**
- **Location**: `.docs/DOCUMENT_TEMPLATE_GUIDE.md`
- **Content**: Complete guide with examples, API reference, integration instructions
- **Location**: `.docs/DOCUMENT_TEMPLATE_QUICK_REF.md`
- **Content**: Quick reference with code snippets and common patterns

### 6. **Sample Invoice**
- **Location**: `public/sample-invoice.html`
- **Purpose**: Visual example of generated invoice (based on your uploaded image)
- **Access**: Can be viewed at `http://localhost:3000/sample-invoice.html`

## 🎨 Design Features

### Branding
- **Primary Color**: Orange (#FF8C00) - matches KIMU brand
- **Accent Color**: Light orange (#FFD699) - for table headers and totals
- **Typography**: Segoe UI (professional, readable)
- **Logo**: Placeholder (uses your existing `/logo.png`)

### Layout Sections
1. **Header**: Company logo + document info (number, date, due date)
2. **Parties**: From (KIMU) + To (Client)
3. **Service Description**: Optional description field
4. **Items Table**: Description, Qty, Unit Price, Total
5. **Totals**: Subtotal, Tax, Discount, Total
6. **Status Badge**: Visual status indicator
7. **Payment Information**: All bank accounts and mobile money
8. **Notes**: Optional notes section
9. **Terms & Conditions**: Standard terms

### Responsive Design
- Desktop: Full layout with side-by-side sections
- Tablet: Adjusted spacing
- Mobile: Stacked layout
- Print: Optimized for A4 paper

## 🚀 How to Use

### Quick Start (3 Steps)

#### 1. Import the Component
```typescript
import DocumentPreview from '@/components/documents/DocumentPreview';
```

#### 2. Add State
```typescript
const [showPreview, setShowPreview] = useState(false);
const [previewDoc, setPreviewDoc] = useState<{id: string, type: string} | null>(null);
```

#### 3. Render Modal
```typescript
{previewDoc && (
  <DocumentPreview
    documentId={previewDoc.id}
    documentType={previewDoc.type as 'invoice' | 'quote'}
    onClose={() => setPreviewDoc(null)}
  />
)}
```

### Integration Examples

#### In Invoice Manager
```typescript
// Add print button
<button onClick={() => setPreviewDoc({ id: invoice.id, type: 'invoice' })}>
  Print Invoice
</button>
```

#### In Quote Manager
```typescript
// Add print button
<button onClick={() => setPreviewDoc({ id: quote.id, type: 'quote' })}>
  Print Quote
</button>
```

#### Generate Custom Receipt
```typescript
import { DocumentData, formatCurrency, formatDate } from '@/lib/document-generator';

const receipt: DocumentData = {
  documentType: 'RECEIPT',
  documentNumber: 'REC-000123',
  issueDate: formatDate(new Date()),
  client: { name: 'Client Name' },
  items: [{
    description: 'Payment for Invoice INV-123456',
    quantity: 1,
    unitPrice: formatCurrency(5900000),
    total: formatCurrency(5900000),
  }],
  subtotal: formatCurrency(5900000),
  totalAmount: formatCurrency(5900000),
  status: 'PAID',
  showPaymentInfo: false,
  showTerms: false,
};

<DocumentPreview documentData={receipt} onClose={() => setShowPreview(false)} />
```

## 📊 Document Types Supported

| Type | Prefix | Shows Payment Info | Shows Due Date | Shows Valid Until |
|------|--------|-------------------|----------------|-------------------|
| Invoice | INV | ✅ Yes | ✅ Yes | ❌ No |
| Quote | QUO | ❌ No | ❌ No | ✅ Yes |
| Receipt | REC | ❌ No | ❌ No | ❌ No |
| Proforma | PRO | ✅ Yes | ✅ Yes | ❌ No |

## 💡 Key Features

### Automatic Calculations
```typescript
const totals = calculateTotals(
  [{ quantity: 1, unitPrice: 5000000 }],
  18,  // 18% tax
  0    // no discount
);
// Returns: { subtotal: 5000000, taxAmount: 900000, total: 5900000 }
```

### Consistent Formatting
```typescript
formatCurrency(5000000)  // "5,000,000 RWF"
formatDate(new Date())   // "28/11/2025"
```

### Smart Document Numbers
```typescript
generateDocumentNumber('INVOICE', 593250)  // "INV-593250"
generateDocumentNumber('QUOTE', 1)         // "QUO-000001"
```

### Status Badges
- **PAID** → Green badge
- **PENDING** → Orange badge
- **OVERDUE** → Red badge
- **DRAFT** → Gray badge

## 🏦 Payment Information Included

The template automatically includes all KIMU payment methods:

- **COPEDU Bank**: 10110/2016/4888
- **Equity Bank**: 4019201113204
- **BK Bank**: 100 1953 787 26
- **Mobile Money**: MOMO PAY 627939

Control visibility with `showPaymentInfo: true/false`

## 🔧 Customization

### Change Colors
Edit `src/templates/document-template.html`:
```css
/* Primary brand color */
.company-details h1 { color: #FF8C00; }

/* Table header background */
.items-table thead { background: #FFD699; }

/* Status badge */
.status-badge.pending { background: #FFA500; }
```

### Add Custom Fields
1. Add placeholder in template: `{{CUSTOM_FIELD}}`
2. Add to `DocumentData` interface
3. Add to `replaceTemplateVariables()` function

### Modify Layout
Edit the HTML structure in `document-template.html` - all sections are clearly commented.

## 📝 Next Steps

### Recommended Integrations

1. **Update InvoiceManager.tsx**
   - Add "Print" button to invoice actions
   - Use `DocumentPreview` component

2. **Update QuoteManager.tsx**
   - Add "Print" button to quote actions
   - Use `DocumentPreview` component

3. **Add to Sales Dashboard**
   - Quick print from dashboard
   - Batch printing capability

4. **PDF Generation** (Optional)
   - Install `puppeteer` or `playwright`
   - Create PDF generation endpoint
   - Add "Download PDF" button

5. **Email Integration** (Future)
   - Generate HTML
   - Send via email service
   - Track sent documents

## 🎯 Testing

### View Sample Invoice
1. Start dev server: `npm run dev`
2. Open: `http://localhost:3000/sample-invoice.html`
3. Test print functionality

### Test API
```bash
# Test POST endpoint
curl -X POST http://localhost:3000/api/documents/generate \
  -H "Content-Type: application/json" \
  -d '{"documentType":"INVOICE","documentNumber":"TEST-001",...}'

# Test GET endpoint
curl http://localhost:3000/api/documents/generate?type=invoice&id=YOUR_INVOICE_ID
```

### Test Component
```typescript
// In any page
import DocumentPreview from '@/components/documents/DocumentPreview';
import { createSampleInvoice } from '@/lib/document-generator';

export default function TestPage() {
  const sample = createSampleInvoice();
  return <DocumentPreview documentData={sample} />;
}
```

## 📚 Documentation

- **Full Guide**: `.docs/DOCUMENT_TEMPLATE_GUIDE.md`
- **Quick Reference**: `.docs/DOCUMENT_TEMPLATE_QUICK_REF.md`
- **Sample**: `public/sample-invoice.html`

## ✅ Checklist

- [x] HTML template created with KIMU branding
- [x] TypeScript utilities for document generation
- [x] API routes for server-side generation
- [x] React component for preview/print
- [x] Complete documentation
- [x] Quick reference guide
- [x] Sample invoice for testing
- [ ] Integration with InvoiceManager (next step)
- [ ] Integration with QuoteManager (next step)
- [ ] PDF generation (optional)
- [ ] Email integration (optional)

## 🎉 Summary

You now have a complete, professional document generation system that:
- ✅ Matches KIMU branding perfectly
- ✅ Supports invoices, quotes, receipts, and proforma invoices
- ✅ Includes all payment information
- ✅ Is fully responsive and print-optimized
- ✅ Has TypeScript type safety
- ✅ Integrates with your existing database
- ✅ Provides easy-to-use React components
- ✅ Includes comprehensive documentation

**Ready to use immediately!** Just import `DocumentPreview` component and pass your invoice/quote ID.

---

**KIMU Transport & Multiservices** - Your Trusted Travel Partner