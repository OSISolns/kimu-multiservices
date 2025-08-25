import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, context: any) {
  try {
    const params = await context.params;
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid vehicle ID' }, { status: 400 })
    }
    const vehicle = await prisma.vehicle.findUnique({ where: { id } })
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }
    return NextResponse.json(vehicle)
  } catch (error) {
    console.error('Error fetching vehicle:', error)
    return NextResponse.json({ error: 'Failed to fetch vehicle' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, context: any) {
  try {
    const params = await context.params;
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid vehicle ID' }, { status: 400 })
    }

    // Check if vehicle exists
    const existingVehicle = await prisma.vehicle.findUnique({ where: { id } })
    if (!existingVehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    // Get request body
    const body = await req.json()
    console.log('Vehicle update request received:', { id, body })
    
    // Prepare update data
    const updateData: any = {}
    
    // Handle different types of updates
    if (body.quantity !== undefined) {
      updateData.quantity = body.quantity
    }
    
    if (body.isAvailable !== undefined) {
      updateData.isAvailable = body.isAvailable
    }
    
    if (body.status !== undefined) {
      updateData.status = body.status
    }
    
    if (body.maintenanceNotes !== undefined) {
      updateData.maintenanceNotes = body.maintenanceNotes
    }
    
    if (body.maintenanceDate !== undefined) {
      updateData.maintenanceDate = body.maintenanceDate
    }
    
    if (body.quantityUpdateReason !== undefined) {
      updateData.quantityUpdateReason = body.quantityUpdateReason
    }
    
    if (body.quantityUpdateDate !== undefined) {
      updateData.quantityUpdateDate = body.quantityUpdateDate
    }
    
    // Handle general vehicle field updates
    if (body.name !== undefined) updateData.name = body.name
    if (body.type !== undefined) updateData.type = body.type
    if (body.category !== undefined) updateData.category = body.category
    if (body.price !== undefined) updateData.price = body.price
    if (body.year !== undefined) updateData.year = body.year
    if (body.engine !== undefined) updateData.engine = body.engine
    if (body.mileage !== undefined) updateData.mileage = body.mileage
    if (body.transmission !== undefined) updateData.transmission = body.transmission
    if (body.fuel !== undefined) updateData.fuel = body.fuel
    if (body.capacity !== undefined) updateData.capacity = body.capacity
    if (body.doors !== undefined) updateData.doors = body.doors
    if (body.description !== undefined) updateData.description = body.description
    if (body.power !== undefined) updateData.power = body.power
    if (body.fuelEfficiency !== undefined) updateData.fuelEfficiency = body.fuelEfficiency
    if (body.image !== undefined) updateData.image = body.image

    console.log('Update data prepared:', updateData)

    // Update the vehicle
    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: updateData
    })
    
    console.log('Vehicle updated successfully:', updatedVehicle)

    return NextResponse.json({ 
      success: true, 
      vehicle: updatedVehicle,
      message: 'Vehicle updated successfully'
    })
  } catch (error) {
    console.error('Error updating vehicle:', error)
    return NextResponse.json({ 
      error: 'Failed to update vehicle',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: any) {
  try {
    const params = await context.params;
    const id = parseInt(params.id)
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid vehicle ID' }, { status: 400 })
    }

    // Check if vehicle exists
    const existingVehicle = await prisma.vehicle.findUnique({ where: { id } })
    if (!existingVehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    // Check if vehicle is currently rented
    const activeBookings = await prisma.booking.findMany({
      where: {
        carType: existingVehicle.name,
        returnConfirmed: false,
        status: { not: 'Completed' }
      }
    })

    if (activeBookings.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete vehicle with active rentals',
        details: `Vehicle has ${activeBookings.length} active rental(s)`
      }, { status: 400 })
    }

    // Delete the vehicle
    await prisma.vehicle.delete({
      where: { id }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Vehicle deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting vehicle:', error)
    return NextResponse.json({ 
      error: 'Failed to delete vehicle',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 