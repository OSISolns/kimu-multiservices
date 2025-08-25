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

    // Fetch real data from database
    const [payments, bookings] = await Promise.all([
      prisma.payment.findMany({
        orderBy: { paymentDate: 'desc' }
      }),
      prisma.booking.findMany({
        orderBy: { createdAt: 'desc' }
      })
    ]);

    // Calculate opening balances based on historical data before the selected period
    let openingBalances = {
      mtnMomoRWF: 0,
      equityBankRWF: 0,
      bkBankRWF: 0
    };

    // If date range is provided, calculate opening balances from historical data
    if (startDate && endDate) {
      const startDateObj = new Date(startDate);
      const historicalPayments = payments.filter(payment => 
        payment.paymentDate && new Date(payment.paymentDate) < startDateObj
      );

      openingBalances = {
        mtnMomoRWF: historicalPayments
          .filter(p => p.paymentMethod === 'MTN Momo' && p.status === 'completed')
          .reduce((sum, p) => sum + p.amount, 0),
        equityBankRWF: historicalPayments
          .filter(p => p.paymentMethod === 'Equity Bank' && p.status === 'completed')
          .reduce((sum, p) => sum + p.amount, 0),
        bkBankRWF: historicalPayments
          .filter(p => p.paymentMethod === 'BK Bank' && p.status === 'completed')
          .reduce((sum, p) => sum + p.amount, 0)
      };
    }

    // Convert payments to income data
    const income = payments
      .filter(payment => payment.status === 'completed')
      .map((payment, index) => ({
        id: index + 1,
        description: `Payment - ${payment.paymentMethod} - ${payment.amount.toLocaleString()} RWF`,
        mtnMomoRWF: payment.paymentMethod === 'MTN Momo' ? payment.amount : 0,
        equityBankRWF: payment.paymentMethod === 'Equity Bank' ? payment.amount : 0,
        bkBankRWF: payment.paymentMethod === 'BK Bank' ? payment.amount : 0,
        date: payment.paymentDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
      }));

    // For now, expenses are empty as we don't have an expenses table
    // In a real system, you would fetch expenses from a separate expenses table
    const expenses: any[] = [];

    const financialData = {
      openingBalances,
      income,
      expenses
    };

    // Filter data based on date range if provided
    let filteredIncome = financialData.income;
    let filteredExpenses = financialData.expenses;

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
    }

    // Calculate totals
    const totalIncomeRWF = filteredIncome.reduce((sum, item) => 
      sum + (item.mtnMomoRWF || 0) + (item.equityBankRWF || 0) + (item.bkBankRWF || 0), 0);
    
    const totalExpenseRWF = filteredExpenses.reduce((sum, item) => 
      sum + (item.mtnMomoRWF || 0) + (item.equityBankRWF || 0) + (item.bkBankRWF || 0), 0);

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
        filteredExpenses.reduce((sum, item) => sum + (item.bkBankRWF || 0), 0)
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

    return NextResponse.json(summaryData);
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