import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createFinancialSummaryNotification } from '../../services/notificationUtils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'all';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const generatedBy = searchParams.get('generatedBy') || 'System';

    // Add cache headers
    const headers = new Headers();
    headers.set('Cache-Control', 'public, max-age=300'); // 5 minutes cache

    // Optimized database queries with select only needed fields
    const [payments, bookings, incomeRecords, expenseRecords, pettyCashRecords] = await Promise.all([
      prisma.payment.findMany({
        select: {
          id: true,
          amount: true,
          paymentMethod: true,
          status: true,
          paymentDate: true
        },
        orderBy: { paymentDate: 'desc' }
      }),
      prisma.booking.findMany({
        select: {
          id: true,
          type: true,
          status: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.income.findMany({
        select: {
          id: true,
          amount: true,
          paymentMethod: true,
          date: true,
          description: true,
          category: true
        },
        orderBy: { date: 'desc' }
      }),
      prisma.expense.findMany({
        select: {
          id: true,
          amount: true,
          paymentMethod: true,
          date: true,
          description: true,
          category: true
        },
        orderBy: { date: 'desc' }
      }),
      prisma.pettyCashTransaction.findMany({
        select: {
          id: true,
          amount: true,
          type: true, // CREDIT or DEBIT
          date: true,
          description: true,
          category: true,
          status: true
        },
        orderBy: { date: 'desc' }
      })
    ]);

    // Calculate opening balances based on historical data before the selected period
    let openingBalances = {
      mtnMomoRWF: 0,
      equityBankRWF: 0,
      bkBankRWF: 0,
      cashRWF: 0,
      pettyCashRWF: 0
    };

    // If date range is provided, calculate opening balances from historical data
    if (startDate && endDate) {
      const startDateObj = new Date(startDate);
      const historicalPayments = payments.filter(payment =>
        payment.paymentDate && new Date(payment.paymentDate) < startDateObj
      );
      const historicalIncome = incomeRecords.filter(inc =>
        inc.date && new Date(inc.date) < startDateObj
      );
      const historicalExpenses = expenseRecords.filter(exp =>
        exp.date && new Date(exp.date) < startDateObj
      );
      const historicalPettyCash = pettyCashRecords.filter(pc =>
        pc.date && new Date(pc.date) < startDateObj
      );

      const calculateBalance = (method: string) => {
        const income = historicalPayments
          .filter(p => p.paymentMethod === method && p.status === 'completed')
          .reduce((sum, p) => sum + p.amount, 0) +
          historicalIncome
            .filter(i => i.paymentMethod === method)
            .reduce((sum, i) => sum + i.amount, 0);

        const expense = historicalExpenses
          .filter(e => e.paymentMethod === method)
          .reduce((sum, e) => sum + e.amount, 0);

        return income - expense;
      };

      const calculatePettyCashBalance = () => {
        const credits = historicalPettyCash
          .filter(pc => pc.type === 'CREDIT' && pc.status === 'completed')
          .reduce((sum, pc) => sum + pc.amount, 0);

        const debits = historicalPettyCash
          .filter(pc => pc.type === 'DEBIT' && pc.status === 'completed')
          .reduce((sum, pc) => sum + pc.amount, 0);

        return credits - debits;
      };

      openingBalances = {
        mtnMomoRWF: calculateBalance('MTN Momo'),
        equityBankRWF: calculateBalance('Equity Bank'),
        bkBankRWF: calculateBalance('BK Bank'),
        cashRWF: calculateBalance('Cash'),
        pettyCashRWF: calculatePettyCashBalance()
      };
    }

    // Convert payments to income data
    const paymentIncome = payments
      .filter(payment => payment.status === 'completed')
      .map((payment, index) => ({
        id: `pay_${payment.id}`,
        description: `Payment - ${payment.paymentMethod} - ${payment.amount.toLocaleString()} RWF`,
        mtnMomoRWF: payment.paymentMethod === 'MTN Momo' ? payment.amount : 0,
        equityBankRWF: payment.paymentMethod === 'Equity Bank' ? payment.amount : 0,
        bkBankRWF: payment.paymentMethod === 'BK Bank' ? payment.amount : 0,
        cashRWF: payment.paymentMethod === 'Cash' ? payment.amount : 0,
        pettyCashRWF: 0,
        date: payment.paymentDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
      }));

    const directIncome = incomeRecords.map((inc, index) => ({
      id: `inc_${inc.id}`,
      description: `${inc.category} - ${inc.description}`,
      mtnMomoRWF: inc.paymentMethod === 'MTN Momo' ? inc.amount : 0,
      equityBankRWF: inc.paymentMethod === 'Equity Bank' ? inc.amount : 0,
      bkBankRWF: inc.paymentMethod === 'BK Bank' ? inc.amount : 0,
      cashRWF: inc.paymentMethod === 'Cash' ? inc.amount : 0,
      pettyCashRWF: 0,
      date: inc.date?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
    }));

    const income = [...paymentIncome, ...directIncome].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Map regular expenses
    const regularExpenses = expenseRecords.map((exp, index) => ({
      id: `exp_${exp.id}`,
      description: `${exp.category} - ${exp.description}`,
      mtnMomoRWF: exp.paymentMethod === 'MTN Momo' ? exp.amount : 0,
      equityBankRWF: exp.paymentMethod === 'Equity Bank' ? exp.amount : 0,
      bkBankRWF: exp.paymentMethod === 'BK Bank' ? exp.amount : 0,
      cashRWF: exp.paymentMethod === 'Cash' ? exp.amount : 0,
      pettyCashRWF: 0,
      category: exp.category,
      date: exp.date?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
    }));

    // Map petty cash expenses
    const pettyCashExpenses = pettyCashRecords
      .filter(pc => pc.type === 'DEBIT' && pc.status === 'completed')
      .map((pc, index) => ({
        id: `pc_exp_${pc.id}`,
        description: `Petty Cash - ${pc.description}`,
        mtnMomoRWF: 0,
        equityBankRWF: 0,
        bkBankRWF: 0,
        cashRWF: 0,
        pettyCashRWF: pc.amount,
        category: pc.category || 'Petty Cash',
        date: pc.date?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
      }));

    const expenses = [...regularExpenses, ...pettyCashExpenses].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const financialData = {
      openingBalances,
      income,
      expenses
    };

    // Filter data based on date range if provided
    let filteredIncome = financialData.income;
    let filteredExpenses = financialData.expenses;
    let filteredPettyCashCredits = pettyCashRecords.filter(pc => pc.type === 'CREDIT' && pc.status === 'completed');

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      filteredIncome = financialData.income.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= start && itemDate <= end;
      });

      filteredExpenses = financialData.expenses.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= start && itemDate <= end;
      });

      filteredPettyCashCredits = filteredPettyCashCredits.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= start && itemDate <= end;
      });
    }

    // Calculate totals
    const totalIncomeRWF = filteredIncome.reduce((sum, item) =>
      sum + (item.mtnMomoRWF || 0) + (item.equityBankRWF || 0) + (item.bkBankRWF || 0) + (item.cashRWF || 0), 0);

    const totalExpenseRWF = filteredExpenses.reduce((sum, item) =>
      sum + (item.mtnMomoRWF || 0) + (item.equityBankRWF || 0) + (item.bkBankRWF || 0) + (item.cashRWF || 0) + (item.pettyCashRWF || 0), 0);

    const netProfit = totalIncomeRWF - totalExpenseRWF;

    // Calculate closing balances
    const closingBalances = {
      mtnMomoRWF: financialData.openingBalances.mtnMomoRWF +
        filteredIncome.reduce((sum, item) => sum + (item.mtnMomoRWF || 0), 0) -
        filteredExpenses.reduce((sum, item) => sum + (item.mtnMomoRWF || 0), 0),
      equityBankRWF: financialData.openingBalances.equityBankRWF +
        filteredIncome.reduce((sum, item) => sum + (item.equityBankRWF || 0), 0) -
        filteredExpenses.reduce((sum, item) => sum + (item.equityBankRWF || 0), 0),
      bkBankRWF: financialData.openingBalances.bkBankRWF +
        filteredIncome.reduce((sum, item) => sum + (item.bkBankRWF || 0), 0) -
        filteredExpenses.reduce((sum, item) => sum + (item.bkBankRWF || 0), 0),
      cashRWF: financialData.openingBalances.cashRWF +
        filteredIncome.reduce((sum, item) => sum + (item.cashRWF || 0), 0) -
        filteredExpenses.reduce((sum, item) => sum + (item.cashRWF || 0), 0),
      pettyCashRWF: financialData.openingBalances.pettyCashRWF +
        filteredPettyCashCredits.reduce((sum, item) => sum + item.amount, 0) -
        filteredExpenses.reduce((sum, item) => sum + (item.pettyCashRWF || 0), 0)
    };

    const summaryData = {
      period: period === 'all' ? 'All Time' : `${startDate} to ${endDate}`,
      totalIncome: totalIncomeRWF,
      totalExpenses: totalExpenseRWF,
      netProfit: netProfit,
      openingBalances: financialData.openingBalances,
      closingBalances: closingBalances,
      income: filteredIncome,
      expenses: filteredExpenses,
      generatedAt: new Date().toISOString(),
      generatedBy: generatedBy,
      transactionCount: filteredIncome.length + filteredExpenses.length
    };

    // Create notification for the financial summary
    try {
      await createFinancialSummaryNotification(summaryData, generatedBy);
    } catch (error) {
      console.error('Error creating financial summary notification:', error);
    }

    return NextResponse.json(summaryData, { headers });
  } catch (error) {
    console.error('Error generating financial summary:', error);
    return NextResponse.json({ error: 'Failed to generate financial summary' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { period, startDate, endDate, generatedBy } = body;

    // This would typically save the financial summary to the database
    // For now, we'll just return the generated summary
    const response = await fetch(`${req.nextUrl.origin}/api/financial-summary?period=${period}&startDate=${startDate}&endDate=${endDate}&generatedBy=${generatedBy}`);

    if (!response.ok) {
      throw new Error('Failed to generate financial summary');
    }

    const summaryData = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Financial summary generated successfully',
      data: summaryData
    });
  } catch (error) {
    console.error('Error in POST financial summary:', error);
    return NextResponse.json({ error: 'Failed to process financial summary request' }, { status: 500 });
  }
}