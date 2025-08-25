import { NextRequest, NextResponse } from 'next/server';
            
export async function GET() {
  try {
    const { prisma } = await import('@/lib/prisma');
    const campaigns = await prisma.campaign.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}
            
export async function POST(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/prisma');
    const body = await request.json();
    
    const campaign = await prisma.campaign.create({
      data: {
        name: body.name,
        reach: body.reach || 0,
        engagement: body.engagement || 0,
        leads: body.leads || 0,
        conversions: body.conversions || 0,
        budget: body.budget || 0,
        startDate: body.startDate || new Date().toISOString(),
        endDate: body.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    });
    
    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}
