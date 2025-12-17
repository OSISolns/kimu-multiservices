import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withValidation, jsonError, jsonOk } from '@/lib/api';
import { z } from 'zod';

const createEmployeeSchema = z.object({
  userId: z.number().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
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
}).refine(data => data.userId || (data.firstName && data.lastName), {
  message: "Either User ID or First Name and Last Name must be provided",
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
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
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
    // Get user from JWT token in cookies OR x-username header
    const token = req.cookies.get('auth-token')?.value;
    const usernameHeader = req.headers.get('x-username');
    const userIdHeader = req.headers.get('x-user-id');
    const emailHeader = req.headers.get('x-user-email');

    console.log('🔍 Payroll Employee Creation - Auth token present:', !!token);
    console.log('🔍 Payroll Employee Creation - Username header:', usernameHeader);
    console.log('🔍 Payroll Employee Creation - Email header:', emailHeader);
    console.log('🔍 Payroll Employee Creation - User ID header:', userIdHeader);

    let admin;

    if (token) {
      try {
        const { jwtVerify } = await import('jose');
        const secretText = process.env.JWT_SECRET;
        if (!secretText) {
          console.log('❌ Payroll Employee Creation - JWT_SECRET not configured');
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
        console.log('❌ Payroll Employee Creation - Invalid or expired token');
        // Don't return error yet, try header auth
      }
    }

    if (!admin && userIdHeader) {
      console.log('⚠️ Payroll Employee Creation - Falling back to x-user-id header auth');
      admin = await prisma.user.findUnique({
        where: { id: parseInt(userIdHeader) },
        select: { id: true, username: true, role: true }
      });
    }

    if (!admin && usernameHeader) {
      console.log('⚠️ Payroll Employee Creation - Falling back to x-username header auth');
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
      console.log('⚠️ Payroll Employee Creation - Falling back to x-user-email header auth');
      admin = await prisma.user.findFirst({
        where: { email: emailHeader },
        select: { id: true, username: true, role: true }
      });
    }

    console.log('🔍 Payroll Employee Creation - User found:', admin ? { username: admin.username, role: admin.role } : 'null');

    if (!admin) {
      console.log('❌ Payroll Employee Creation - Authentication failed.');
      return jsonError(`Not authenticated. Debug: u='${usernameHeader}', e='${emailHeader}', id='${userIdHeader}', t=${!!token}`, 401);
    }

    if (admin.role !== 'admin' && admin.role !== 'accountant') {
      console.log('❌ Payroll Employee Creation - Authorization failed.');
      console.log('   User found:', `${admin.username} (${admin.role})`);
      return jsonError(`Not authorized. User: ${admin.username}, Role: ${admin.role}`, 403);
    }
    console.log('✅ Payroll Employee Creation - Authorization passed');

    const data = body as z.infer<typeof createEmployeeSchema>;

    // Check if employee ID already exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { employeeId: data.employeeId },
    });

    if (existingEmployee) {
      return jsonError('Employee ID already exists', 409);
    }

    // Check if user already has an employee record (only if userId is provided)
    if (data.userId) {
      const existingUserEmployee = await prisma.employee.findUnique({
        where: { userId: data.userId },
      });

      if (existingUserEmployee) {
        return jsonError('User already has an employee record', 409);
      }
    }

    // Exclude fields that don't exist in the Employee model
    const { workingHours, hourlyRate, userId, ...employeeData } = data;

    const employee = await prisma.employee.create({
      data: {
        ...employeeData,
        userId: userId ?? null,
        salaryStructures: {
          create: {
            baseSalary: data.salary,
            allowances: {},
            deductions: {},
            effectiveDate: new Date(),
            isActive: true,
          }
        }
      },
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

export async function PATCH(req: NextRequest) {
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
    const employeeId = searchParams.get('id');

    if (!employeeId) {
      return jsonError('Employee ID is required', 400);
    }

    const body = await req.json();

    // Only allow status updates via PATCH
    const { status } = body;
    if (!status || !['active', 'inactive', 'terminated'].includes(status)) {
      return jsonError('Valid status is required (active, inactive, or terminated)', 400);
    }

    const employee = await prisma.employee.update({
      where: { id: parseInt(employeeId) },
      data: { status },
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
    console.error('Error updating employee status:', error);
    return jsonError('Failed to update employee status', 500);
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

    if (admin.role !== 'admin') {
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

