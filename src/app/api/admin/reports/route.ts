import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withValidation, jsonError, jsonOk } from '@/lib/api';
import { z } from 'zod';

const createReportSchema = z.object({
  templateId: z.number().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  type: z.enum(['scheduled', 'on_demand', 'real_time']),
  parameters: z.any().optional(),
  filters: z.any().optional(),
});

// Admin-only middleware
async function requireAdmin(req: NextRequest) {
  const adminUsername = req.headers.get('x-username');
  const admin = adminUsername ? await prisma.user.findUnique({ where: { username: adminUsername } }) : null;
  if (!admin || admin.role !== 'admin') {
    throw new Error('Admin access required');
  }
  return admin;
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (category) where.category = category;
    if (type) where.type = type;
    if (status) where.status = status;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          template: true,
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.report.count({ where }),
    ]);

    return jsonOk({
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    if (error instanceof Error && error.message === 'Admin access required') {
      return jsonError('Admin access required', 403);
    }
    return jsonError('Failed to fetch reports', 500);
  }
}

export const POST = withValidation(createReportSchema, async (req: NextRequest, body) => {
  try {
    const admin = await requireAdmin(req);
    const data = body as z.infer<typeof createReportSchema>;

    const report = await prisma.report.create({
      data: {
        ...data,
        generatedBy: admin.id,
        generatedAt: new Date(),
      },
      include: {
        template: true,
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });

    return jsonOk({ report });
  } catch (error) {
    console.error('Error creating report:', error);
    if (error instanceof Error && error.message === 'Admin access required') {
      return jsonError('Admin access required', 403);
    }
    return jsonError('Failed to create report', 500);
  }
});

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin(req);
    
    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get('id');
    
    if (!reportId) {
      return jsonError('Report ID is required', 400);
    }

    const body = await req.json();
    const updateData = {
      status: body.status,
      data: body.data,
      filePath: body.filePath,
      fileFormat: body.fileFormat,
      completedAt: body.completedAt ? new Date(body.completedAt) : undefined,
    };

    const report = await prisma.report.update({
      where: { id: parseInt(reportId) },
      data: updateData,
      include: {
        template: true,
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });

    return jsonOk({ report });
  } catch (error) {
    console.error('Error updating report:', error);
    if (error instanceof Error && error.message === 'Admin access required') {
      return jsonError('Admin access required', 403);
    }
    return jsonError('Failed to update report', 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin(req);
    
    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get('id');
    
    if (!reportId) {
      return jsonError('Report ID is required', 400);
    }

    await prisma.report.delete({
      where: { id: parseInt(reportId) },
    });

    return jsonOk({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    if (error instanceof Error && error.message === 'Admin access required') {
      return jsonError('Admin access required', 403);
    }
    return jsonError('Failed to delete report', 500);
  }
}
