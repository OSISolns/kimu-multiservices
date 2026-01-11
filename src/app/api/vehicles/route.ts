import { NextRequest, NextResponse } from 'next/server';
import { prisma, retryDatabaseOperation } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    console.log('Vehicles API: Starting vehicle fetch...');

    // Check database connection first
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (dbError) {
      console.error('Vehicles API: Database connection failed:', dbError);
      // Return empty array to allow fallback vehicles
      return NextResponse.json([], {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const vehicles = await retryDatabaseOperation(async () => {
      try {
        return await prisma.vehicle.findMany({
          where: {
            // Only return vehicles that are available for sale
            isAvailable: true,
          },
          orderBy: {
            year: 'desc',
          },
        });
      } catch (queryError) {
        console.error('Vehicles API: Query error:', queryError);
        // If query fails, return empty array
        return [];
      }
    });

    console.log('Vehicles API: Found vehicles:', vehicles?.length || 0);

    // Always return an array, even if empty
    return NextResponse.json(vehicles || [], {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Vehicles API: Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';

    // Return empty array instead of error to allow fallback vehicles to show
    console.warn('Vehicles API: Returning empty array due to error, client will use fallback vehicles');
    return NextResponse.json([], {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}


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
    const data = await req.json();

    // Validate required fields
    const requiredFields = ['name', 'type', 'category', 'price', 'year', 'transmission', 'fuel'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate custom plate number if provided
    if (data.customPlateNumber && data.customPlateNumber.trim()) {
      // Validate Rwandan format: RA + Alphabet + 3 digits + Alphabet
      const plateRegex = /^RA[A-Z]\s?\d{3}\s?[A-Z]$/
      if (!plateRegex.test(data.customPlateNumber.trim().toUpperCase())) {
        return NextResponse.json({
          error: 'Invalid license plate format. Please use Rwandan format: RA + Alphabet + 3 digits + Alphabet (e.g., RAI 123 C)'
        }, { status: 400 })
      }
    }

    // Generate unique plate number or use custom one
    let plateNumber;
    if (data.customPlateNumber && data.customPlateNumber.trim()) {
      // Check if custom plate number already exists
      const existingVehicle = await prisma.vehicle.findFirst({
        where: { licensePlate: data.customPlateNumber.trim() }
      });

      if (existingVehicle) {
        return NextResponse.json({
          error: 'Plate number already exists. Please choose a different one.'
        }, { status: 400 });
      }

      plateNumber = data.customPlateNumber.trim().toUpperCase();
    } else {
      plateNumber = await generateUniquePlateNumber();
    }

    // Default image if not provided
    const defaultImage = '/vehicles/land-cruiser.jpg';

    const vehicle = await prisma.vehicle.create({
      data: {
        name: data.name,
        type: data.type,
        category: data.category,
        price: data.price,
        year: parseInt(data.year),
        engine: data.engine || 'N/A',
        mileage: data.mileage || '0km',
        transmission: data.transmission,
        fuel: data.fuel,
        capacity: data.capacity || '4 Seats',
        doors: parseInt(data.doors) || 4,
        description: data.description || '',
        power: data.power || 'N/A',
        fuelEfficiency: data.fuelEfficiency || 'N/A',
        quantity: parseInt(data.quantity) || 1,
        licensePlate: plateNumber,
        vehicleId: data.vehicleId || `${data.name.replace(/\s+/g, '-').toUpperCase()}-${Date.now().toString().slice(-6)}`,
        status: data.status || 'available',
        isAvailable: data.isAvailable ?? true,
        image: data.image || defaultImage,
      },
    });

    return NextResponse.json(vehicle, { status: 201 });
  } catch (error) {
    console.error('Vehicles API: Error creating vehicle:', error);
    return NextResponse.json(
      { error: 'Failed to create vehicle' },
      { status: 500 }
    );
  }
} 