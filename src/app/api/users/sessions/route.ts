import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/users/sessions - Get all active sessions (trusted devices)
export async function GET(request: NextRequest) {
    try {
        const userId = request.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const sessions = await prisma.trustedDevice.findMany({
            where: {
                userId: parseInt(userId),
                expiresAt: {
                    gte: new Date(),
                },
            },
            orderBy: {
                lastUsed: 'desc',
            },
        });

        return NextResponse.json({
            success: true,
            sessions: sessions.map(session => ({
                id: session.id,
                deviceName: session.deviceName || 'Unknown Device',
                deviceType: session.deviceType || 'desktop',
                browserName: session.browserName,
                osName: session.osName,
                location: session.location,
                ipAddress: session.ipAddress,
                lastUsed: session.lastUsed,
                createdAt: session.createdAt,
                expiresAt: session.expiresAt,
            })),
        });
    } catch (error) {
        console.error('Error fetching sessions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch sessions' },
            { status: 500 }
        );
    }
}

// DELETE /api/users/sessions/:id - Revoke a specific session
export async function DELETE(request: NextRequest) {
    try {
        const userId = request.headers.get('x-user-id');
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('id');

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Session ID required' },
                { status: 400 }
            );
        }

        // Verify the session belongs to the user
        const session = await prisma.trustedDevice.findFirst({
            where: {
                id: parseInt(sessionId),
                userId: parseInt(userId),
            },
        });

        if (!session) {
            return NextResponse.json(
                { error: 'Session not found' },
                { status: 404 }
            );
        }

        // Delete the session
        await prisma.trustedDevice.delete({
            where: {
                id: parseInt(sessionId),
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Session revoked successfully',
        });
    } catch (error) {
        console.error('Error revoking session:', error);
        return NextResponse.json(
            { error: 'Failed to revoke session' },
            { status: 500 }
        );
    }
}
