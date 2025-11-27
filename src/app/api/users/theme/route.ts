import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/users/theme - Get user theme preferences
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
                theme: true,
                language: true,
                timezone: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            theme: user.theme || 'system',
            language: user.language || 'en',
            timezone: user.timezone || 'Africa/Kigali',
        });
    } catch (error) {
        console.error('Error fetching theme preferences:', error);
        return NextResponse.json(
            { error: 'Failed to fetch theme preferences' },
            { status: 500 }
        );
    }
}

// POST /api/users/theme - Save user theme preferences
export async function POST(request: NextRequest) {
    try {
        const userId = request.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { theme, language, timezone } = body;

        // Validate theme
        if (theme && !['light', 'dark', 'system'].includes(theme)) {
            return NextResponse.json(
                { error: 'Invalid theme value' },
                { status: 400 }
            );
        }

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(userId) },
            data: {
                ...(theme !== undefined && { theme }),
                ...(language !== undefined && { language }),
                ...(timezone !== undefined && { timezone }),
            },
            select: {
                theme: true,
                language: true,
                timezone: true,
            },
        });

        return NextResponse.json({
            success: true,
            preferences: updatedUser,
        });
    } catch (error) {
        console.error('Error saving theme preferences:', error);
        return NextResponse.json(
            { error: 'Failed to save theme preferences' },
            { status: 500 }
        );
    }
}
