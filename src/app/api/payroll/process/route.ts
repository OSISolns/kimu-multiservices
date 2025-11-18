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
        const existingPayroll = await prisma.payroll.findUnique({
          where: {
            employeeId_period: {
              employeeId: employee.id,
              period: data.period,
            },
          },
        });

        if (existingPayroll) {
          errors.push({
            employeeId: employee.id,
            employeeName: employee.user.fullName || employee.user.username,
            error: 'Payroll already exists for this period',
          });
          continue;
        }

        // Get the latest salary structure
        const salaryStructure = employee.salaryStructures[0];
        if (!salaryStructure) {
          errors.push({
            employeeId: employee.id,
            employeeName: employee.user.fullName || employee.user.username,
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

        // Create payroll items
        const payrollItems = [
          {
            type: 'salary' as const,
            name: 'Basic Salary',
            amount: baseSalary,
            description: 'Base salary',
          },
        ];

        // Add allowance items
        if (allowances) {
          Object.entries(allowances).forEach(([key, amount]) => {
            if (amount && amount > 0) {
              payrollItems.push({
                type: 'allowance' as const,
                name: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
                amount: amount as number,
                description: `${key} allowance`,
              });
            }
          });
        }

        // Add deduction items
        if (deductions) {
          Object.entries(deductions).forEach(([key, amount]) => {
            if (amount && amount > 0) {
              payrollItems.push({
                type: 'deduction' as const,
                name: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
                amount: amount as number,
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
            grossSalary,
            netSalary,
            totalAllowances,
            totalDeductions,
            workingDays: data.workingDays,
            processedBy: admin.id,
            processedAt: new Date(),
            notes: data.notes,
            payrollItems: {
              create: payrollItems,
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
          employeeName: employee.user.fullName || employee.user.username,
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

