import { NextRequest, NextResponse } from 'next/server';
            
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { prisma } = await import('@/lib/prisma');
    const lead = await prisma.lead.findUnique({
      where: {
        id: parseInt(id)
      }
    });
    
    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(lead);
  } catch (error) {
    console.error('Error fetching lead:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lead' },
      { status: 500 }
    );
  }
}
            
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { prisma } = await import('@/lib/prisma');
    const body = await request.json();
    
    const lead = await prisma.lead.update({
      where: {
        id: parseInt(id)
      },
      data: {
        name: body.name,
        company: body.company,
        stage: body.stage,
        value: body.value,
        contact: body.contact,
        email: body.email,
        location: body.location,
        lastContact: body.lastContact,
        nextFollowUp: body.nextFollowUp
      }
    });
    
    return NextResponse.json(lead);
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    );
  }
}
            
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { prisma } = await import('@/lib/prisma');
    await prisma.lead.delete({
      where: {
        id: parseInt(id)
      }
    });
    
    return NextResponse.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { error: 'Failed to delete lead' },
      { status: 500 }
    );
  }
}

