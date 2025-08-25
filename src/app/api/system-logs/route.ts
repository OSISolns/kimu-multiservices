import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const createdBy = searchParams.get('createdBy');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (action) where.action = action;
    if (createdBy) where.createdBy = parseInt(createdBy);
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [systemLogs, total] = await Promise.all([
      prisma.systemLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.systemLog.count({ where })
    ]);

    return NextResponse.json({
      systemLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching system logs:', error);
    return NextResponse.json({ error: 'Failed to fetch system logs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const log = await prisma.systemLog.create({
      data: {
        action: data.action,
        details: data.details ? JSON.stringify(data.details) : null,
        createdBy: data.createdBy || null,
      },
    });
    return NextResponse.json({ success: true, log });
  } catch (error) {
    console.error('Error creating system log:', error);
    return NextResponse.json({ success: false, error: 'Failed to create system log' }, { status: 500 });
  }
} 