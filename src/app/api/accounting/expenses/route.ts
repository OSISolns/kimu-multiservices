import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withValidation } from '@/lib/api';
import { z } from 'zod';

const expenseSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.number().positive('Amount must be positive'),
  category: z.enum(['fuel', 'maintenance', 'insurance', 'salaries', 'wages', 'utilities', 'office', 'marketing', 'traffic_tickets', 'other']),
  paymentMethod: z.enum(['MTN Momo', 'Equity Bank', 'BK Bank', 'Bank of Africa', 'Access Bank', 'COPEDU', 'Cash']),
  date: z.string().min(1, 'Date is required'),
  receiptNumber: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const category = searchParams.get('category');

    let whereClause: any = {};

    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    if (category) {
      whereClause.category = category;
    }

    const expenses = await prisma.expense.findMany({
      where: whereClause,
      orderBy: { date: 'desc' }
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export const POST = withValidation(expenseSchema, async (req, validatedData) => {
  try {
    console.log('Creating expense with data:', validatedData);

    // Clean up empty strings for optional fields
    const cleanData = {
      ...validatedData,
      date: new Date(validatedData.date),
      receiptNumber: validatedData.receiptNumber || undefined,
      notes: validatedData.notes || undefined
    };

    const expense = await prisma.expense.create({
      data: cleanData
    });

    console.log('Expense created successfully:', expense);
    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
});

export const PUT = withValidation(expenseSchema, async (req, validatedData) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Expense ID is required' }, { status: 400 });
    }

    // Clean up empty strings for optional fields
    const cleanData = {
      ...validatedData,
      date: new Date(validatedData.date),
      receiptNumber: validatedData.receiptNumber || undefined,
      notes: validatedData.notes || undefined
    };

    const expense = await prisma.expense.update({
      where: { id: parseInt(id) },
      data: cleanData
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 });
  }
});

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Expense ID is required' }, { status: 400 });
    }

    await prisma.expense.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
}
