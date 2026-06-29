"use client"

import { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaEdit, FaTrash, FaFileInvoiceDollar, FaEye, FaDownload, FaReceipt, FaTimes, FaUserPlus, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import jsPDF from 'jspdf';
import Image from 'next/image';
import { addWatermark } from '@/lib/pdfGenerator';

interface Invoice {
  id: number;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  amount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  grandTotal: number;
  dueDate: string;
  description: string;
  items: any[];
  status: string;
  emailSent: boolean;
  emailSentAt?: string;
  emailSubject?: string;
  emailMessage?: string;
  createdAt: string;
}

interface InvoiceManagerProps {
  onInvoiceCreated?: (invoice: Invoice) => void;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  outstanding: 'bg-red-100 text-red-800',
  paid: 'bg-green-100 text-green-800'
};

import DocumentPreview from '@/components/documents/DocumentPreview';

export default function InvoiceManager({ onInvoiceCreated }: InvoiceManagerProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [previewDocumentId, setPreviewDocumentId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    invoiceNumber: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    amount: '',
    taxRate: 0,
    dueDate: '',
    description: '',
    items: [{ description: '', quantity: 1, unitPrice: '', total: '' }],
    status: 'pending'
  });

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);

      const response = await fetch(`/api/accounting/invoices?${params}`);
      if (response.ok) {
        const data = await response.json();
        setInvoices(data);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}-${random}`;
  };

  const calculateTotals = (items: any[], taxRate: number) => {
    const amount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = 0;
    const grandTotal = amount;

    return { amount, taxAmount, grandTotal };
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = parseFloat(String(newItems[index].quantity)) || 0;
      const unitPrice = parseFloat(String(newItems[index].unitPrice)) || 0;
      newItems[index].total = (quantity * unitPrice).toFixed(2);
    }

    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unitPrice: '', total: '' }]
    });
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { amount, taxAmount, grandTotal } = calculateTotals(formData.items, formData.taxRate);

      // Validate that all items have required fields
      const hasEmptyItems = formData.items.some(item =>
        !item.description.trim() || !item.quantity || !item.unitPrice
      );

      if (hasEmptyItems) {
        alert('Please fill in all item details (description, quantity, and unit price)');
        setIsLoading(false);
        return;
      }

      if (amount <= 0) {
        alert('Invoice total must be greater than zero');
        setIsLoading(false);
        return;
      }

      const invoiceData = {
        invoiceNumber: formData.invoiceNumber,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone || undefined,
        amount: amount,
        taxRate: formData.taxRate,
        dueDate: new Date(formData.dueDate).toISOString(),
        description: formData.description,
        items: formData.items.map(item => ({
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          total: Number(item.total)
        })),
        status: formData.status
      };

      console.log('Sending invoice data:', invoiceData);

      const response = await fetch('/api/accounting/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData)
      });

      if (response.ok) {
        const newInvoice = await response.json();
        setInvoices([newInvoice, ...invoices]);
        onInvoiceCreated?.(newInvoice);
        resetForm();
        setShowAddModal(false);
        alert('Invoice created successfully!');
      } else {
        const errorData = await response.json();
        console.error('Invoice creation failed:', errorData);
        alert(`Failed to create invoice: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Failed to create invoice. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      invoiceNumber: generateInvoiceNumber(),
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      amount: '',
      taxRate: 0,
      dueDate: '',
      description: '',
      items: [{ description: '', quantity: 1, unitPrice: '', total: '' }],
      status: 'pending'
    });
    setEditingInvoice(null);
  };

  const totalAmount = calculateTotals(formData.items, formData.taxRate).amount;
  const totalInvoices = invoices.reduce((sum, invoice) => sum + invoice.grandTotal, 0);
  const paidInvoices = invoices.filter(invoice => invoice.status === 'paid').length;
  const outstandingInvoices = invoices.filter(invoice => invoice.status === 'outstanding').length;

  const generatePDF = async (invoice: Invoice) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Add Watermark
    addWatermark(doc);
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = 20;

    // Helper function to add text with word wrapping
    const addText = (text: string, x: number, y: number, options: any = {}) => {
      const maxWidth = pageWidth - x - margin;
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + (lines.length * (options.lineHeight || 5)) + (options.spacing || 5);
    };

    // Helper function to draw a line
    const drawLine = (x1: number, y1: number, x2: number, y2: number, color: string = '#f97316') => {
      doc.setDrawColor(249, 115, 22);
      doc.line(x1, y1, x2, y2);
    };

    // Helper function to add a colored rectangle
    const addColoredRect = (x: number, y: number, width: number, height: number, color: string = '#f97316') => {
      doc.setFillColor(249, 115, 22);
      doc.rect(x, y, width, height, 'F');
    };

    // Helper function to add a light background rectangle
    const addLightRect = (x: number, y: number, width: number, height: number) => {
      doc.setFillColor(248, 250, 252);
      doc.rect(x, y, width, height, 'F');
    };

    // Header with branding - White background with orange line
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, 30, 'F');

    // KIMU Logo - Use existing logo image
    try {
      // Add the logo image from public folder
      const logoImg = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new window.Image();
        img.src = '/logo.png';
        img.onload = () => resolve(img);
        img.onerror = reject;
      });
      doc.addImage(logoImg, 'PNG', margin + 2, 8, 8, 8);
    } catch (error) {
      // Fallback to simple text if image fails to load
      doc.setTextColor(249, 115, 22); // Orange
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('KIMU', margin + 2, 12);
    }

    // KIMU text
    doc.setTextColor(249, 115, 22); // Orange
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('KIMU', margin + 10, 9);

    doc.setFontSize(6);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text('Transport & Multiservices', margin + 10, 14);
    doc.text('Your Trusted Travel Partner', margin + 10, 18);

    // Invoice title and details on the right
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth - margin - 25, 9);

    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, pageWidth - margin - 25, 15);
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, pageWidth - margin - 25, 20);
    doc.text(`Due: ${new Date(invoice.dueDate).toLocaleDateString()}`, pageWidth - margin - 25, 25);

    // Orange separator line
    drawLine(margin, 26, pageWidth - margin, 26);
    yPosition = 32;

    // Company and client information section
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('From:', margin, yPosition);

    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text('KIMU Transport & Multiservices', margin, yPosition + 6);
    doc.text('Gisozi, KG 780 St, Kigali, Rwanda', margin, yPosition + 10);
    doc.text('Email: kimutransport6@gmail.com', margin, yPosition + 14);
    doc.text('Phone: +250 792 958 752', margin, yPosition + 18);

    // Client Information
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', pageWidth / 2, yPosition);

    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.clientName, pageWidth / 2, yPosition + 6);
    doc.text(invoice.clientEmail, pageWidth / 2, yPosition + 10);
    if (invoice.clientPhone) {
      doc.text(invoice.clientPhone, pageWidth / 2, yPosition + 14);
    }

    yPosition += 30;

    // Service Description
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Service Description:', margin, yPosition);

    addLightRect(margin, yPosition + 2, pageWidth - 2 * margin, 8);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    yPosition = addText(invoice.description, margin + 2, yPosition + 5, { lineHeight: 2, spacing: 1 });
    yPosition += 5;

    // Items table header
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Items:', margin, yPosition);
    yPosition += 5;

    // Table header with light orange background
    doc.setFillColor(254, 215, 170); // Light orange
    doc.rect(margin, yPosition - 2, pageWidth - 2 * margin, 8, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('Description', margin + 2, yPosition + 1);
    doc.text('Qty', margin + 60, yPosition + 1);
    doc.text('Unit Price', margin + 80, yPosition + 1);
    doc.text('Total', margin + 120, yPosition + 1);
    yPosition += 8;

    // Table rows
    invoice.items.forEach((item: any, index: number) => {
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(5);
      doc.setFont('helvetica', 'normal');

      doc.text(item.description, margin + 2, yPosition + 1);
      doc.text(item.quantity.toString(), margin + 60, yPosition + 1);
      doc.text(`${item.unitPrice.toLocaleString()} RWF`, margin + 80, yPosition + 1);
      doc.text(`${item.total.toLocaleString()} RWF`, margin + 120, yPosition + 1);
      yPosition += 5;
    });

    yPosition += 5;

    // Totals section - right aligned
    const totalsX = pageWidth - 70;
    const totalsWidth = 50;

    // Subtotal
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', totalsX, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.text(`${invoice.totalAmount.toLocaleString()} RWF`, totalsX + 20, yPosition);
    yPosition += 4;



    // Grand Total with light orange background
    doc.setFillColor(254, 215, 170); // Light orange
    doc.rect(totalsX - 2, yPosition - 2, totalsWidth + 4, 8, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Amount:', totalsX, yPosition + 1);
    doc.text(`${invoice.grandTotal.toLocaleString()} RWF`, totalsX + 20, yPosition + 1);
    yPosition += 10;

    // Status and footer section
    drawLine(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Status badge
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text('Status: ', margin, yPosition);

    // Status badge background
    const statusColor = invoice.status === 'paid' ? [34, 197, 94] :
      invoice.status === 'outstanding' ? [239, 68, 68] :
        [245, 158, 11];
    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.rect(margin + 15, yPosition - 1, 15, 4, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(4);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.status.toUpperCase(), margin + 16, yPosition + 1);

    // Thank you message on the right
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for choosing KIMU!', pageWidth - margin - 50, yPosition);
    doc.text('For inquiries, contact us at kimutransport6@gmail.com', pageWidth - margin - 50, yPosition + 4);

    yPosition += 10;

    // Check if we need a new page for the footer
    if (yPosition + 100 > pageHeight - margin) {
      doc.addPage();
      yPosition = margin + 20;
    }

    // Payment information section with card-like styling
    drawLine(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Payment info card background with rounded corners effect
    doc.setFillColor(248, 250, 252); // Light gray background
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 50, 'F');

    // Add subtle border
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 50);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Information:', margin + 8, yPosition + 7);

    doc.setFontSize(5);
    doc.setFont('helvetica', 'normal');

    // Bank Accounts in three columns
    const col1X = margin + 8;
    const col2X = margin + 50;
    const col3X = margin + 92;

    // Row 1
    // COPEDU Bank
    doc.setFont('helvetica', 'bold');
    doc.text('COPEDU Bank:', col1X, yPosition + 12);
    doc.setFont('helvetica', 'normal');
    doc.text('Account: KIMU Transport & Multiservices Ltd', col1X, yPosition + 16);
    doc.text('Account #: 1011020164888', col1X, yPosition + 20);

    // Equity Bank
    doc.setFont('helvetica', 'bold');
    doc.text('Equity Bank:', col2X, yPosition + 12);
    doc.setFont('helvetica', 'normal');
    doc.text('Account: KIMU Transport Multiservices Ltd', col2X, yPosition + 16);
    doc.text('Account #: 4019201132304', col2X, yPosition + 20);

    // BK Bank
    doc.setFont('helvetica', 'bold');
    doc.text('BK Bank:', col3X, yPosition + 12);
    doc.setFont('helvetica', 'normal');
    doc.text('Account: KIMU Transport Multiservices Ltd', col3X, yPosition + 16);
    doc.text('Account #: 100185378726', col3X, yPosition + 20);

    // Row 2
    const row2Y = yPosition + 26;

    // BANK OF AFRICA
    doc.setFont('helvetica', 'bold');
    doc.text('BANK OF AFRICA:', col1X, row2Y);
    doc.setFont('helvetica', 'normal');
    doc.text('Account: KIMU Transport & Multiservices Ltd', col1X, row2Y + 4);
    doc.text('Account #: 1002100203435401', col1X, row2Y + 8);

    // Access BANK
    doc.setFont('helvetica', 'bold');
    doc.text('Access BANK:', col2X, row2Y);
    doc.setFont('helvetica', 'normal');
    doc.text('Account: KIMU Transport & Multiservices Ltd', col2X, row2Y + 4);
    doc.text('Account #: 01766750009', col2X, row2Y + 8);

    // Mobile Money section with separator line
    doc.setDrawColor(200, 200, 200);
    doc.line(margin + 8, yPosition + 38, pageWidth - margin - 8, yPosition + 38);

    doc.setFont('helvetica', 'bold');
    doc.text('Mobile Money:', margin + 8, yPosition + 42);
    doc.text('MOMO PAY: 627309', margin + 8, yPosition + 46);
    doc.setFont('helvetica', 'normal');
    doc.text('Kimu Transport', margin + 50, yPosition + 46);

    // Save the PDF
    doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
  };

  const generateReceipt = async (invoice: Invoice) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Add Watermark
    addWatermark(doc);
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = 20;

    // Helper function to add text with word wrapping
    const addText = (text: string, x: number, y: number, options: any = {}) => {
      const maxWidth = pageWidth - x - margin;
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + (lines.length * (options.lineHeight || 5)) + (options.spacing || 5);
    };

    // Helper function to draw a line
    const drawLine = (x1: number, y1: number, x2: number, y2: number, color: string = '#16a34a') => { // Green color
      doc.setDrawColor(22, 163, 74);
      doc.line(x1, y1, x2, y2);
    };

    // Helper function to add a colored rectangle
    const addColoredRect = (x: number, y: number, width: number, height: number, color: string = '#16a34a') => {
      doc.setFillColor(22, 163, 74);
      doc.rect(x, y, width, height, 'F');
    };

    // Helper function to add a light background rectangle
    const addLightRect = (x: number, y: number, width: number, height: number) => {
      doc.setFillColor(240, 253, 244); // Light green
      doc.rect(x, y, width, height, 'F');
    };

    // Header with branding - White background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, 30, 'F');

    // KIMU Logo
    try {
      const logoImg = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new window.Image();
        img.src = '/logo.png';
        img.onload = () => resolve(img);
        img.onerror = reject;
      });
      doc.addImage(logoImg, 'PNG', margin + 2, 8, 8, 8);
    } catch (error) {
      doc.setTextColor(22, 163, 74); // Green
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('KIMU', margin + 2, 12);
    }

    // KIMU text
    doc.setTextColor(22, 163, 74); // Green
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('KIMU', margin + 10, 9);

    doc.setFontSize(6);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text('Transport & Multiservices', margin + 10, 14);
    doc.text('Your Trusted Travel Partner', margin + 10, 18);

    // Receipt details on the right
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT RECEIPT', pageWidth - margin - 35, 9);

    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text(`Receipt #: REC-${invoice.invoiceNumber.replace('INV-', '')}`, pageWidth - margin - 35, 15);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin - 35, 20);
    doc.text(`Invoice Ref: ${invoice.invoiceNumber}`, pageWidth - margin - 35, 25);

    // Green separator line
    drawLine(margin, 26, pageWidth - margin, 26);
    yPosition = 32;

    // Company and client information section
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('From:', margin, yPosition);

    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text('KIMU Transport & Multiservices', margin, yPosition + 6);
    doc.text('Gisozi, KG 780 St, Kigali, Rwanda', margin, yPosition + 10);
    doc.text('Email: kimutransport6@gmail.com', margin, yPosition + 14);
    doc.text('Phone: +250 792 958 752', margin, yPosition + 18);

    // Client Information
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Received From:', pageWidth / 2, yPosition);

    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.clientName, pageWidth / 2, yPosition + 6);
    doc.text(invoice.clientEmail, pageWidth / 2, yPosition + 10);
    if (invoice.clientPhone) {
      doc.text(invoice.clientPhone, pageWidth / 2, yPosition + 14);
    }

    yPosition += 30;

    // Payment Details
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Details:', margin, yPosition);

    addLightRect(margin, yPosition + 2, pageWidth - 2 * margin, 15);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text(`Payment for: ${invoice.description}`, margin + 2, yPosition + 6);
    doc.text(`Payment Method: Bank Transfer / Mobile Money`, margin + 2, yPosition + 10);

    yPosition += 20;

    // Items table header
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Items Paid:', margin, yPosition);
    yPosition += 5;

    // Table header with light green background
    doc.setFillColor(220, 252, 231); // Light green
    doc.rect(margin, yPosition - 2, pageWidth - 2 * margin, 8, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('Description', margin + 2, yPosition + 1);
    doc.text('Qty', margin + 60, yPosition + 1);
    doc.text('Unit Price', margin + 80, yPosition + 1);
    doc.text('Total', margin + 120, yPosition + 1);
    yPosition += 8;

    // Table rows
    invoice.items.forEach((item: any, index: number) => {
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(5);
      doc.setFont('helvetica', 'normal');

      doc.text(item.description, margin + 2, yPosition + 1);
      doc.text(item.quantity.toString(), margin + 60, yPosition + 1);
      doc.text(`${item.unitPrice.toLocaleString()} RWF`, margin + 80, yPosition + 1);
      doc.text(`${item.total.toLocaleString()} RWF`, margin + 120, yPosition + 1);
      yPosition += 5;
    });

    yPosition += 5;

    // Totals section - right aligned
    const totalsX = pageWidth - 70;
    const totalsWidth = 50;

    // Subtotal
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', totalsX, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.text(`${invoice.totalAmount.toLocaleString()} RWF`, totalsX + 20, yPosition);
    yPosition += 4;



    // Amount Paid with light green background
    doc.setFillColor(220, 252, 231); // Light green
    doc.rect(totalsX - 2, yPosition - 2, totalsWidth + 4, 8, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('Amount Paid:', totalsX, yPosition + 1);
    doc.text(`${invoice.grandTotal.toLocaleString()} RWF`, totalsX + 20, yPosition + 1);
    yPosition += 10;

    // Balance Due
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('Balance Due:', totalsX, yPosition);
    doc.text('0 RWF', totalsX + 20, yPosition);

    yPosition += 10;

    // Status and footer section
    drawLine(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // PAID Stamp
    doc.setTextColor(22, 163, 74); // Green
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PAID', margin, yPosition + 2);

    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`Payment Date: ${new Date().toLocaleDateString()}`, margin + 20, yPosition + 2);

    // Thank you message on the right
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for your business!', pageWidth - margin - 50, yPosition);
    doc.text('This is a computer generated receipt.', pageWidth - margin - 50, yPosition + 4);

    // Save the PDF
    doc.save(`receipt-${invoice.invoiceNumber}.pdf`);
  };



  const deleteInvoice = async (invoiceId: number) => {
    if (!confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/accounting/invoices?id=${invoiceId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Invoice deleted successfully!');
        // Remove the invoice from the local state
        setInvoices(invoices.filter(invoice => invoice.id !== invoiceId));
        // Close any open modals
        setSelectedInvoice(null);
      } else {
        const error = await response.json();
        alert(`Failed to delete invoice: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('Failed to delete invoice. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExcelExport = async () => {
    const { exportToExcel } = await import('@/utils/excelExport');
    
    const columns = [
      { header: 'Date', key: 'createdAt', type: 'date' as const },
      { header: 'Invoice Number', key: 'invoiceNumber', type: 'text' as const },
      { header: 'Client Name', key: 'clientName', type: 'text' as const },
      { header: 'Client Email', key: 'clientEmail', type: 'text' as const },
      { header: 'Due Date', key: 'dueDate', type: 'date' as const },
      { header: 'Status', key: 'status', type: 'text' as const },
      { header: 'Amount (RWF)', key: 'grandTotal', type: 'number' as const, numFormat: '#,##0" RWF"' }
    ];

    const data = invoices.map(item => ({
      ...item,
      status: item.status.toUpperCase(),
      createdAt: item.createdAt.split('T')[0],
      dueDate: item.dueDate.split('T')[0]
    }));

    await exportToExcel({
      filename: `Invoice_Report_${new Date().toISOString().split('T')[0]}`,
      sheetName: 'Invoices',
      title: 'Invoice Manager Report',
      subtitle: `Generated on ${new Date().toLocaleDateString()} | Total Invoices: ${invoices.length}`,
      columns,
      data,
      summaryRow: {
        status: 'Total',
        grandTotal: { formula: '=SUM(G{start}:G{end})' }
      }
    });
  };

  return (
    <>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-template, #invoice-template * {
            visibility: visible;
          }
          #invoice-template {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none;
            border: none;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Invoice Manager</h3>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="outstanding">Outstanding</option>
              <option value="paid">Paid</option>
            </select>
            <button
              onClick={handleExcelExport}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
            >
              <FaDownload /> Export Excel
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <FaPlus /> New Invoice
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Total Invoices</div>
            <div className="text-2xl font-bold text-blue-700">
              {totalInvoices.toLocaleString()} RWF
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Paid Invoices</div>
            <div className="text-2xl font-bold text-green-700">{paidInvoices}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-sm text-red-600 font-medium">Outstanding</div>
            <div className="text-2xl font-bold text-red-700">{invoices.filter(invoice => invoice.status === 'outstanding').length}</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-sm text-yellow-600 font-medium">Total Count</div>
            <div className="text-2xl font-bold text-yellow-700">{invoices.length}</div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Loading invoices...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No invoices found
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.clientName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {invoice.clientEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.grandTotal.toLocaleString()} RWF
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[invoice.status as keyof typeof statusColors]}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedInvoice(invoice)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => {
                          setPreviewDocumentId(invoice.id.toString());
                          setShowDocumentPreview(true);
                        }}
                        className="text-green-600 hover:text-green-900 mr-3"
                        title="Preview & Print"
                      >
                        <FaFileInvoiceDollar />
                      </button>
                      <button
                        onClick={() => setEditingInvoice(invoice)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => deleteInvoice(invoice.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-12 animate-fadeIn overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden transform transition-all scale-100 my-8">
              {/* Header with Gradient */}
              <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-orange-600 to-amber-600">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <FaFileInvoiceDollar className="text-white text-lg" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
                      </h3>
                      <p className="text-sm text-orange-100 mt-0.5">
                        {editingInvoice ? `Updating invoice ${formData.invoiceNumber}` : 'Generate a new professional invoice for your client'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* General Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-orange-600 uppercase tracking-wider">
                    <FaFileInvoiceDollar />
                    General Information
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Invoice Number</label>
                      <input
                        type="text"
                        required
                        value={formData.invoiceNumber}
                        onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all hover:border-gray-300 font-mono"
                        placeholder="INV-2023-001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date</label>
                      <input
                        type="date"
                        required
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all hover:border-gray-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Client Information Section */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-orange-600 uppercase tracking-wider">
                    <FaUserPlus />
                    Client Information
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Client Name</label>
                      <input
                        type="text"
                        required
                        value={formData.clientName}
                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all hover:border-gray-300"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Client Email</label>
                      <input
                        type="email"
                        required
                        value={formData.clientEmail}
                        onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all hover:border-gray-300"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Client Phone</label>
                      <input
                        type="tel"
                        value={formData.clientPhone}
                        onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all hover:border-gray-300"
                        placeholder="+250 7XX XXX XXX"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Service Description / Project Title</label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all hover:border-gray-300 resize-none"
                      placeholder="e.g. Website Development for Q4"
                    />
                  </div>
                </div>

                {/* Invoice Items Section */}
                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm font-bold text-orange-600 uppercase tracking-wider">
                      <FaReceipt />
                      Billable Items
                    </div>
                    <button
                      type="button"
                      onClick={addItem}
                      className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-600 border border-orange-100 rounded-lg hover:bg-orange-100 transition-colors text-sm font-bold uppercase tracking-wider"
                    >
                      <FaPlus className="text-xs" /> Add Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="hidden md:grid grid-cols-12 gap-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <div className="col-span-6">Description</div>
                      <div className="col-span-1 text-center">Qty</div>
                      <div className="col-span-2 text-right">Unit Price</div>
                      <div className="col-span-2 text-right">Total</div>
                      <div className="col-span-1"></div>
                    </div>
                    {formData.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-3 items-start md:items-center bg-gray-50 p-3 md:p-1 rounded-2xl md:bg-transparent md:border-b md:border-gray-100 md:pb-3">
                        <div className="col-span-12 md:col-span-6">
                          <label className="md:hidden text-xs font-bold text-gray-400 uppercase mb-1 block">Description</label>
                          <input
                            type="text"
                            placeholder="e.g. Domain Registration"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            className="w-full px-4 py-2 bg-white border-2 border-gray-100 rounded-xl focus:border-orange-500 outline-none transition-all text-sm font-medium"
                          />
                        </div>
                        <div className="col-span-4 md:col-span-1">
                          <label className="md:hidden text-xs font-bold text-gray-400 uppercase mb-1 block">Qty</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-2 bg-white border-2 border-gray-100 rounded-xl focus:border-orange-500 outline-none transition-all text-sm text-center font-bold"
                          />
                        </div>
                        <div className="col-span-7 md:col-span-2">
                          <label className="md:hidden text-xs font-bold text-gray-400 uppercase mb-1 block">Unit Price (RWF)</label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full px-4 py-2 bg-white border-2 border-gray-100 rounded-xl focus:border-orange-500 outline-none transition-all text-sm text-right font-bold"
                          />
                        </div>
                        <div className="col-span-11 md:col-span-2">
                          <label className="md:hidden text-xs font-bold text-gray-400 uppercase mb-1 block">Total</label>
                          <div className="w-full px-4 py-2 bg-gray-100/50 border-2 border-transparent rounded-xl text-sm text-right font-black text-gray-700">
                            {item.total.toLocaleString()}
                          </div>
                        </div>
                        <div className="col-span-1 flex justify-center">
                          {formData.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Remove Item"
                            >
                              <FaTrash className="text-sm" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals Section */}
                <div className="bg-orange-50/50 p-6 rounded-2xl border-2 border-orange-100/50">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] mb-3">Invoice Summary</label>
                      <p className="text-xs text-orange-700 font-medium leading-relaxed">
                        Values are calculated automatically based on items and tax rate. {editingInvoice ? 'Updating this will override existing totals.' : ''}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">Tax Rate (%)</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          value={formData.taxRate}
                          onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                          className="w-full px-4 py-3 bg-white border-2 border-orange-100 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-bold text-gray-900"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-400 font-black">%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <span>Subtotal:</span>
                        <span>{totalAmount.toLocaleString()} RWF</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-orange-200">
                        <span className="text-xs font-black text-orange-800 uppercase">Grand Total:</span>
                        <span className="text-xl font-black text-orange-600">
                          {calculateTotals(formData.items, formData.taxRate).grandTotal.toLocaleString()} <span className="text-[10px]">RWF</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 font-black uppercase tracking-widest transition-all active:scale-95"
                  >
                    Discard Changes
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-[2] px-6 py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-2xl shadow-xl shadow-orange-500/30 hover:from-orange-700 hover:to-amber-700 font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {isLoading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaCheckCircle className="text-lg" />
                        {editingInvoice ? 'Update & Finalize' : 'Generate Invoice'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Invoice View Modal */}
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-12 animate-fadeIn overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden transform transition-all scale-100 my-8">
              {/* Header with Gradient */}
              <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-orange-600 to-amber-600 no-print">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <FaEye className="text-white text-lg" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Invoice Details</h3>
                      <p className="text-sm text-orange-100 mt-0.5">
                        {selectedInvoice.invoiceNumber} • {selectedInvoice.clientName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.print()}
                      className="px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all flex items-center gap-2 text-sm font-bold uppercase tracking-wider backdrop-blur-sm"
                    >
                      <FaDownload className="text-xs" /> Quick Print
                    </button>
                    <button
                      onClick={() => {
                        setPreviewDocumentId(selectedInvoice.id.toString());
                        setShowDocumentPreview(true);
                      }}
                      className="px-4 py-2 bg-white text-orange-600 rounded-xl hover:bg-orange-50 transition-all flex items-center gap-2 text-sm font-bold uppercase tracking-wider"
                    >
                      <FaFileInvoiceDollar /> Advanced Preview
                    </button>
                    {selectedInvoice.status === 'paid' && (
                      <button
                        onClick={() => generateReceipt(selectedInvoice)}
                        className="px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all flex items-center gap-2 text-sm font-bold uppercase tracking-wider shadow-lg shadow-emerald-500/20"
                      >
                        <FaReceipt /> Get Receipt
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (selectedInvoice && confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
                          deleteInvoice(selectedInvoice.id);
                        }
                      }}
                      className="p-2.5 bg-red-500/10 text-red-100 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                      title="Delete Invoice"
                    >
                      <FaTrash className="text-lg" />
                    </button>
                    <div className="w-px h-8 bg-white/20 mx-1"></div>
                    <button
                      onClick={() => setSelectedInvoice(null)}
                      className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all"
                    >
                      <FaTimes className="text-xl" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-8">
                {/* Branded Invoice Template */}
                <div id="invoice-template" className="bg-white border-2 border-gray-100 p-8 rounded-3xl shadow-sm">
                  {/* Header with Branding */}
                  <div className="flex justify-between items-start mb-10 pb-8 border-b-4 border-orange-500">
                    <div className="flex items-center space-x-6">
                      <div className="p-4 bg-orange-50 rounded-2xl">
                        <Image src="/logo.png" alt="KIMU Logo" width={80} height={80} className="w-20 h-20 object-contain" unoptimized />
                      </div>
                      <div>
                        <h1 className="text-4xl font-extrabold text-orange-600 tracking-tight">KIMU</h1>
                        <p className="text-xl font-bold text-gray-700">Transport & Multiservices</p>
                        <p className="text-sm font-medium text-gray-400 mt-1 uppercase tracking-[0.2em]">Your Trusted Travel Partner</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-block px-4 py-1 bg-orange-600 text-white rounded-full text-xs font-black uppercase tracking-widest mb-4">
                        OFFICIAL INVOICE
                      </div>
                      <h2 className="text-2xl font-black text-gray-800 mb-1">{selectedInvoice.invoiceNumber}</h2>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Date: <span className="text-gray-900 ml-2">{new Date(selectedInvoice.createdAt).toLocaleDateString()}</span></p>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Due: <span className="text-orange-600 ml-2">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Company Information */}
                  <div className="grid grid-cols-2 gap-12 mb-10">
                    <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Issued By:</h3>
                      <div className="text-gray-700">
                        <p className="font-extrabold text-xl mb-1">KIMU Transport & Multiservices</p>
                        <div className="space-y-1 text-sm font-medium">
                          <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span> Gisozi, KG 780 St, Kigali, Rwanda</p>
                          <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span> kimutransport6@gmail.com</p>
                          <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span> +250 792 958 752</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-orange-50/30 p-6 rounded-2xl border border-orange-100">
                      <h3 className="text-xs font-black text-orange-400 uppercase tracking-widest mb-4">Issued To:</h3>
                      <div className="text-gray-700">
                        <p className="font-extrabold text-xl mb-1">{selectedInvoice.clientName}</p>
                        <div className="space-y-1 text-sm font-medium">
                          <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span> {selectedInvoice.clientEmail}</p>
                          {selectedInvoice.clientPhone && (
                            <p className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span> {selectedInvoice.clientPhone}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Service Description */}
                  <div className="mb-10">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Service Overview:</h3>
                    <div className="text-gray-800 bg-gray-50 p-5 rounded-2xl border-l-4 border-orange-500 font-medium leading-relaxed italic">
                      "{selectedInvoice.description}"
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="mb-10 overflow-hidden rounded-2xl border border-gray-100">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-orange-600">
                          <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-widest">Description</th>
                          <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-widest">Qty</th>
                          <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-widest">Unit Price</th>
                          <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-widest">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedInvoice.items.map((item: any, index: number) => (
                          <tr key={index} className="hover:bg-orange-50/30 transition-colors">
                            <td className="px-6 py-4 text-sm font-bold text-gray-700">{item.description}</td>
                            <td className="px-6 py-4 text-center text-sm font-black text-gray-500">{item.quantity}</td>
                            <td className="px-6 py-4 text-right text-sm font-bold text-gray-700">{item.unitPrice.toLocaleString()} <span className="text-[10px]">RWF</span></td>
                            <td className="px-6 py-4 text-right text-sm font-black text-orange-600">{item.total.toLocaleString()} <span className="text-[10px]">RWF</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals and Summary */}
                  <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10">
                    <div className="w-full md:flex-1">
                      <div className="bg-orange-50/50 p-6 rounded-2xl border border-orange-100">
                        <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-4">Status & Notes</h4>
                        <div className="flex items-center gap-4 mb-4">
                          <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${selectedInvoice.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                            selectedInvoice.status === 'outstanding' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                            {selectedInvoice.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed">
                          Please include the invoice number <span className="font-bold text-gray-800">{selectedInvoice.invoiceNumber}</span> in your payment reference. Payment is due within the specified period.
                        </p>
                      </div>
                    </div>
                    <div className="w-full md:w-80">
                      <div className="space-y-3 p-2">
                        <div className="flex justify-between items-center text-sm font-bold text-gray-500 py-1 uppercase tracking-wider">
                          <span>Subtotal:</span>
                          <span>{selectedInvoice.totalAmount.toLocaleString()} RWF</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold text-gray-500 py-1 uppercase tracking-wider">
                          <span>Tax ({selectedInvoice.taxRate}%):</span>
                          <span>{selectedInvoice.taxAmount.toLocaleString()} RWF</span>
                        </div>
                        <div className="flex justify-between items-center py-5 px-6 bg-orange-600 text-white rounded-2xl shadow-xl shadow-orange-600/20 mt-4">
                          <span className="text-sm font-black uppercase tracking-[0.2em]">Grand Total:</span>
                          <span className="text-2xl font-black">{selectedInvoice.grandTotal.toLocaleString()} <span className="text-xs">RWF</span></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="bg-gray-900 text-white p-8 rounded-3xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                      <FaReceipt /> Official Banking Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      <div className="space-y-1">
                        <p className="text-orange-400 text-xs font-black uppercase tracking-wider">COPEDU Bank</p>
                        <p className="text-sm font-bold truncate">KIMU Transport & Multiservices Ltd</p>
                        <p className="font-mono text-lg text-white/90 font-black">1011020164888</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-orange-400 text-xs font-black uppercase tracking-wider">Equity Bank</p>
                        <p className="text-sm font-bold truncate">KIMU Transport Multiservices Ltd</p>
                        <p className="font-mono text-lg text-white/90 font-black">4019201132304</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-orange-400 text-xs font-black uppercase tracking-wider">BK Bank</p>
                        <p className="text-sm font-bold truncate">KIMU Transport Multiservices Ltd</p>
                        <p className="font-mono text-lg text-white/90 font-black">100185378726</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-orange-400 text-xs font-black uppercase tracking-wider">BANK OF AFRICA</p>
                        <p className="text-sm font-bold truncate">KIMU Transport & Multiservices Ltd</p>
                        <p className="font-mono text-lg text-white/90 font-black">1002100203435401</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-orange-400 text-xs font-black uppercase tracking-wider">Access BANK</p>
                        <p className="text-sm font-bold truncate">KIMU Transport & Multiservices Ltd</p>
                        <p className="font-mono text-lg text-white/90 font-black">01766750009</p>
                      </div>
                      <div className="space-y-1 bg-white/5 p-4 rounded-xl">
                        <p className="text-emerald-400 text-xs font-black uppercase tracking-wider">Mobile Money</p>
                        <div className="flex justify-between items-center pt-1">
                          <div>
                            <p className="text-[10px] text-white/50 uppercase">Momo Pay</p>
                            <p className="font-black text-xl">627309</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-white/50 uppercase">Merchant</p>
                            <p className="font-bold text-xs">Kimu Transport</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-10 pt-8 border-t border-gray-100 flex justify-between items-center text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                    <p>Generated by KIMU Management System</p>
                    <p>© {new Date().getFullYear()} KIMU Multiservices Ltd</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Document Preview Modal */}
        {showDocumentPreview && previewDocumentId && (
          <DocumentPreview
            documentId={previewDocumentId}
            documentType="invoice"
            onClose={() => {
              setShowDocumentPreview(false);
              setPreviewDocumentId(null);
            }}
          />
        )}
      </div>
    </>
  );
}
