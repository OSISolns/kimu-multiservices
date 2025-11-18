import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withValidation, jsonError, jsonOk } from '@/lib/api';
import { z } from 'zod';

const createSalaryStructureSchema = z.object({
  employeeId: z.number(),
  baseSalary: z.number().positive(),
  allowances: z.record(z.string(), z.number().min(0)).default({}),
  deductions: z.record(z.string(), z.number().min(0)).default({}),
  effectiveDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)).optional(),
});

const updateSalaryStructureSchema = z.object({
  baseSalary: z.number().positive().optional(),
  allowances: z.record(z.string(), z.number().min(0)).optional(),
  deductions: z.record(z.string(), z.number().min(0)).optional(),
  effectiveDate: z.string().transform(str => new Date(str)).optional(),
  endDate: z.string().transform(str => new Date(str)).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId');
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (employeeId) where.employeeId = parseInt(employeeId);
    if (isActive !== null) where.isActive = isActive === 'true';

    const [salaryStructures, total] = await Promise.all([
      prisma.salaryStructure.findMany({
        where,
        include: {
          employee: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  fullName: true,
                  email: true,
                  phone: true,
                  role: true,
                },
              },
            },
          },
        },
        orderBy: { effectiveDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.salaryStructure.count({ where }),
    ]);

    return jsonOk({
      salaryStructures,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching salary structures:', error);
    return jsonError('Failed to fetch salary structures', 500);
  }
}

export const POST = withValidation(createSalaryStructureSchema, async (req: NextRequest, body) => {
  try {
    const adminUsername = req.headers.get('x-username');
    const admin = adminUsername ? await prisma.user.findUnique({ where: { username: adminUsername } }) : null;
    if (!admin || (admin.role !== 'admin' && admin.role !== 'accountant')) {
      return jsonError('Not authorized', 403);
    }

    const data = body as z.infer<typeof createSalaryStructureSchema>;

    // Check if employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: data.employeeId },
    });

    if (!employee) {
      return jsonError('Employee not found', 404);
    }

    // Deactivate any existing active salary structures for this employee
    await prisma.salaryStructure.updateMany({
      where: {
        employeeId: data.employeeId,
        isActive: true,
      },
      data: {
        isActive: false,
        endDate: data.effectiveDate,
      },
    });

    const salaryStructure = await prisma.salaryStructure.create({
      data,
      include: {
        employee: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                email: true,
                phone: true,
                role: true,
              },
            },
          },
        },
      },
    });

    return jsonOk({ salaryStructure });
  } catch (error) {
    console.error('Error creating salary structure:', error);
    return jsonError('Failed to create salary structure', 500);
  }
});

export async function PUT(req: NextRequest) {
  try {
    const adminUsername = req.headers.get('x-username');
    const admin = adminUsername ? await prisma.user.findUnique({ where: { username: adminUsername } }) : null;
    if (!admin || (admin.role !== 'admin' && admin.role !== 'accountant')) {
      return jsonError('Not authorized', 403);
    }

    const { searchParams } = new URL(req.url);
    const salaryStructureId = searchParams.get('id');
    
    if (!salaryStructureId) {
      return jsonError('Salary structure ID is required', 400);
    }

    const body = await req.json();
    const validatedData = updateSalaryStructureSchema.parse(body);

    const salaryStructure = await prisma.salaryStructure.update({
      where: { id: parseInt(salaryStructureId) },
      data: validatedData,
      include: {
        employee: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                email: true,
                phone: true,
                role: true,
              },
            },
          },
        },
      },
    });

    return jsonOk({ salaryStructure });
  } catch (error) {
    console.error('Error updating salary structure:', error);
    return jsonError('Failed to update salary structure', 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const adminUsername = req.headers.get('x-username');
    const admin = adminUsername ? await prisma.user.findUnique({ where: { username: adminUsername } }) : null;
    if (!admin || admin.role !== 'admin') {
      return jsonError('Not authorized', 403);
    }

    const { searchParams } = new URL(req.url);
    const salaryStructureId = searchParams.get('id');
    
    if (!salaryStructureId) {
      return jsonError('Salary structure ID is required', 400);
    }

    await prisma.salaryStructure.delete({
      where: { id: parseInt(salaryStructureId) },
    });

    return jsonOk({ message: 'Salary structure deleted successfully' });
  } catch (error) {
    console.error('Error deleting salary structure:', error);
    return jsonError('Failed to delete salary structure', 500);
  }
}

