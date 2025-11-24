import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

// Hardcoded admin check (replace with real auth)
function isAdminRequest(): boolean {
    // TODO: implement admin check from cookies/session
    return true;
}

export async function GET(req: NextRequest) {
    try {
        // Check if user is admin
        if (!isAdminRequest()) {
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
