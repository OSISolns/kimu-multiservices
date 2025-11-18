import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const account = searchParams.get('account');

    let whereClause: any = {};
    
    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }
    
    if (account) {
      whereClause.account = account;
    }

    // Get all financial transactions
    const [payments, expenses, invoices] = await Promise.all([
      prisma.payment.findMany({
        where: whereClause,
        select: {
          id: true,
          amount: true,
          paymentMethod: true,
          paymentDate: true,
          status: true,
          bookingId: true
        },
        orderBy: { paymentDate: 'desc' }
      }),
      prisma.expense.findMany({
        where: whereClause,
        select: {
          id: true,
          amount: true,
          category: true,
          paymentMethod: true,
          date: true,
          description: true
        },
        orderBy: { date: 'desc' }
      }),
      prisma.invoice.findMany({
        where: whereClause,
        select: {
          id: true,
          invoiceNumber: true,
          totalAmount: true,
          status: true,
          createdAt: true,
          dueDate: true,
          clientName: true
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    // Transform data into ledger entries
    const ledgerEntries = [
      // Income from payments
      ...payments.map(payment => ({
        id: `payment_${payment.id}`,
        date: payment.paymentDate,
        account: payment.paymentMethod,
        description: `Payment - Service #${payment.bookingId || payment.id}`,
        debit: 0,
        credit: payment.amount,
        balance: payment.amount,
        type: 'income',
        reference: `PAY-${payment.id}`,
        status: payment.status
      })),
      
      // Expenses
      ...expenses.map(expense => ({
        id: `expense_${expense.id}`,
        date: expense.date,
        account: expense.paymentMethod,
        description: `${expense.category} - ${expense.description}`,
        debit: expense.amount,
        credit: 0,
        balance: -expense.amount,
        type: 'expense',
        reference: `EXP-${expense.id}`,
        category: expense.category
      })),
      
      // Invoices (accounts receivable)
      ...invoices.map(invoice => ({
        id: `invoice_${invoice.id}`,
        date: invoice.createdAt,
        account: 'Accounts Receivable',
        description: `Invoice #${invoice.invoiceNumber} - ${invoice.clientName}`,
        debit: invoice.totalAmount,
        credit: 0,
        balance: invoice.totalAmount,
        type: 'receivable',
        reference: `INV-${invoice.invoiceNumber}`,
        status: invoice.status,
        dueDate: invoice.dueDate
      }))
    ];

    // Sort by date
    ledgerEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Calculate running balances
    let runningBalance = 0;
    const entriesWithBalance = ledgerEntries.map(entry => {
      runningBalance += entry.credit - entry.debit;
      return {
        ...entry,
        runningBalance
      };
    });

    // Get account summaries
    const accountSummaries = entriesWithBalance.reduce((acc, entry) => {
      if (!acc[entry.account]) {
        acc[entry.account] = {
          account: entry.account,
          totalDebit: 0,
          totalCredit: 0,
          balance: 0,
          transactionCount: 0
        };
      }
      
      acc[entry.account].totalDebit += entry.debit;
      acc[entry.account].totalCredit += entry.credit;
      acc[entry.account].balance += entry.credit - entry.debit;
      acc[entry.account].transactionCount += 1;
      
      return acc;
    }, {} as any);

    return NextResponse.json({
      entries: entriesWithBalance,
      accountSummaries: Object.values(accountSummaries),
      totalEntries: entriesWithBalance.length,
      period: startDate && endDate ? `${startDate} to ${endDate}` : 'All Time'
    });
  } catch (error) {
    console.error('Error fetching ledger:', error);
    return NextResponse.json({ error: 'Failed to fetch ledger' }, { status: 500 });
  }
}
