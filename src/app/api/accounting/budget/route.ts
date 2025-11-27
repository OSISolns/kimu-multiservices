import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withValidation } from '@/lib/api';
import { z } from 'zod';

const budgetSchema = z.object({
  category: z.enum(['fuel', 'maintenance', 'insurance', 'salaries', 'utilities', 'office', 'marketing', 'traffic_tickets', 'other']),
  amount: z.number().positive('Amount must be positive'),
  period: z.enum(['monthly', 'quarterly', 'yearly']),
  year: z.number().min(2020).max(2030),
  month: z.number().min(1).max(12).optional(),
  quarter: z.number().min(1).max(4).optional(),
  description: z.string().optional()
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year') || new Date().getFullYear().toString();
    const period = searchParams.get('period') || 'monthly';

    const budgets = await prisma.budget.findMany({
      where: {
        year: parseInt(year),
        period: period as any
      },
      orderBy: { category: 'asc' }
    });

    // Get actual expenses for comparison
    const startDate = new Date(parseInt(year), 0, 1);
    const endDate = new Date(parseInt(year), 11, 31);

    if (period === 'monthly') {
      const month = searchParams.get('month') || (new Date().getMonth() + 1).toString();
      startDate.setMonth(parseInt(month) - 1);
      endDate.setMonth(parseInt(month) - 1);
      endDate.setDate(new Date(parseInt(year), parseInt(month), 0).getDate());
    } else if (period === 'quarterly') {
      const quarter = searchParams.get('quarter') || Math.ceil((new Date().getMonth() + 1) / 3).toString();
      const quarterStartMonth = (parseInt(quarter) - 1) * 3;
      startDate.setMonth(quarterStartMonth);
      endDate.setMonth(quarterStartMonth + 2);
      endDate.setDate(new Date(parseInt(year), quarterStartMonth + 3, 0).getDate());
    }

    const expenses = await prisma.expense.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        category: true,
        amount: true
      }
    });

    // Calculate actual vs budget
    const budgetWithActuals = budgets.map(budget => {
      const actualAmount = expenses
        .filter(expense => expense.category === budget.category)
        .reduce((sum, expense) => sum + expense.amount, 0);

      const variance = budget.amount - actualAmount;
      const variancePercentage = budget.amount > 0 ? (variance / budget.amount) * 100 : 0;

      return {
        ...budget,
        actualAmount,
        variance,
        variancePercentage: Math.round(variancePercentage * 100) / 100,
        status: variance >= 0 ? 'under_budget' : 'over_budget'
      };
    });

    const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
    const totalActual = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalVariance = totalBudget - totalActual;

    return NextResponse.json({
      budgets: budgetWithActuals,
      summary: {
        totalBudget,
        totalActual,
        totalVariance,
        variancePercentage: totalBudget > 0 ? Math.round((totalVariance / totalBudget) * 100 * 100) / 100 : 0,
        period: `${period} ${year}`,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      }
    });
  } catch (error) {
    console.error('Error fetching budget:', error);
    return NextResponse.json({ error: 'Failed to fetch budget' }, { status: 500 });
  }
}

export const POST = withValidation(budgetSchema, async (req, validatedData) => {
  try {
    const budget = await prisma.budget.create({
      data: {
        category: validatedData.category,
        amount: validatedData.amount,
        period: validatedData.period,
        year: validatedData.year,
        month: validatedData.month,
        quarter: validatedData.quarter,
        description: validatedData.description
      }
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json({ error: 'Failed to create budget' }, { status: 500 });
  }
});
