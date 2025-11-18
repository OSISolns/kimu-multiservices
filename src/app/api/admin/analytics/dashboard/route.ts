import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonError, jsonOk } from '@/lib/api';

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
    const period = searchParams.get('period') || 'month';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    if (dateFrom && dateTo) {
      startDate = new Date(dateFrom);
      endDate = new Date(dateTo);
    } else {
      switch (period) {
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

    // Financial Analytics
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

    // Income by category
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
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
    });

    // Expenses by category
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
      orderBy: {
        _sum: {
          amount: 'desc',
        },
      },
    });

    // Operational Analytics
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

    // Bookings by type
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
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    // Customer Analytics
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

    // Employee Analytics
    const [totalEmployees, activeEmployees] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({
        where: {
          status: 'active',
        },
      }),
    ]);

    // Payroll Analytics
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

    // Monthly trend data
    const monthlyTrend = [];
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const [monthIncome, monthExpenses] = await Promise.all([
        prisma.income.aggregate({
          where: {
            date: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
          _sum: {
            amount: true,
          },
        }),
        prisma.expense.aggregate({
          where: {
            date: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
          _sum: {
            amount: true,
          },
        }),
      ]);

      monthlyTrend.push({
        month: monthStart.toISOString().slice(0, 7),
        income: monthIncome._sum.amount || 0,
        expenses: monthExpenses._sum.amount || 0,
        profit: (monthIncome._sum.amount || 0) - (monthExpenses._sum.amount || 0),
      });

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    const dashboardData = {
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        type: period,
      },
      financial: {
        totalIncome,
        totalExpenses,
        netProfit,
        profitMargin: totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0,
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
      },
      operational: {
        totalBookings,
        completedBookings,
        cancelledBookings,
        completionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0,
        cancellationRate: totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0,
        bookingsByType: bookingsByType.map(item => ({
          type: item.type,
          count: item._count.id,
          percentage: totalBookings > 0 ? (item._count.id / totalBookings) * 100 : 0,
        })),
      },
      customer: {
        totalLeads,
        newLeads,
        growthRate: totalLeads > 0 ? (newLeads / totalLeads) * 100 : 0,
      },
      employee: {
        totalEmployees,
        activeEmployees,
        activeRate: totalEmployees > 0 ? (activeEmployees / totalEmployees) * 100 : 0,
        totalPayroll: payrollData._sum.netSalary || 0,
        averageSalary: activeEmployees > 0 ? (payrollData._sum.netSalary || 0) / activeEmployees : 0,
      },
      trends: {
        monthly: monthlyTrend,
      },
    };

    return jsonOk({ dashboard: dashboardData });
  } catch (error) {
    console.error('Error fetching analytics dashboard:', error);
    if (error instanceof Error && error.message === 'Admin access required') {
      return jsonError('Admin access required', 403);
    }
    return jsonError('Failed to fetch analytics dashboard', 500);
  }
}
