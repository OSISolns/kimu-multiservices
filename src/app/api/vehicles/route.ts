import { NextRequest, NextResponse } from 'next/server';
import { prisma, retryDatabaseOperation } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    console.log('Vehicles API: Starting vehicle fetch...');
    
    // Check database connection first
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (dbError) {
      console.error('Vehicles API: Database connection failed:', dbError);
      // Return empty array to allow fallback vehicles
      return NextResponse.json([], {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    const vehicles = await retryDatabaseOperation(async () => {
      try {
        return await prisma.vehicle.findMany({
          where: {
            // Only return vehicles that are available for sale
            isAvailable: true,
          },
          orderBy: {
            year: 'desc',
          },
        });
      } catch (queryError) {
        console.error('Vehicles API: Query error:', queryError);
        // If query fails, return empty array
        return [];
      }
    });
    
    console.log('Vehicles API: Found vehicles:', vehicles?.length || 0);
    
    // Always return an array, even if empty
    return NextResponse.json(vehicles || [], {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Vehicles API: Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    // Return empty array instead of error to allow fallback vehicles to show
    console.warn('Vehicles API: Returning empty array due to error, client will use fallback vehicles');
    return NextResponse.json([], {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 