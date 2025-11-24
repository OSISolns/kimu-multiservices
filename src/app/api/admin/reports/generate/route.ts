import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withValidation, jsonError, jsonOk } from '@/lib/api';
import { z } from 'zod';

const generateReportSchema = z.object({
  reportType: z.enum(['financial', 'operational', 'customer', 'employee', 'comprehensive']),
  period: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  format: z.enum(['json', 'csv', 'excel', 'pdf']).default('json'),
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

export const POST = withValidation(generateReportSchema, async (req: NextRequest, body) => {
  try {
    const admin = await requireAdmin(req);
    const data = body as z.infer<typeof generateReportSchema>;

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    if (data.dateFrom && data.dateTo) {
      startDate = new Date(data.dateFrom);
      endDate = new Date(data.dateTo);
    } else {
      switch (data.period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3);
          startDate = new Date(now.getFullYear(), quarter * 3, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
    }

    let reportData: any = {};

    switch (data.reportType) {
      case 'financial':
        reportData = await generateFinancialReport(startDate, endDate);
        break;
      case 'operational':
        reportData = await generateOperationalReport(startDate, endDate);
        break;
      case 'customer':
        reportData = await generateCustomerReport(startDate, endDate);
        break;
      case 'employee':
        reportData = await generateEmployeeReport(startDate, endDate);
        break;
      case 'comprehensive':
        reportData = await generateComprehensiveReport(startDate, endDate);
        break;
    }

    // Create report record
    const report = await prisma.report.create({
      data: {
        name: `${data.reportType.charAt(0).toUpperCase() + data.reportType.slice(1)} Report - ${data.period || 'Custom Period'}`,
        description: `Generated ${data.reportType} report for period ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
        category: data.reportType,
        type: 'on_demand',
        status: 'completed',
        parameters: {
          reportType: data.reportType,
          period: data.period,
          dateFrom: data.dateFrom,
          dateTo: data.dateTo,
          format: data.format,
        },
        filters: data.filters,
        data: reportData,
        generatedBy: admin.id,
        generatedAt: new Date(),
        completedAt: new Date(),
        fileFormat: data.format,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });

    return jsonOk({ 
      report,
      data: reportData,
      message: 'Report generated successfully'
    });
  } catch (error) {
    console.error('Error generating report:', error);
    if (error instanceof Error && error.message === 'Admin access required') {
      return jsonError('Admin access required', 403);
    }
    return jsonError('Failed to generate report', 500);
  }
});

async function generateFinancialReport(startDate: Date, endDate: Date) {
  const [incomeData, expenseData] = await Promise.all([
    prisma.income.aggregate({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    }),
    prisma.expense.aggregate({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    }),
  ]);

  const totalIncome = incomeData._sum.amount || 0;
  const totalExpenses = expenseData._sum.amount || 0;
  const netProfit = totalIncome - totalExpenses;

  const incomeByCategory = await prisma.income.groupBy({
    by: ['category'],
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      amount: true,
    },
    _count: {
      id: true,
    },
  });

  const expensesByCategory = await prisma.expense.groupBy({
    by: ['category'],
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      amount: true,
    },
    _count: {
      id: true,
    },
  });

  return {
    period: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    },
    summary: {
      totalIncome,
      totalExpenses,
      netProfit,
      profitMargin: totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0,
    },
    incomeByCategory: incomeByCategory.map(item => ({
      category: item.category,
      amount: item._sum.amount || 0,
      count: item._count.id,
      percentage: totalIncome > 0 ? ((item._sum.amount || 0) / totalIncome) * 100 : 0,
    })),
    expensesByCategory: expensesByCategory.map(item => ({
      category: item.category,
      amount: item._sum.amount || 0,
      count: item._count.id,
      percentage: totalExpenses > 0 ? ((item._sum.amount || 0) / totalExpenses) * 100 : 0,
    })),
  };
}

async function generateOperationalReport(startDate: Date, endDate: Date) {
  const [totalBookings, completedBookings, cancelledBookings] = await Promise.all([
    prisma.booking.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    }),
    prisma.booking.count({
      where: {
        status: 'Completed',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    }),
    prisma.booking.count({
      where: {
        status: 'Cancelled',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    }),
  ]);

  const bookingsByType = await prisma.booking.groupBy({
    by: ['type'],
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: {
      id: true,
    },
  });

  return {
    period: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    },
    summary: {
      totalBookings,
      completedBookings,
      cancelledBookings,
      completionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0,
      cancellationRate: totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0,
    },
    bookingsByType: bookingsByType.map(item => ({
      type: item.type,
      count: item._count.id,
      percentage: totalBookings > 0 ? (item._count.id / totalBookings) * 100 : 0,
    })),
  };
}

async function generateCustomerReport(startDate: Date, endDate: Date) {
  const [totalLeads, newLeads] = await Promise.all([
    prisma.lead.count({
      where: {
        createdAt: {
          lte: endDate,
        },
      },
    }),
    prisma.lead.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    }),
  ]);

  const leadsByStage = await prisma.lead.groupBy({
    by: ['stage'],
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _count: {
      id: true,
    },
    _sum: {
      value: true,
    },
  });

  return {
    period: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    },
    summary: {
      totalLeads,
      newLeads,
      growthRate: totalLeads > 0 ? (newLeads / totalLeads) * 100 : 0,
    },
    leadsByStage: leadsByStage.map(item => ({
      stage: item.stage,
      count: item._count.id,
      totalValue: item._sum.value || 0,
      averageValue: item._count.id > 0 ? (item._sum.value || 0) / item._count.id : 0,
    })),
  };
}

async function generateEmployeeReport(startDate: Date, endDate: Date) {
  const [totalEmployees, activeEmployees] = await Promise.all([
    prisma.employee.count(),
    prisma.employee.count({
      where: {
        status: 'active',
      },
    }),
  ]);

  const employeesByDepartment = await prisma.employee.groupBy({
    by: ['department'],
    where: {
      status: 'active',
    },
    _count: {
      id: true,
    },
    _sum: {
      salary: true,
    },
  });

  const payrollData = await prisma.payroll.aggregate({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      grossSalary: true,
      netSalary: true,
    },
    _count: {
      id: true,
    },
  });

  return {
    period: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    },
    summary: {
      totalEmployees,
      activeEmployees,
      activeRate: totalEmployees > 0 ? (activeEmployees / totalEmployees) * 100 : 0,
      totalPayroll: payrollData._sum.netSalary || 0,
      averageSalary: activeEmployees > 0 ? (payrollData._sum.netSalary || 0) / activeEmployees : 0,
    },
    employeesByDepartment: employeesByDepartment.map(item => ({
      department: item.department,
      count: item._count.id,
      totalSalary: item._sum.salary || 0,
      averageSalary: item._count.id > 0 ? (item._sum.salary || 0) / item._count.id : 0,
    })),
  };
}

async function generateComprehensiveReport(startDate: Date, endDate: Date) {
  const [financial, operational, customer, employee] = await Promise.all([
    generateFinancialReport(startDate, endDate),
    generateOperationalReport(startDate, endDate),
    generateCustomerReport(startDate, endDate),
    generateEmployeeReport(startDate, endDate),
  ]);

  return {
    period: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    },
    financial,
    operational,
    customer,
    employee,
  };
}
