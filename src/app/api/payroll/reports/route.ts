import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonError, jsonOk } from '@/lib/api';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'summary';
    const period = searchParams.get('period');
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const department = searchParams.get('department');

    const where: any = {};
    if (period) where.period = period;
    if (year) where.year = parseInt(year);
    if (month) where.month = parseInt(month);
    if (department) {
      where.employee = { department };
    }

    switch (type) {
      case 'summary':
        return await getPayrollSummary(where);
      case 'monthly':
        return await getMonthlyReport(where);
      case 'department':
        return await getDepartmentReport(where);
      case 'employee':
        return await getEmployeeReport(where);
      case 'stats':
        return await getPayrollStats(where);
      default:
        return jsonError('Invalid report type', 400);
    }
  } catch (error) {
    console.error('Error generating payroll report:', error);
    return jsonError('Failed to generate report', 500);
  }
}

async function getPayrollSummary(where: any) {
  const [payrolls, summary] = await Promise.all([
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
    }),
    prisma.payroll.aggregate({
      where,
      _sum: {
        grossSalary: true,
        netSalary: true,
        totalAllowances: true,
        totalDeductions: true,
        overtimePay: true,
        bonus: true,
      },
      _count: {
        id: true,
      },
      _avg: {
        grossSalary: true,
        netSalary: true,
      },
    }),
  ]);

  const departmentBreakdown = await prisma.payroll.groupBy({
    by: ['employee'],
    where,
    _sum: {
      grossSalary: true,
      netSalary: true,
    },
    _count: {
      id: true,
    },
  });

  return jsonOk({
    summary: {
      totalPayrolls: summary._count.id,
      totalGrossSalary: summary._sum.grossSalary || 0,
      totalNetSalary: summary._sum.netSalary || 0,
      totalAllowances: summary._sum.totalAllowances || 0,
      totalDeductions: summary._sum.totalDeductions || 0,
      totalOvertimePay: summary._sum.overtimePay || 0,
      totalBonus: summary._sum.bonus || 0,
      averageGrossSalary: summary._avg.grossSalary || 0,
      averageNetSalary: summary._avg.netSalary || 0,
    },
    payrolls,
    departmentBreakdown: departmentBreakdown.map(item => ({
      department: item.employee.department,
      count: item._count.id,
      totalGrossSalary: item._sum.grossSalary || 0,
      totalNetSalary: item._sum.netSalary || 0,
    })),
  });
}

async function getMonthlyReport(where: any) {
  const monthlyData = await prisma.payroll.groupBy({
    by: ['year', 'month'],
    where,
    _sum: {
      grossSalary: true,
      netSalary: true,
      totalAllowances: true,
      totalDeductions: true,
    },
    _count: {
      id: true,
    },
    orderBy: [
      { year: 'desc' },
      { month: 'desc' },
    ],
  });

  return jsonOk({
    monthlyData: monthlyData.map(item => ({
      year: item.year,
      month: item.month,
      period: `${item.year}-${item.month.toString().padStart(2, '0')}`,
      totalPayrolls: item._count.id,
      totalGrossSalary: item._sum.grossSalary || 0,
      totalNetSalary: item._sum.netSalary || 0,
      totalAllowances: item._sum.totalAllowances || 0,
      totalDeductions: item._sum.totalDeductions || 0,
    })),
  });
}

async function getDepartmentReport(where: any) {
  const departmentData = await prisma.payroll.groupBy({
    by: ['employee'],
    where,
    _sum: {
      grossSalary: true,
      netSalary: true,
      totalAllowances: true,
      totalDeductions: true,
    },
    _count: {
      id: true,
    },
    _avg: {
      grossSalary: true,
      netSalary: true,
    },
  });

  return jsonOk({
    departmentData: departmentData.map(item => ({
      department: item.employee.department,
      totalPayrolls: item._count.id,
      totalGrossSalary: item._sum.grossSalary || 0,
      totalNetSalary: item._sum.netSalary || 0,
      totalAllowances: item._sum.totalAllowances || 0,
      totalDeductions: item._sum.totalDeductions || 0,
      averageGrossSalary: item._avg.grossSalary || 0,
      averageNetSalary: item._avg.netSalary || 0,
    })),
  });
}

async function getEmployeeReport(where: any) {
  const employeeData = await prisma.payroll.findMany({
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
  });

  return jsonOk({
    employeeData,
  });
}

async function getPayrollStats(where: any) {
  const [totalStats, monthlyTrend, departmentBreakdown, statusBreakdown] = await Promise.all([
    prisma.payroll.aggregate({
      where,
      _sum: {
        grossSalary: true,
        netSalary: true,
      },
      _count: {
        id: true,
      },
      _avg: {
        grossSalary: true,
        netSalary: true,
      },
    }),
    prisma.payroll.groupBy({
      by: ['year', 'month'],
      where: {
        ...where,
        year: where.year || { gte: new Date().getFullYear() - 1 },
      },
      _sum: {
        grossSalary: true,
        netSalary: true,
      },
      _count: {
        id: true,
      },
      orderBy: [
        { year: 'asc' },
        { month: 'asc' },
      ],
    }),
    prisma.payroll.groupBy({
      by: ['employee'],
      where,
      _sum: {
        grossSalary: true,
        netSalary: true,
      },
      _count: {
        id: true,
      },
    }),
    prisma.payroll.groupBy({
      by: ['status'],
      where,
      _count: {
        id: true,
      },
    }),
  ]);

  return jsonOk({
    totalStats: {
      totalPayrolls: totalStats._count.id,
      totalGrossSalary: totalStats._sum.grossSalary || 0,
      totalNetSalary: totalStats._sum.netSalary || 0,
      averageGrossSalary: totalStats._avg.grossSalary || 0,
      averageNetSalary: totalStats._avg.netSalary || 0,
    },
    monthlyTrend: monthlyTrend.map(item => ({
      month: `${item.year}-${item.month.toString().padStart(2, '0')}`,
      amount: item._sum.netSalary || 0,
      employees: item._count.id,
    })),
    departmentBreakdown: departmentBreakdown.map(item => ({
      department: item.employee.department,
      count: item._count.id,
      totalSalary: item._sum.netSalary || 0,
    })),
    statusBreakdown: statusBreakdown.map(item => ({
      status: item.status,
      count: item._count.id,
    })),
  });
}

