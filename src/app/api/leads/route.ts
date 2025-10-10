import { NextRequest, NextResponse } from 'next/server';
            
export async function GET(req: NextRequest) {
  try {
    const { prisma } = await import('@/lib/prisma');
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '50'));
    const skip = (page - 1) * limit;
    
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          company: true,
          stage: true,
          value: true,
          contact: true,
          email: true,
          location: true,
          lastContact: true,
          nextFollowUp: true,
          createdAt: true
        }
      }),
      prisma.lead.count()
    ]);
    
    return NextResponse.json({
      data: leads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
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
