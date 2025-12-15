import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

async function isAdminRequest(req: NextRequest): Promise<boolean> {
    try {
        const token = req.cookies.get('auth-token')?.value;

        if (!token) {
            return false;
        }

        const { jwtVerify } = await import('jose');
        const secretText = process.env.JWT_SECRET;

        if (!secretText) {
            console.error('JWT_SECRET not configured');
            return false;
        }

        const secret = new TextEncoder().encode(secretText);
        const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });

        const userId = (payload as any)?.userId?.toString();

        if (!userId) {
            return false;
        }

        // Check if user is admin
        const { prisma } = await import('@/lib/prisma');
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
            select: { role: true }
        });

        return user?.role === 'admin';
    } catch (error) {
        console.error('Admin check failed:', error);
        return false;
    }
}

export async function GET(req: NextRequest) {
    try {
        // Check if user is admin
        const isAdmin = await isAdminRequest(req);

        if (!isAdmin) {
            return NextResponse.json(
                { error: 'Access denied. Admin privileges required.' },
                { status: 403 }
            );
        }

        // Determine database path (adjust if needed)
        const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './prisma/dev.db';
        const absolutePath = path.resolve(dbPath);

        // Check if file exists and read it as a buffer
        const fileStat = await fs.promises.stat(absolutePath);
        const fileBuffer = await fs.promises.readFile(absolutePath);

        const response = new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': `attachment; filename="kimu-db-backup-${Date.now()}.db"`,
                'Content-Length': fileStat.size.toString(),
            },
        });

        return response;
    } catch (error) {
        console.error('Error reading DB file:', error);
        return NextResponse.json({ error: 'Failed to read database file' }, { status: 500 });
    }
}
