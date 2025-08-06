import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { paymentDate: 'desc' },
    });
    return NextResponse.json(payments);
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    // Validate required fields
    if (!data.bookingId || !data.amount || !data.paymentMethod || !data.status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const payment = await prisma.payment.create({
      data: {
        bookingId: data.bookingId,
        bookingType: data.bookingType || '',
        amount: data.amount,
        currency: data.currency || 'RWF',
        paymentMethod: data.paymentMethod,
        status: data.status,
        transactionId: data.transactionId,
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : undefined,
        userId: data.userId,
      },
    });
    return NextResponse.json(payment);
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 