import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withValidation, jsonError, jsonOk } from '@/lib/api';
import { z } from 'zod';

const processPayrollSchema = z.object({
  employeeIds: z.array(z.number()),
  period: z.string().regex(/^\d{4}-\d{2}$/),
  year: z.number(),
  month: z.number().min(1).max(12),
  workingDays: z.number().default(22),
  notes: z.string().optional(),
});

export const POST = withValidation(processPayrollSchema, async (req: NextRequest, body) => {
  try {
    const adminUsername = req.headers.get('x-username');
    const admin = adminUsername ? await prisma.user.findUnique({ where: { username: adminUsername } }) : null;
    if (!admin || (admin.role !== 'admin' && admin.role !== 'accountant')) {
      return jsonError('Not authorized', 403);
    }

    const data = body as z.infer<typeof processPayrollSchema>;

    // Get employees with their salary structures
    const employees = await prisma.employee.findMany({
      where: {
        id: { in: data.employeeIds },
        status: 'active',
      },
      select: {
        id: true,
        userId: true,
        employeeId: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        position: true,
        department: true,
        employmentType: true,
        hireDate: true,
        salary: true,
        status: true,
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
        salaryStructures: {
          where: {
            isActive: true,
            effectiveDate: { lte: new Date() },
          },
          orderBy: { effectiveDate: 'desc' },
          take: 1,
        },
      },
    });

    if (employees.length === 0) {
      return jsonError('No active employees found', 404);
    }

    const processedPayrolls = [];
    const errors = [];

    for (const employee of employees) {
      try {
        // Check if payroll already exists for this period
        const existingPayroll = await prisma.payroll.findFirst({
          where: {
            employeeId: employee.id,
            period: data.period,
          },
          select: { id: true },
        });

        if (existingPayroll) {
          errors.push({
            employeeId: employee.id,
            employeeName: employee.user?.fullName || employee.user?.username || `${employee.firstName} ${employee.lastName}`,
            error: 'Payroll already exists for this period',
          });
          continue;
        }

        // Get the latest salary structure
        const salaryStructure = employee.salaryStructures[0];
        if (!salaryStructure) {
          errors.push({
            employeeId: employee.id,
            employeeName: employee.user?.fullName || employee.user?.username || `${employee.firstName} ${employee.lastName}`,
            error: 'No active salary structure found',
          });
          continue;
        }

        // Calculate payroll
        const allowances = salaryStructure.allowances as any;
        const deductions = salaryStructure.deductions as any;

        const baseSalary = salaryStructure.baseSalary;
        const totalAllowances = Object.values(allowances || {}).reduce((sum: number, amount: any) => sum + (amount || 0), 0);
        const totalDeductions = Object.values(deductions || {}).reduce((sum: number, amount: any) => sum + (amount || 0), 0);

        const grossSalary = baseSalary + totalAllowances;
        const netSalary = grossSalary - totalDeductions;

        // Create base payroll items (we'll attach employee relation when creating the payroll)
        const payrollItems: Array<{
          type: string;
          name: string;
          amount: number;
          description?: string;
        }> = [
            {
              type: 'salary',
              name: 'Basic Salary',
              amount: baseSalary,
              description: 'Base salary',
            },
          ];

        // Add allowance items
        if (allowances) {
          Object.entries(allowances as Record<string, number>).forEach(([key, amount]) => {
            if (amount > 0) {
              payrollItems.push({
                type: 'allowance',
                name: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
                amount,
                description: `${key} allowance`,
              });
            }
          });
        }

        // Add deduction items
        if (deductions) {
          Object.entries(deductions as Record<string, number>).forEach(([key, amount]) => {
            if (amount > 0) {
              payrollItems.push({
                type: 'deduction',
                name: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
                amount,
                description: `${key} deduction`,
              });
            }
          });
        }

        // Create payroll record
        const payroll = await prisma.payroll.create({
          data: {
            employeeId: employee.id,
            period: data.period,
            year: data.year,
            month: data.month,
            actualDays: data.workingDays,
            grossSalary,
            netSalary,
            totalAllowances,
            totalDeductions,
            workingDays: data.workingDays,
            processedBy: admin.id,
            processedAt: new Date(),
            notes: data.notes,
            payrollItems: {
              // Each payroll item must also be linked to the employee per Prisma schema
              create: payrollItems.map((item) => ({
                ...item,
                employee: {
                  connect: { id: employee.id },
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

        processedPayrolls.push(payroll);
      } catch (error) {
        console.error(`Error processing payroll for employee ${employee.id}:`, error);
        errors.push({
          employeeId: employee.id,
          employeeName: employee.user?.fullName || employee.user?.username || `${employee.firstName} ${employee.lastName}`,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return jsonOk({
      processedPayrolls,
      errors,
      summary: {
        total: data.employeeIds.length,
        processed: processedPayrolls.length,
        errors: errors.length,
      },
    });
  } catch (error) {
    console.error('Error processing payroll:', error);
    return jsonError('Failed to process payroll', 500);
  }
});

