
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single transaction
export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const transaction = await prisma.pettyCashTransaction.findUnique({
            where: {
                id: parseInt(params.id),
            },
        });

        if (!transaction) {
            return NextResponse.json(
                { error: 'Transaction not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(transaction);
    } catch (error) {
        console.error('Error fetching transaction:', error);
        return NextResponse.json(
            { error: 'Failed to fetch transaction' },
            { status: 500 }
        );
    }
}

// UPDATE transaction
export async function PUT(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const body = await request.json();
        const { description, amount, type, category, requestedBy, approvedBy, status, date } = body;

        // Validate required fields
        if (!description || amount === undefined || amount === null || !type) {
            return NextResponse.json(
                { error: 'Missing required fields: description, amount, and type are required' },
                { status: 400 }
            );
        }

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount)) {
            return NextResponse.json(
                { error: 'Invalid amount provided' },
                { status: 400 }
            );
        }

        // Get the old transaction to recalculate balance
        const oldTransaction = await prisma.pettyCashTransaction.findUnique({
            where: { id: parseInt(params.id) },
        });

        if (!oldTransaction) {
            return NextResponse.json(
                { error: 'Transaction not found' },
                { status: 404 }
            );
        }

        // Determine the transaction date (use provided date or keep original)
        const transactionDate = date ? new Date(date) : oldTransaction.date;

        // Get all transactions except the one being updated
        const allTransactions = await prisma.pettyCashTransaction.findMany({
            where: {
                id: { not: parseInt(params.id) },
            },
            orderBy: { date: 'asc' },
        });

        // Calculate balance up to this point
        const currentBalance = allTransactions
            .filter(t => t.date <= transactionDate)
            .reduce((acc, curr) => {
                if (curr.type === 'CREDIT') {
                    return acc + curr.amount;
                } else {
                    return acc - curr.amount;
                }
            }, 0);

        const newBalance = type === 'CREDIT'
            ? currentBalance + parsedAmount
            : currentBalance - parsedAmount;

        // Update the transaction
        const updatedTransaction = await prisma.pettyCashTransaction.update({
            where: {
                id: parseInt(params.id),
            },
            data: {
                description,
                amount: parsedAmount,
                type,
                category,
                requestedBy,
                approvedBy,
                status: status || 'completed',
                balanceAfter: newBalance,
                ...(date && { date: transactionDate }), // Only update date if provided
            },
        });

        return NextResponse.json(updatedTransaction);
    } catch (error) {
        console.error('Error updating transaction:', error);
        return NextResponse.json(
            { error: 'Failed to update transaction: ' + (error instanceof Error ? error.message : String(error)) },
            { status: 500 }
        );
    }
}

// DELETE transaction
export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        // Check if transaction exists
        const transaction = await prisma.pettyCashTransaction.findUnique({
            where: { id: parseInt(params.id) },
        });

        if (!transaction) {
            return NextResponse.json(
                { error: 'Transaction not found' },
                { status: 404 }
            );
        }

        // Delete the transaction
        await prisma.pettyCashTransaction.delete({
            where: {
                id: parseInt(params.id),
            },
        });

        return NextResponse.json({
            message: 'Transaction deleted successfully',
            deletedId: parseInt(params.id)
        });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        return NextResponse.json(
            { error: 'Failed to delete transaction: ' + (error instanceof Error ? error.message : String(error)) },
            { status: 500 }
        );
    }
}
