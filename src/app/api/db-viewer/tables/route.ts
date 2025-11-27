import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Get all table names
        const tables = await prisma.$queryRaw<Array<{ name: string }>>`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
        AND name NOT LIKE 'sqlite_%' 
        AND name NOT LIKE '_prisma_%'
      ORDER BY name;
    `;

        // Get count for each table
        const tableCounts = await Promise.all(
            tables.map(async (table) => {
                try {
                    const result = await prisma.$queryRawUnsafe<Array<{ count: number }>>(
                        `SELECT COUNT(*) as count FROM "${table.name}"`
                    );
                    return {
                        name: table.name,
                        count: result[0]?.count || 0,
                    };
                } catch (error) {
                    return {
                        name: table.name,
                        count: 0,
                        error: 'Unable to count',
                    };
                }
            })
        );

        return NextResponse.json({ tables: tableCounts });
    } catch (error) {
        console.error('Error fetching tables:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tables' },
            { status: 500 }
        );
    }
}
