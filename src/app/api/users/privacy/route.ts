import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/users/privacy - Get user privacy settings
export async function GET(request: NextRequest) {
    try {
        const userId = request.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
            select: {
                profileVisibility: true,
                showEmail: true,
                showPhone: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            profileVisibility: user.profileVisibility || 'team',
            showEmail: user.showEmail || false,
            showPhone: user.showPhone || false,
        });
    } catch (error) {
        console.error('Error fetching privacy settings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch privacy settings' },
            { status: 500 }
        );
    }
}

// PUT /api/users/privacy - Update user privacy settings
export async function PUT(request: NextRequest) {
    try {
        const userId = request.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { profileVisibility, showEmail, showPhone } = body;

        // Validate profileVisibility
        if (profileVisibility && !['public', 'team', 'private'].includes(profileVisibility)) {
            return NextResponse.json(
                { error: 'Invalid profile visibility value' },
                { status: 400 }
            );
        }

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(userId) },
            data: {
                ...(profileVisibility !== undefined && { profileVisibility }),
                ...(showEmail !== undefined && { showEmail }),
                ...(showPhone !== undefined && { showPhone }),
            },
            select: {
                profileVisibility: true,
                showEmail: true,
                showPhone: true,
            },
        });

        return NextResponse.json({
            success: true,
            privacy: updatedUser,
        });
    } catch (error) {
        console.error('Error updating privacy settings:', error);
        return NextResponse.json(
            { error: 'Failed to update privacy settings' },
            { status: 500 }
        );
    }
}
