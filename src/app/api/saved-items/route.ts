import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromCookie } from '@/lib/jwt';

export async function GET(req: NextRequest) {
    try {
        const user = await getUserFromCookie();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const savedItems = await prisma.savedItem.findMany({
            where: { userId: parseInt(user.userId) },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(savedItems);
    } catch (error) {
        console.error('Error fetching saved items:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getUserFromCookie();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { itemType, itemId, itemData, notes } = body;

        if (!itemType || !itemId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const savedItem = await prisma.savedItem.create({
            data: {
                userId: parseInt(user.userId),
                itemType,
                itemId: parseInt(itemId),
                itemData: itemData || {},
                notes
            }
        });

        return NextResponse.json(savedItem);
    } catch (error) {
        console.error('Error creating saved item:', error);
        // Check for unique constraint violation
        if ((error as any).code === 'P2002') {
            return NextResponse.json({ error: 'Item already saved' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
