# KIMU Document Template - Quick Reference

## 🚀 Quick Start

### Print an Invoice
```typescript
// In your component
import DocumentPreview from '@/components/documents/DocumentPreview';

// Show preview modal
<DocumentPreview
  documentId="invoice-id-here"
  documentType="invoice"
  onClose={() => setShowPreview(false)}
/>
```

### Print a Quote
```typescript
<DocumentPreview
  documentId="quote-id-here"
  documentType="quote"
  onClose={() => setShowPreview(false)}
/>
```

### Generate Custom Document
```typescript
import { DocumentData, formatCurrency, formatDate } from '@/lib/document-generator';

const customDoc: DocumentData = {
  documentType: 'INVOICE',
  documentNumber: 'INV-123456',
  issueDate: formatDate(new Date()),
  dueDate: formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
  
  client: {
    name: 'Client Name',
    email: 'client@email.com',
  },
  
  items: [
    {
      description: 'Service/Product',
      quantity: 1,
      unitPrice: formatCurrency(100000),
      total: formatCurrency(100000),
    },
  ],
  
  subtotal: formatCurrency(100000),
  taxRate: 18,
  taxAmount: formatCurrency(18000),
  totalAmount: formatCurrency(118000),
  
  status: 'PENDING',
  showPaymentInfo: true,
  showTerms: true,
};

<DocumentPreview
  documentData={customDoc}
  onClose={() => setShowPreview(false)}
/>
```

## 📋 Document Types

| Type | Prefix | Use Case |
|------|--------|----------|
| `INVOICE` | INV | Billing clients |
| `QUOTE` | QUO | Price estimates |
| `RECEIPT` | REC | Payment confirmation |
| `PROFORMA INVOICE` | PRO | Preliminary invoice |

## 🎨 Status Badges

| Status | Color | When to Use |
|--------|-------|-------------|
| `PAID` | Green | Payment received |
| `PENDING` | Orange | Awaiting payment |
| `OVERDUE` | Red | Past due date |
| `DRAFT` | Gray | Not yet sent |
| `SENT` | Orange | Sent to client |
| `ACCEPTED` | Green | Quote accepted |
| `REJECTED` | Red | Quote rejected |

## 💰 Currency Formatting

```typescript
import { formatCurrency } from '@/lib/document-generator';

formatCurrency(5000000)  // "5,000,000 RWF"
formatCurrency(150.50)   // "151 RWF"
formatCurrency(0)        // "0 RWF"
```

## 📅 Date Formatting

```typescript
import { formatDate } from '@/lib/document-generator';

formatDate(new Date())                    // "28/11/2025"
formatDate('2025-11-28')                  // "28/11/2025"
formatDate(new Date('2025-12-25'))        // "25/12/2025"
```

## 🧮 Calculate Totals

```typescript
import { calculateTotals } from '@/lib/document-generator';

const items = [
  { quantity: 2, unitPrice: 100000 },
  { quantity: 1, unitPrice: 50000 },
];

const totals = calculateTotals(items, 18, 10000);
// Returns:
// {
//   subtotal: 250000,
//   taxAmount: 45000,
//   discount: 10000,
//   total: 285000
// }
```

## 🔢 Generate Document Numbers

```typescript
import { generateDocumentNumber } from '@/lib/document-generator';

generateDocumentNumber('INVOICE', 1)      // "INV-000001"
generateDocumentNumber('QUOTE', 123)      // "QUO-000123"
generateDocumentNumber('RECEIPT', 9999)   // "REC-009999"
```

## 🏦 Payment Information

The template automatically includes:
- **COPEDU Bank**: Account #10110/2016/4888
- **Equity Bank**: Account #4019201113204
- **BK Bank**: Account #100 1953 787 26
- **Mobile Money**: MOMO PAY 627939

Control visibility with `showPaymentInfo: true/false`

## 📝 Common Patterns

### Invoice with Tax
```typescript
const invoice: DocumentData = {
  documentType: 'INVOICE',
  documentNumber: generateDocumentNumber('INVOICE', nextId),
  issueDate: formatDate(new Date()),
  dueDate: formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
  client: { name: 'Client Name', email: 'email@example.com' },
  items: [...],
  subtotal: formatCurrency(subtotal),
  taxRate: 18,
  taxAmount: formatCurrency(taxAmount),
  totalAmount: formatCurrency(total),
  status: 'PENDING',
  showPaymentInfo: true,
  showTerms: true,
  paymentTerms: 30,
};
```

### Quote without Tax
```typescript
const quote: DocumentData = {
  documentType: 'QUOTE',
  documentNumber: generateDocumentNumber('QUOTE', nextId),
  issueDate: formatDate(new Date()),
  validUntil: formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
  client: { name: 'Client Name', email: 'email@example.com' },
  items: [...],
  subtotal: formatCurrency(total),
  totalAmount: formatCurrency(total),
  status: 'DRAFT',
  showPaymentInfo: false,
  showTerms: true,
};
```

### Receipt (Simple)
```typescript
const receipt: DocumentData = {
  documentType: 'RECEIPT',
  documentNumber: generateDocumentNumber('RECEIPT', nextId),
  issueDate: formatDate(new Date()),
  client: { name: 'Client Name' },
  items: [
    {
      description: 'Payment for Invoice INV-123456',
      quantity: 1,
      unitPrice: formatCurrency(amount),
      total: formatCurrency(amount),
    },
  ],
  subtotal: formatCurrency(amount),
  totalAmount: formatCurrency(amount),
  status: 'PAID',
  notes: 'Payment received via Bank Transfer',
  showPaymentInfo: false,
  showTerms: false,
};
```

## 🖨️ Print Actions

### Direct Print
```typescript
const handlePrint = async (id: string, type: 'invoice' | 'quote') => {
  const response = await fetch(`/api/documents/generate?type=${type}&id=${id}`);
  const html = await response.text();
  
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }
};
```

### Show Preview First
```typescript
const [previewDoc, setPreviewDoc] = useState<{id: string, type: string} | null>(null);

// Show preview
setPreviewDoc({ id: invoiceId, type: 'invoice' });

// In render
{previewDoc && (
  <DocumentPreview
    documentId={previewDoc.id}
    documentType={previewDoc.type as any}
    onClose={() => setPreviewDoc(null)}
  />
)}
```

## 🎯 Tips

1. **Always use helpers** - Use `formatCurrency()` and `formatDate()` for consistency
2. **Calculate totals** - Use `calculateTotals()` to avoid math errors
3. **Validate data** - Check required fields before generating
4. **Test print** - Always preview before sending to clients
5. **Handle errors** - Wrap API calls in try-catch blocks

## 📞 Support

- **Email**: kimutransport5@gmail.com
- **Phone**: +250 788 284 312 / +250 788 447 574

---

**KIMU Transport & Multiservices** - Your Trusted Travel Partner
