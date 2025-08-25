import { NextRequest, NextResponse } from 'next/server';
            
export async function GET() {
  try {
    const { prisma } = await import('@/lib/prisma');
    const leads = await prisma.lead.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}
            
export async function POST(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/prisma');
    const body = await request.json();
    
    const lead = await prisma.lead.create({
      data: {
        name: body.name,
        company: body.company,
        stage: body.stage || 'Contacted',
        value: body.value || 0,
        contact: body.contact || '',
        email: body.email || '',
        location: body.location || '',
        lastContact: body.lastContact || new Date().toISOString(),
        nextFollowUp: body.nextFollowUp || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    });
    
    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}
