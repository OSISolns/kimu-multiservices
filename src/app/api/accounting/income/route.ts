import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withValidation } from '@/lib/api';
import { z } from 'zod';

const incomeSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.number().positive('Amount must be positive'),
  category: z.enum(['car_rental', 'taxi_service', 'airport_transfer', 'hotel', 'car_sales', 'other']),
  paymentMethod: z.enum(['MTN Momo', 'Equity Bank', 'BK Bank', 'Cash']),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format"
  }),
  reference: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  clientName: z.string().optional().or(z.literal('')),
  clientPhone: z.string().optional().or(z.literal(''))
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

    const income = await prisma.income.findMany({
      where: whereClause,
      orderBy: { date: 'desc' }
    });

    return NextResponse.json(income);
  } catch (error) {
    console.error('Error fetching income:', error);
    return NextResponse.json({ error: 'Failed to fetch income' }, { status: 500 });
  }
}

export const POST = withValidation(incomeSchema, async (req, validatedData) => {
  try {
    // Clean up empty strings for optional fields
    const cleanData = {
      ...validatedData,
      date: new Date(validatedData.date),
      reference: validatedData.reference || undefined,
      notes: validatedData.notes || undefined,
      clientName: validatedData.clientName || undefined,
      clientPhone: validatedData.clientPhone || undefined
    };

    const income = await prisma.income.create({
      data: cleanData
    });

    return NextResponse.json(income, { status: 201 });
  } catch (error) {
    console.error('Error creating income:', error);
    return NextResponse.json({ error: 'Failed to create income' }, { status: 500 });
  }
});

export const PUT = withValidation(incomeSchema, async (req, validatedData) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Income ID is required' }, { status: 400 });
    }

    // Clean up empty strings for optional fields
    const cleanData = {
      ...validatedData,
      date: new Date(validatedData.date),
      reference: validatedData.reference || undefined,
      notes: validatedData.notes || undefined,
      clientName: validatedData.clientName || undefined,
      clientPhone: validatedData.clientPhone || undefined
    };

    const income = await prisma.income.update({
      where: { id: parseInt(id) },
      data: cleanData
    });

    return NextResponse.json(income);
  } catch (error) {
    console.error('Error updating income:', error);
    return NextResponse.json({ error: 'Failed to update income' }, { status: 500 });
  }
});

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Income ID is required' }, { status: 400 });
    }

    await prisma.income.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting income:', error);
    return NextResponse.json({ error: 'Failed to delete income' }, { status: 500 });
  }
}
