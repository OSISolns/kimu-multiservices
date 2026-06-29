import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') || '30')
    const type = searchParams.get('type') || 'overview'

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get vehicle data
    const vehicles = await prisma.vehicle.findMany({
      select: {
        id: true,
        name: true,
        isAvailable: true,
        status: true,
        maintenanceDate: true,
        maintenanceNotes: true,
        mileage: true,
        fuelEfficiency: true,
        quantity: true
      }
    })

    // Fetch booking data to calculate actual vehicle usage
    const bookings = await prisma.booking.findMany({
      select: {
        carType: true
      }
    })

    // Count bookings matching each vehicle by name/model
    const vehicleUsageCounts = vehicles.map(vehicle => {
      const nameLower = vehicle.name.toLowerCase()
      const nameParts = nameLower.split(' ')
      // Filter out brand names or common filler words
      const cleanParts = nameParts.filter(part => !['toyota', 'kia', 'hyundai', 'full', 'electric', 'hybrid'].includes(part))

      const count = bookings.filter(b => {
        if (!b.carType) return false
        const bookingCar = b.carType.toLowerCase()

        // Exact match or contains match
        if (bookingCar.includes(nameLower) || nameLower.includes(bookingCar)) {
          return true
        }

        // Substring model match (e.g. "rav4", "sorento", "sonata", "prado", "noah", "prius", "coaster")
        return cleanParts.some(part => part.length > 2 && bookingCar.includes(part))
      }).length

      return {
        name: vehicle.name,
        count
      }
    })

    // Sort by booking counts (descending)
    const sortedUsage = [...vehicleUsageCounts].sort((a, b) => b.count - a.count)

    // Most used (default to first vehicle if no booking counts exist)
    const mostUsedVehicle = sortedUsage.length > 0 && sortedUsage[0].count > 0
      ? sortedUsage[0].name
      : (vehicles.length > 0 ? vehicles[0].name : 'N/A')

    // Least used (default to last vehicle if no booking counts exist)
    const leastUsedVehicle = sortedUsage.length > 1
      ? (sortedUsage[sortedUsage.length - 1].count > 0 ? sortedUsage[sortedUsage.length - 1].name : sortedUsage[sortedUsage.length - 1].name)
      : (vehicles.length > 1 ? vehicles[vehicles.length - 1].name : 'N/A')

    // Recent activity samples
    const recentActiveVehicles = vehicles
      .filter(v => v.status === 'in_use' || v.status === 'in-use')
      .slice(0, 5)
      .map(v => ({ id: v.id, name: v.name, status: v.status }))

    // Calculate metrics
    const totalVehicles = vehicles.length
    const availableVehicles = vehicles.filter(v => v.isAvailable && (v.status === 'available' || v.status === 'Available')).length
    const inUseVehicles = vehicles.filter(v => v.status === 'in_use' || v.status === 'in-use').length
    const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance' || v.status === 'Maintenance').length

    // Calculate total mileage (simplified - in real app, this would come from trip records)
    const totalMileage = vehicles.reduce((sum, v) => {
      const mileage = parseInt(v.mileage?.replace(/[^\d]/g, '') || '0')
      return sum + (mileage * (v.quantity || 1))
    }, 0)

    // Calculate average fuel efficiency
    const fuelEfficiencyValues = vehicles
      .map(v => parseFloat(v.fuelEfficiency?.replace(/[^\d.]/g, '') || '0'))
      .filter(v => v > 0)

    const averageFuelEfficiency = fuelEfficiencyValues.length > 0
      ? (fuelEfficiencyValues.reduce((sum, v) => sum + v, 0) / fuelEfficiencyValues.length).toFixed(1)
      : 0

    // Get active bookings count
    const activeBookings = await prisma.booking.count({
      where: {
        status: {
          in: ['Active', 'active', 'Confirmed', 'confirmed', 'Pending', 'pending', 'In Progress', 'in-progress', 'in_progress']
        }
      }
    })

    // Get maintenance data
    const maintenanceDue = vehicles.filter(v => {
      if (!v.maintenanceDate) return false
      const maintenanceDate = new Date(v.maintenanceDate)
      const daysUntilMaintenance = Math.ceil((maintenanceDate.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24))
      return daysUntilMaintenance <= 7 && daysUntilMaintenance >= 0
    }).length

    const upcomingMaintenance = vehicles
      .filter(v => v.maintenanceDate)
      .map(v => ({
        vehicleName: v.name,
        maintenanceDate: v.maintenanceDate ? new Date(v.maintenanceDate).toLocaleDateString() : '',
        type: v.maintenanceNotes || 'Scheduled Maintenance'
      }))
      .sort((a, b) => new Date(a.maintenanceDate).getTime() - new Date(b.maintenanceDate).getTime())
      .slice(0, 5)

    const reportData = {
      totalVehicles,
      availableVehicles,
      inUseVehicles,
      maintenanceVehicles,
      totalMileage,
      averageFuelEfficiency: parseFloat(averageFuelEfficiency.toString()),
      mostUsedVehicle,
      leastUsedVehicle,
      maintenanceDue,
      upcomingMaintenance,
      recentActiveVehicles,
      activeBookings
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Transport report error:', error)
    return NextResponse.json(
      { error: 'Failed to generate transport report' },
      { status: 500 }
    )
  }
}
