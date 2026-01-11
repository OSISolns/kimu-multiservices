import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withValidation, jsonError, jsonOk } from '@/lib/api';
import { z } from 'zod';

const createPayrollSchema = z.object({
  employeeId: z.number(),
  period: z.string().regex(/^\d{4}-\d{2}$/),
  year: z.number(),
  month: z.number().min(1).max(12),
  grossSalary: z.number().positive(),
  netSalary: z.number().positive(),
  totalAllowances: z.number().default(0),
  totalDeductions: z.number().default(0),
  workingDays: z.number().default(22),
  actualDays: z.number().optional(),
  overtimeHours: z.number().default(0),
  overtimePay: z.number().default(0),
  bonus: z.number().default(0),
  advance: z.number().default(0),
  loanDeduction: z.number().default(0),
  taxDeduction: z.number().default(0),
  socialSecurity: z.number().default(0),
  otherDeductions: z.number().default(0),
  notes: z.string().optional(),
  payrollItems: z.array(z.object({
    type: z.enum(['allowance', 'deduction', 'bonus', 'overtime', 'salary']),
    name: z.string(),
    amount: z.number(),
    percentage: z.number().optional(),
    description: z.string().optional(),
  })),
});

const processPayrollSchema = z.object({
  employeeIds: z.array(z.number()),
  period: z.string().regex(/^\d{4}-\d{2}$/),
  year: z.number(),
  month: z.number().min(1).max(12),
  workingDays: z.number().default(22),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period');
    const status = searchParams.get('status');
    const department = searchParams.get('department');
    const employeeId = searchParams.get('employeeId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (period) where.period = period;
    if (status) where.status = status;
    if (employeeId) where.employeeId = parseInt(employeeId);
    if (department) {
      where.employee = {
        department: department,
      };
    }

    const [payrolls, total] = await Promise.all([
      prisma.payroll.findMany({
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
          payrollItems: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.payroll.count({ where }),
    ]);

    // Calculate summary statistics
    const summary = await prisma.payroll.aggregate({
      where: period ? { period } : {},
      _sum: {
        grossSalary: true,
        netSalary: true,
        totalAllowances: true,
        totalDeductions: true,
      },
      _count: {
        id: true,
      },
    });

    return jsonOk({
      payrolls,
      summary: {
        totalPayrolls: summary._count.id,
        totalGrossSalary: summary._sum.grossSalary || 0,
        totalNetSalary: summary._sum.netSalary || 0,
        totalAllowances: summary._sum.totalAllowances || 0,
        totalDeductions: summary._sum.totalDeductions || 0,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching payrolls:', error);
    return jsonError('Failed to fetch payrolls', 500);
  }
}

export const POST = withValidation(createPayrollSchema, async (req: NextRequest, body) => {
  try {
    // Get user from JWT token in cookies OR x-username header
    const token = req.cookies.get('auth-token')?.value;
    const usernameHeader = req.headers.get('x-username');
    const emailHeader = req.headers.get('x-user-email');

    let admin;

    if (token) {
      try {
        const { jwtVerify } = await import('jose');
        const secretText = process.env.JWT_SECRET;
        if (!secretText) {
          return jsonError('Server configuration error', 500);
        }
        const secret = new TextEncoder().encode(secretText);
        const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
        const userId = (payload as any)?.userId?.toString();

        if (userId) {
          admin = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
            select: { id: true, username: true, role: true }
          });
        }
      } catch (error) {
        // Don't return error yet, try header auth
      }
    }

    if (!admin && usernameHeader) {
      // Try exact match first
      admin = await prisma.user.findUnique({
        where: { username: usernameHeader },
        select: { id: true, username: true, role: true }
      });

      // If not found, try case-insensitive match
      if (!admin) {
        admin = await prisma.user.findFirst({
          where: { username: { equals: usernameHeader } },
          select: { id: true, username: true, role: true }
        });
      }
    }

    if (!admin && emailHeader) {
      admin = await prisma.user.findFirst({
        where: { email: emailHeader },
        select: { id: true, username: true, role: true }
      });
    }

    if (!admin) {
      return jsonError('Not authenticated', 401);
    }

    if (admin.role !== 'admin' && admin.role !== 'accountant') {
      return jsonError('Not authorized', 403);
    }

    const data = body as z.infer<typeof createPayrollSchema>;

    // Check if payroll already exists for this employee and period
    const existingPayroll = await prisma.payroll.findFirst({
      where: {
        employeeId: data.employeeId,
        period: data.period,
      },
      select: { id: true },
    });

    if (existingPayroll) {
      return jsonError('Payroll already exists for this employee and period', 409);
    }

    const payroll = await prisma.payroll.create({
      data: {
        ...data,
        actualDays: data.actualDays ?? data.workingDays,
        payrollItems: {
          create: data.payrollItems.map(item => ({
            ...item,
            employee: {
              connect: { id: data.employeeId },
            },
          })),
        },
      },
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
        payrollItems: true,
      },
    });

    return jsonOk({ payroll });
  } catch (error) {
    console.error('Error creating payroll:', error);
    return jsonError('Failed to create payroll', 500);
  }
});

export async function PUT(req: NextRequest) {
  try {
    // Get user from JWT token in cookies OR x-username header
    const token = req.cookies.get('auth-token')?.value;
    const usernameHeader = req.headers.get('x-username');
    const emailHeader = req.headers.get('x-user-email');

    let admin;

    if (token) {
      try {
        const { jwtVerify } = await import('jose');
        const secretText = process.env.JWT_SECRET;
        if (!secretText) {
          return jsonError('Server configuration error', 500);
        }
        const secret = new TextEncoder().encode(secretText);
        const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
        const userId = (payload as any)?.userId?.toString();

        if (userId) {
          admin = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
            select: { id: true, username: true, role: true }
          });
        }
      } catch (error) {
        // Don't return error yet, try header auth
      }
    }

    if (!admin && usernameHeader) {
      // Try exact match first
      admin = await prisma.user.findUnique({
        where: { username: usernameHeader },
        select: { id: true, username: true, role: true }
      });

      // If not found, try case-insensitive match
      if (!admin) {
        admin = await prisma.user.findFirst({
          where: { username: { equals: usernameHeader } },
          select: { id: true, username: true, role: true }
        });
      }
    }

    if (!admin && emailHeader) {
      admin = await prisma.user.findFirst({
        where: { email: emailHeader },
        select: { id: true, username: true, role: true }
      });
    }

    if (!admin) {
      return jsonError('Not authenticated', 401);
    }

    if (admin.role !== 'admin' && admin.role !== 'accountant') {
      return jsonError('Not authorized', 403);
    }

    const { searchParams } = new URL(req.url);
    const payrollId = searchParams.get('id');

    if (!payrollId) {
      return jsonError('Payroll ID is required', 400);
    }

    const body = await req.json();
    const updateData = {
      status: body.status,
      paymentMethod: body.paymentMethod,
      paymentDate: body.paymentDate ? new Date(body.paymentDate) : undefined,
      notes: body.notes,
    };

    const payroll = await prisma.payroll.update({
      where: { id: parseInt(payrollId) },
      data: updateData,
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
        payrollItems: true,
      },
    });

    return jsonOk({ payroll });
  } catch (error) {
    console.error('Error updating payroll:', error);
    return jsonError('Failed to update payroll', 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Get user from JWT token in cookies OR x-username header
    const token = req.cookies.get('auth-token')?.value;
    const usernameHeader = req.headers.get('x-username');
    const emailHeader = req.headers.get('x-user-email');

    let admin;

    if (token) {
      try {
        const { jwtVerify } = await import('jose');
        const secretText = process.env.JWT_SECRET;
        if (!secretText) {
          return jsonError('Server configuration error', 500);
        }
        const secret = new TextEncoder().encode(secretText);
        const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
        const userId = (payload as any)?.userId?.toString();

        if (userId) {
          admin = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
            select: { id: true, username: true, role: true }
          });
        }
      } catch (error) {
        // Don't return error yet, try header auth
      }
    }

    if (!admin && usernameHeader) {
      // Try exact match first
      admin = await prisma.user.findUnique({
        where: { username: usernameHeader },
        select: { id: true, username: true, role: true }
      });

      // If not found, try case-insensitive match
      if (!admin) {
        admin = await prisma.user.findFirst({
          where: { username: { equals: usernameHeader } },
          select: { id: true, username: true, role: true }
        });
      }
    }

    if (!admin && emailHeader) {
      admin = await prisma.user.findFirst({
        where: { email: emailHeader },
        select: { id: true, username: true, role: true }
      });
    }

    if (!admin) {
      return jsonError('Not authenticated', 401);
    }

    // Only allow admin for DELETE
    if (admin.role !== 'admin') {
      return jsonError('Not authorized', 403);
    }

    const { searchParams } = new URL(req.url);
    const payrollId = searchParams.get('id');

    if (!payrollId) {
      return jsonError('Payroll ID is required', 400);
    }

    await prisma.payroll.delete({
      where: { id: parseInt(payrollId) },
    });

    return jsonOk({ message: 'Payroll deleted successfully' });
  } catch (error) {
    console.error('Error deleting payroll:', error);
    return jsonError('Failed to delete payroll', 500);
  }
}
