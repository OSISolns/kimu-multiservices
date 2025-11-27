
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const transactions = await prisma.pettyCashTransaction.findMany({
            orderBy: {
                date: 'desc',
            },
        });

        // Calculate current balance
        const balance = transactions.reduce((acc, curr) => {
            if (curr.type === 'CREDIT') {
                return acc + curr.amount;
            } else {
                return acc - curr.amount;
            }
        }, 0);

        return NextResponse.json({ transactions, balance });
    } catch (error) {
        console.error('Error fetching petty cash transactions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch transactions' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('Received petty cash transaction request:', JSON.stringify(body));

        const { description, amount, type, category, requestedBy, approvedBy, status } = body;

        // Validate required fields
        if (!description || amount === undefined || amount === null || !type) {
            console.error('Missing required fields:', { description, amount, type });
            return NextResponse.json(
                { error: 'Missing required fields: description, amount, and type are required' },
                { status: 400 }
            );
        }

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount)) {
            console.error('Invalid amount:', amount);
            return NextResponse.json(
                { error: 'Invalid amount provided' },
                { status: 400 }
            );
        }

        // Get current balance to calculate balanceAfter
        const allTransactions = await prisma.pettyCashTransaction.findMany();
        const currentBalance = allTransactions.reduce((acc, curr) => {
            if (curr.type === 'CREDIT') {
                return acc + curr.amount;
            } else {
                return acc - curr.amount;
            }
        }, 0);

        const newBalance = type === 'CREDIT'
            ? currentBalance + parsedAmount
            : currentBalance - parsedAmount;

        console.log(`Creating transaction: ${type} ${parsedAmount}, New Balance: ${newBalance}`);

        const transaction = await prisma.pettyCashTransaction.create({
            data: {
                description,
                amount: parsedAmount,
                type,
                category,
                requestedBy,
                approvedBy,
                status: status || 'completed',
                balanceAfter: newBalance,
                date: new Date(),
            },
        });

        console.log('Transaction created successfully:', transaction.id);
        return NextResponse.json(transaction);
    } catch (error) {
        console.error('Error creating petty cash transaction:', error);
        return NextResponse.json(
            { error: 'Failed to create transaction: ' + (error instanceof Error ? error.message : String(error)) },
            { status: 500 }
        );
    }
}
