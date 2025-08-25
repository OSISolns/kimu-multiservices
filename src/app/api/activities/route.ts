import { NextRequest, NextResponse } from 'next/server';
            
export async function GET() {
  try {
    const { prisma } = await import('@/lib/prisma');
    const activities = await prisma.activity.findMany({
      orderBy: {
        date: 'desc'
      }
    });
    
    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}
            
export async function POST(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/prisma');
    const body = await request.json();
    
    const activity = await prisma.activity.create({
      data: {
        date: body.date || new Date().toISOString(),
        client: body.client,
        activity: body.activity,
        outcome: body.outcome,
        type: body.type || 'call'
      }
    });
    
    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}
