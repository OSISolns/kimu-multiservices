import { NextResponse } from 'next/server';
import { healthCheck, getVehicleCount } from '@/lib/neon';

export async function GET() {
  try {
    const healthy = await healthCheck();
    const vehicles = healthy ? await getVehicleCount() : 0;

    return NextResponse.json({
      success: true,
      healthy,
      vehicles,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}


