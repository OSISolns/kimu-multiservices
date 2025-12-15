import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withValidation } from '@/lib/api';
import { z } from 'zod';

const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  clientName: z.string().min(1, 'Client name is required'),
  clientEmail: z.string().email('Valid email is required'),
  clientPhone: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  taxRate: z.number().min(0).max(100).default(0), // Default to 0% tax
  dueDate: z.string().datetime(),
  description: z.string().min(1, 'Description is required'),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
    total: z.number().positive()
  })),
  status: z.enum(['pending', 'outstanding', 'paid']).default('pending')
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let whereClause: any = {};

    if (status) {
      whereClause.status = status;
    }

    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export const POST = withValidation(invoiceSchema, async (req, validatedData) => {
  try {
    console.log('Creating invoice with data:', validatedData);

    const taxAmount = 0;
    const grandTotal = validatedData.amount;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: validatedData.invoiceNumber,
        clientName: validatedData.clientName,
        clientEmail: validatedData.clientEmail,
        clientPhone: validatedData.clientPhone,
        amount: validatedData.amount,
        taxRate: validatedData.taxRate,
        taxAmount: taxAmount,
        totalAmount: validatedData.amount,
        grandTotal: grandTotal,
        dueDate: new Date(validatedData.dueDate),
        description: validatedData.description,
        items: validatedData.items,
        status: validatedData.status
      }
    });

    console.log('Invoice created successfully:', invoice);
    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({
      error: 'Failed to create invoice',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
});

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const invoiceId = searchParams.get('id');

    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    const invoiceIdNumber = parseInt(invoiceId);
    if (isNaN(invoiceIdNumber)) {
      return NextResponse.json({ error: 'Invalid invoice ID' }, { status: 400 });
    }

    // Check if invoice exists
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: invoiceIdNumber }
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Delete the invoice
    await prisma.invoice.delete({
      where: { id: invoiceIdNumber }
    });

    return NextResponse.json({
      success: true,
      message: 'Invoice deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json({
      error: 'Failed to delete invoice',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    const invoiceId = parseInt(id);
    if (isNaN(invoiceId)) {
      return NextResponse.json({ error: 'Invalid invoice ID' }, { status: 400 });
    }

    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: invoiceId }
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Recalculate totals if amount or taxRate changes
    let dataToUpdate = { ...updateData };
    if (updateData.amount !== undefined || updateData.taxRate !== undefined) {
      const amount = updateData.amount !== undefined ? updateData.amount : existingInvoice.amount;
      const taxRate = updateData.taxRate !== undefined ? updateData.taxRate : existingInvoice.taxRate;
      const taxAmount = 0;
      const grandTotal = amount;

      dataToUpdate.amount = amount;
      dataToUpdate.taxRate = taxRate;
      dataToUpdate.taxAmount = taxAmount;
      dataToUpdate.totalAmount = amount;
      dataToUpdate.grandTotal = grandTotal;
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: dataToUpdate
    });

    return NextResponse.json(updatedInvoice);

  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json({
      error: 'Failed to update invoice',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
