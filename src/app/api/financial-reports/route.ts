import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reportType = searchParams.get('type') || 'summary';
    const period = searchParams.get('period') || 'month';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let whereClause: any = {};
    
    // Set date range based on period or custom dates
    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    } else {
      const now = new Date();
      let start: Date;
      
      switch (period) {
        case 'week':
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3);
          start = new Date(now.getFullYear(), quarter * 3, 1);
          break;
        case 'year':
          start = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      
      whereClause.date = {
        gte: start,
        lte: now
      };
    }

    switch (reportType) {
      case 'income-statement':
        return await generateIncomeStatement(whereClause, period);
      case 'balance-sheet':
        return await generateBalanceSheet(whereClause, period);
      case 'cash-flow':
        return await generateCashFlowStatement(whereClause, period);
      case 'expense-breakdown':
        return await generateExpenseBreakdown(whereClause, period);
      case 'revenue-analysis':
        return await generateRevenueAnalysis(whereClause, period);
      case 'summary':
      default:
        return await generateFinancialSummary(whereClause, period);
    }
  } catch (error) {
    console.error('Error generating financial report:', error);
    return NextResponse.json({ error: 'Failed to generate financial report' }, { status: 500 });
  }
}

async function generateIncomeStatement(whereClause: any, period: string) {
  const [income, expenses] = await Promise.all([
    prisma.income.findMany({ where: whereClause }),
    prisma.expense.findMany({ where: whereClause })
  ]);

  const totalRevenue = income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const netIncome = totalRevenue - totalExpenses;

  // Group by categories
  const revenueByCategory = income.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {} as Record<string, number>);

  const expensesByCategory = expenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {} as Record<string, number>);

  return NextResponse.json({
    reportType: 'income-statement',
    period,
    generatedAt: new Date().toISOString(),
    summary: {
      totalRevenue,
      totalExpenses,
      netIncome,
      grossMargin: totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue * 100) : 0
    },
    revenue: {
      byCategory: revenueByCategory,
      transactions: income
    },
    expenses: {
      byCategory: expensesByCategory,
      transactions: expenses
    }
  });
}

async function generateBalanceSheet(whereClause: any, period: string) {
  // Get all financial data for balance sheet calculation
  const [income, expenses, invoices] = await Promise.all([
    prisma.income.findMany({ where: whereClause }),
    prisma.expense.findMany({ where: whereClause }),
    prisma.invoice.findMany({ where: whereClause })
  ]);

  // Calculate assets (simplified - in real app you'd have asset accounts)
  const totalAssets = income.reduce((sum, item) => sum + item.amount, 0);
  
  // Calculate liabilities (simplified - in real app you'd have liability accounts)
  const totalLiabilities = expenses.reduce((sum, item) => sum + item.amount, 0);
  
  // Calculate equity
  const totalEquity = totalAssets - totalLiabilities;

  return NextResponse.json({
    reportType: 'balance-sheet',
    period,
    generatedAt: new Date().toISOString(),
    assets: {
      total: totalAssets,
      breakdown: {
        cash: totalAssets * 0.6, // Simplified
        receivables: totalAssets * 0.3,
        inventory: totalAssets * 0.1
      }
    },
    liabilities: {
      total: totalLiabilities,
      breakdown: {
        accountsPayable: totalLiabilities * 0.7,
        accruedExpenses: totalLiabilities * 0.3
      }
    },
    equity: {
      total: totalEquity,
      retainedEarnings: totalEquity
    }
  });
}

async function generateCashFlowStatement(whereClause: any, period: string) {
  const [income, expenses] = await Promise.all([
    prisma.income.findMany({ where: whereClause }),
    prisma.expense.findMany({ where: whereClause })
  ]);

  // Group by payment method
  const cashInflows = income.reduce((acc, item) => {
    acc[item.paymentMethod] = (acc[item.paymentMethod] || 0) + item.amount;
    return acc;
  }, {} as Record<string, number>);

  const cashOutflows = expenses.reduce((acc, item) => {
    acc[item.paymentMethod] = (acc[item.paymentMethod] || 0) + item.amount;
    return acc;
  }, {} as Record<string, number>);

  const netCashFlow = Object.values(cashInflows).reduce((sum, val) => sum + val, 0) - 
                     Object.values(cashOutflows).reduce((sum, val) => sum + val, 0);

  return NextResponse.json({
    reportType: 'cash-flow',
    period,
    generatedAt: new Date().toISOString(),
    operatingActivities: {
      cashInflows,
      cashOutflows,
      netOperatingCashFlow: netCashFlow
    },
    summary: {
      totalInflows: Object.values(cashInflows).reduce((sum, val) => sum + val, 0),
      totalOutflows: Object.values(cashOutflows).reduce((sum, val) => sum + val, 0),
      netCashFlow
    }
  });
}

async function generateExpenseBreakdown(whereClause: any, period: string) {
  const expenses = await prisma.expense.findMany({ where: whereClause });

  const expensesByCategory = expenses.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = { total: 0, count: 0, transactions: [] };
    }
    acc[item.category].total += item.amount;
    acc[item.category].count += 1;
    acc[item.category].transactions.push(item);
    return acc;
  }, {} as Record<string, any>);

  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);

  return NextResponse.json({
    reportType: 'expense-breakdown',
    period,
    generatedAt: new Date().toISOString(),
    totalExpenses,
    categories: expensesByCategory,
    summary: Object.entries(expensesByCategory).map(([category, data]) => ({
      category,
      amount: data.total,
      percentage: totalExpenses > 0 ? (data.total / totalExpenses * 100) : 0,
      transactionCount: data.count
    }))
  });
}

async function generateRevenueAnalysis(whereClause: any, period: string) {
  const income = await prisma.income.findMany({ where: whereClause });

  const revenueByCategory = income.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = { total: 0, count: 0, transactions: [] };
    }
    acc[item.category].total += item.amount;
    acc[item.category].count += 1;
    acc[item.category].transactions.push(item);
    return acc;
  }, {} as Record<string, any>);

  const totalRevenue = income.reduce((sum, item) => sum + item.amount, 0);

  return NextResponse.json({
    reportType: 'revenue-analysis',
    period,
    generatedAt: new Date().toISOString(),
    totalRevenue,
    categories: revenueByCategory,
    summary: Object.entries(revenueByCategory).map(([category, data]) => ({
      category,
      amount: data.total,
      percentage: totalRevenue > 0 ? (data.total / totalRevenue * 100) : 0,
      transactionCount: data.count
    }))
  });
}

async function generateFinancialSummary(whereClause: any, period: string) {
  const [income, expenses] = await Promise.all([
    prisma.income.findMany({ where: whereClause }),
    prisma.expense.findMany({ where: whereClause })
  ]);

  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  return NextResponse.json({
    reportType: 'summary',
    period,
    generatedAt: new Date().toISOString(),
    summary: {
      totalIncome,
      totalExpenses,
      netProfit,
      profitMargin: totalIncome > 0 ? (netProfit / totalIncome * 100) : 0
    },
    incomeCount: income.length,
    expenseCount: expenses.length,
    topIncomeCategory: income.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {} as Record<string, number>),
    topExpenseCategory: expenses.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {} as Record<string, number>)
  });
}
