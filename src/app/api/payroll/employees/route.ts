import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withValidation, jsonError, jsonOk } from '@/lib/api';
import { z } from 'zod';

const createEmployeeSchema = z.object({
  userId: z.number(),
  employeeId: z.string().min(1),
  position: z.string().min(1),
  department: z.string().min(1),
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'intern']),
  hireDate: z.string().transform(str => new Date(str)),
  salary: z.number().positive(),
  hourlyRate: z.number().positive().optional(),
  workingHours: z.number().positive().optional(),
  bankAccount: z.string().optional(),
  bankName: z.string().optional(),
  taxId: z.string().optional(),
  socialSecurityId: z.string().optional(),
  notes: z.string().optional(),
});

const updateEmployeeSchema = z.object({
  position: z.string().min(1).optional(),
  department: z.string().min(1).optional(),
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'intern']).optional(),
  salary: z.number().positive().optional(),
  hourlyRate: z.number().positive().optional(),
  workingHours: z.number().positive().optional(),
  bankAccount: z.string().optional(),
  bankName: z.string().optional(),
  taxId: z.string().optional(),
  socialSecurityId: z.string().optional(),
  status: z.enum(['active', 'inactive', 'terminated']).optional(),
  terminationDate: z.string().transform(str => new Date(str)).optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const department = searchParams.get('department');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (department) where.department = department;

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
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
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.employee.count({ where }),
    ]);

    return jsonOk({
      employees,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return jsonError('Failed to fetch employees', 500);
  }
}

export const POST = withValidation(createEmployeeSchema, async (req: NextRequest, body) => {
  try {
    const adminUsername = req.headers.get('x-username');
    const admin = adminUsername ? await prisma.user.findUnique({ where: { username: adminUsername } }) : null;
    if (!admin || (admin.role !== 'admin' && admin.role !== 'accountant')) {
      return jsonError('Not authorized', 403);
    }

    const data = body as z.infer<typeof createEmployeeSchema>;

    // Check if employee ID already exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { employeeId: data.employeeId },
    });

    if (existingEmployee) {
      return jsonError('Employee ID already exists', 409);
    }

    // Check if user already has an employee record
    const existingUserEmployee = await prisma.employee.findUnique({
      where: { userId: data.userId },
    });

    if (existingUserEmployee) {
      return jsonError('User already has an employee record', 409);
    }

    const employee = await prisma.employee.create({
      data,
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
    });

    return jsonOk({ employee });
  } catch (error) {
    console.error('Error creating employee:', error);
    return jsonError('Failed to create employee', 500);
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
    const employeeId = searchParams.get('id');
    
    if (!employeeId) {
      return jsonError('Employee ID is required', 400);
    }

    const body = await req.json();
    const validatedData = updateEmployeeSchema.parse(body);

    const employee = await prisma.employee.update({
      where: { id: parseInt(employeeId) },
      data: validatedData,
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
    });

    return jsonOk({ employee });
  } catch (error) {
    console.error('Error updating employee:', error);
    return jsonError('Failed to update employee', 500);
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
    const employeeId = searchParams.get('id');
    
    if (!employeeId) {
      return jsonError('Employee ID is required', 400);
    }

    await prisma.employee.delete({
      where: { id: parseInt(employeeId) },
    });

    return jsonOk({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return jsonError('Failed to delete employee', 500);
  }
}

