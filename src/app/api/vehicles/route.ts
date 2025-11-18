import { NextRequest, NextResponse } from 'next/server';
import { prisma, retryDatabaseOperation } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    console.log('Vehicles API: Starting vehicle fetch...');
    
    const vehicles = await retryDatabaseOperation(async () => {
      return await prisma.vehicle.findMany();
    });
    
    console.log('Vehicles API: Found vehicles:', vehicles.length);
    return NextResponse.json(vehicles);
  } catch (error) {
    console.error('Vehicles API: Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Server error', details: message }, { status: 500 });
  }
} 