
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withValidation } from '@/lib/api';
import { z } from 'zod';

const budgetSchema = z.object({
    category: z.enum(['fuel', 'maintenance', 'insurance', 'salaries', 'wages', 'utilities', 'office', 'marketing', 'traffic_tickets', 'other']),
    amount: z.number().positive('Amount must be positive'),
    period: z.enum(['monthly', 'quarterly', 'yearly']),
    year: z.number().min(2020).max(2030),
    month: z.number().min(1).max(12).optional(),
    quarter: z.number().min(1).max(4).optional(),
    description: z.string().optional()
});

export async function PUT(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const id = parseInt(params.id);
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const body = await req.json();
        const validatedData = budgetSchema.parse(body);

        const updatedBudget = await prisma.budget.update({
            where: { id },
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

        return NextResponse.json(updatedBudget);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.format() }, { status: 400 });
        }
        console.error('Error updating budget:', error);
        return NextResponse.json({ error: 'Failed to update budget' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const id = parseInt(params.id);
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        await prisma.budget.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'Budget deleted successfully' });
    } catch (error) {
        console.error('Error deleting budget:', error);
        return NextResponse.json({ error: 'Failed to delete budget' }, { status: 500 });
    }
}
