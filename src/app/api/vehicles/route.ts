import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    console.log('Vehicles API: Starting vehicle fetch...');
    const vehicles = await prisma.vehicle.findMany();
    console.log('Vehicles API: Found vehicles:', vehicles.length);
    return NextResponse.json(vehicles);
  } catch (error) {
    console.error('Vehicles API: Error:', error);
    return NextResponse.json({ error: 'Server error', details: error.message }, { status: 500 });
  }
} 