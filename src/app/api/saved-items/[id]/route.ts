import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromCookie } from '@/lib/jwt';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getUserFromCookie();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: idParam } = await params;
        const id = parseInt(idParam);

        // Verify ownership
        const existingItem = await prisma.savedItem.findUnique({
            where: { id }
        });

        if (!existingItem) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        if (existingItem.userId !== parseInt(user.userId)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.savedItem.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting saved item:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
