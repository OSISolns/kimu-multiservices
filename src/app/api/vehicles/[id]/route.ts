import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Next.js 15 dynamic route handlers require awaiting context.params
export async function GET(
  req: NextRequest,
  context: { params: { id: string } } | any
) {
  try {
    const { params } = await context
    const id = Number(params.id)
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id } })
    if (!vehicle) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(vehicle)
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } } | any
) {
  try {
    const { params } = await context
    const id = Number(params.id)
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }

    const body = await req.json()
    // Only allow editable fields
    const {
      name,
      type,
      category,
      year,
      licensePlate,
      status,
      isAvailable,
      maintenanceDate,
      engine,
      transmission,
      fuel,
      power,
      fuelEfficiency,
      capacity,
      doors,
      mileage,
      quantity,
      description,
      price,
      image,
    } = body

    const updated = await prisma.vehicle.update({
      where: { id },
      data: {
        name,
        type,
        category,
        year,
        licensePlate,
        status,
        isAvailable,
        maintenanceDate: maintenanceDate ? new Date(maintenanceDate) : undefined,
        engine,
        transmission,
        fuel,
        power,
        fuelEfficiency,
        capacity,
        doors,
        mileage,
        quantity,
        description,
        price,
        image,
      },
    })
    return NextResponse.json(updated)
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
