import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const tableName = searchParams.get('table');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = (page - 1) * limit;

        if (!tableName) {
            return NextResponse.json(
                { error: 'Table name is required' },
                { status: 400 }
            );
        }

        // Get table data
        const data = await prisma.$queryRawUnsafe(
            `SELECT * FROM "${tableName}" LIMIT ${limit} OFFSET ${offset}`
        );

        // Get total count
        const countResult = await prisma.$queryRawUnsafe<Array<{ count: number }>>(
            `SELECT COUNT(*) as count FROM "${tableName}"`
        );
        const total = countResult[0]?.count || 0;

        // Get column info
        const columns = await prisma.$queryRawUnsafe<
            Array<{ name: string; type: string }>
        >(`PRAGMA table_info("${tableName}")`);

        return NextResponse.json({
            table: tableName,
            columns: columns.map((col: any) => ({
                name: col.name,
                type: col.type,
            })),
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching table data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch table data' },
            { status: 500 }
        );
    }
}
