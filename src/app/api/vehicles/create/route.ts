import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Generate unique Rwandan-style plate number using RAH and RAI prefixes
async function generateUniquePlateNumber() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const prefixes = ['RAH', 'RAI']; // Newest and preferred prefixes
  let attempts = 0;
  const maxAttempts = 100;
  
  while (attempts < maxAttempts) {
    // Randomly choose between RAH and RAI
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    
    // Generate Rwandan format: RAH/RAI + 3 digits + 1 letter
    const digits = Math.floor(Math.random() * 900) + 100; // 100-999
    const letter = letters[Math.floor(Math.random() * letters.length)];
    
    const plateNumber = `${prefix}${digits}${letter}`;
    
    // Check if this plate number already exists
    const existingVehicle = await prisma.vehicle.findFirst({
      where: { licensePlate: plateNumber }
    });
    
    if (!existingVehicle) {
      return plateNumber;
    }
    
    attempts++;
  }
  
  // Fallback: use timestamp-based plate number with RAH/RAI
  const timestamp = Date.now().toString().slice(-6);
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const letter = letters[Math.floor(Math.random() * letters.length)];
  return `${prefix}${timestamp}${letter}`;
}

export async function POST(req: NextRequest) {
  try {
    // Get request body
    const body = await req.json()
    
    console.log('Vehicle creation request received:', body)
    
    // Validate required fields
    const requiredFields = ['name', 'type', 'category', 'price', 'year', 'engine', 'transmission', 'fuel', 'capacity', 'doors']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ 
          error: `Missing required field: ${field}` 
        }, { status: 400 })
      }
    }

    // Validate custom plate number if provided
    if (body.customPlateNumber && body.customPlateNumber.trim()) {
      // Validate Rwandan format: RA + Alphabet + 3 digits + Alphabet
      const plateRegex = /^RA[A-Z]\s?\d{3}\s?[A-Z]$/
      if (!plateRegex.test(body.customPlateNumber.trim().toUpperCase())) {
        return NextResponse.json({ 
          error: 'Invalid license plate format. Please use Rwandan format: RA + Alphabet + 3 digits + Alphabet (e.g., RAI 123 C)' 
        }, { status: 400 })
      }
    }

    // Generate unique plate number or use custom one
    let plateNumber;
    if (body.customPlateNumber && body.customPlateNumber.trim()) {
      console.log('Using custom plate number:', body.customPlateNumber.trim());
      
      // Check if custom plate number already exists
      const existingVehicle = await prisma.vehicle.findFirst({
        where: { licensePlate: body.customPlateNumber.trim() }
      });
      
      if (existingVehicle) {
        console.log('Custom plate number already exists:', body.customPlateNumber.trim());
        return NextResponse.json({ 
          error: 'Plate number already exists. Please choose a different one.' 
        }, { status: 400 });
      }
      
      plateNumber = body.customPlateNumber.trim().toUpperCase();
      console.log('Custom plate number validated and will be used:', plateNumber);
    } else {
      console.log('No custom plate number provided, generating unique one...');
      plateNumber = await generateUniquePlateNumber();
      console.log('Generated plate number:', plateNumber);
    }

    // Prepare vehicle data
    const vehicleData = {
      name: body.name,
      image: body.image || '/vehicles/default.png',
      type: body.type,
      category: body.category,
      price: body.price,
      year: parseInt(body.year),
      engine: body.engine,
      mileage: body.mileage || '0km',
      transmission: body.transmission,
      fuel: body.fuel,
      capacity: body.capacity,
      doors: parseInt(body.doors),
      description: body.description || '',
      isAvailable: true,
      power: body.power || '',
      fuelEfficiency: body.fuelEfficiency || '',
      quantity: parseInt(body.quantity) || 1,
      status: 'available',
      maintenanceNotes: null,
      maintenanceDate: null,
      quantityUpdateReason: null,
      quantityUpdateDate: null,
      licensePlate: plateNumber,
      vehicleId: `${body.name.replace(/\s+/g, '-').toUpperCase()}-${Date.now().toString().slice(-6)}`
    }

        console.log('Creating vehicle with data:', vehicleData);
    
    // Create the vehicle
    const newVehicle = await prisma.vehicle.create({
      data: vehicleData
    })
    
    console.log('Vehicle created successfully:', newVehicle);

    return NextResponse.json({ 
      success: true, 
      vehicle: newVehicle,
      message: 'Vehicle created successfully' 
    })
  } catch (error) {
    console.error('Error creating vehicle:', error)
    
    // Check for specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('Prisma error code:', (error as any).code)
      console.error('Prisma error meta:', (error as any).meta)
    }
    
    return NextResponse.json({ 
      error: 'Failed to create vehicle',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 