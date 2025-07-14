const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

// Import the data from other seed files
const vehicles = [
  {
    name: 'Toyota RAV4',
    image: '/vehicles/RAV 4.png',
    type: 'SUV',
    category: 'Premium',
    price: '8,000',
    year: 2022,
    engine: '2.5L 4-Cylinder',
    mileage: '15,000 km',
    transmission: 'Automatic',
    fuel: 'Petrol',
    capacity: '5 passengers',
    doors: 5,
    description: 'Spacious SUV perfect for family trips and city driving',
    isAvailable: true,
    power: '203 hp',
    fuelEfficiency: '8.5 L/100km'
  },
  {
    name: 'Toyota Land Cruiser',
    image: '/vehicles/land-cruiser.jpg',
    type: 'SUV',
    category: 'Luxury',
    price: '15,000',
    year: 2023,
    engine: '3.5L V6 Twin-Turbo',
    mileage: '8,000 km',
    transmission: 'Automatic',
    fuel: 'Petrol',
    capacity: '7 passengers',
    doors: 5,
    description: 'Premium off-road capable SUV with luxury features',
    isAvailable: true,
    power: '409 hp',
    fuelEfficiency: '12.5 L/100km'
  },
  {
    name: 'Toyota Coaster',
    image: '/vehicles/COASTER.png',
    type: 'Bus',
    category: 'Commercial',
    price: '12,000',
    year: 2021,
    engine: '4.0L Diesel',
    mileage: '25,000 km',
    transmission: 'Automatic',
    fuel: 'Diesel',
    capacity: '24 passengers',
    doors: 2,
    description: 'Large capacity bus ideal for group transportation',
    isAvailable: true,
    power: '150 hp',
    fuelEfficiency: '15.0 L/100km'
  },
  {
    name: 'Toyota Noah',
    image: '/vehicles/NOAH.png',
    type: 'MPV',
    category: 'Family',
    price: '10,000',
    year: 2022,
    engine: '2.0L 4-Cylinder',
    mileage: '18,000 km',
    transmission: 'Automatic',
    fuel: 'Petrol',
    capacity: '8 passengers',
    doors: 5,
    description: 'Comfortable family vehicle with sliding doors',
    isAvailable: true,
    power: '150 hp',
    fuelEfficiency: '7.8 L/100km'
  },
  {
    name: 'Toyota Prius',
    image: '/vehicles/PRIUS.png',
    type: 'Hybrid',
    category: 'Eco-Friendly',
    price: '9,000',
    year: 2023,
    engine: '1.8L Hybrid',
    mileage: '12,000 km',
    transmission: 'CVT',
    fuel: 'Hybrid',
    capacity: '5 passengers',
    doors: 5,
    description: 'Fuel-efficient hybrid perfect for eco-conscious drivers',
    isAvailable: true,
    power: '121 hp',
    fuelEfficiency: '4.5 L/100km'
  },
  {
    name: 'Toyota Levin',
    image: '/vehicles/LEVIN.png',
    type: 'Sedan',
    category: 'Economy',
    price: '6,000',
    year: 2021,
    engine: '1.6L 4-Cylinder',
    mileage: '22,000 km',
    transmission: 'Manual',
    fuel: 'Petrol',
    capacity: '5 passengers',
    doors: 4,
    description: 'Reliable and economical sedan for daily commuting',
    isAvailable: true,
    power: '120 hp',
    fuelEfficiency: '6.2 L/100km'
  },
  {
    name: 'Toyota Sonata',
    image: '/vehicles/SONATA.png',
    type: 'Sedan',
    category: 'Premium',
    price: '7,500',
    year: 2022,
    engine: '2.0L 4-Cylinder',
    mileage: '16,000 km',
    transmission: 'Automatic',
    fuel: 'Petrol',
    capacity: '5 passengers',
    doors: 4,
    description: 'Stylish sedan with modern features and comfort',
    isAvailable: true,
    power: '150 hp',
    fuelEfficiency: '7.0 L/100km'
  },
  {
    name: 'Toyota Sorento',
    image: '/vehicles/SORENTO.png',
    type: 'SUV',
    category: 'Premium',
    price: '11,000',
    year: 2023,
    engine: '2.5L 4-Cylinder',
    mileage: '10,000 km',
    transmission: 'Automatic',
    fuel: 'Petrol',
    capacity: '7 passengers',
    doors: 5,
    description: 'Versatile SUV with three rows of seating',
    isAvailable: true,
    power: '191 hp',
    fuelEfficiency: '8.8 L/100km'
  },
  {
    name: 'Toyota Tucson',
    image: '/vehicles/TUCSON.png',
    type: 'SUV',
    category: 'Compact',
    price: '8,500',
    year: 2022,
    engine: '2.0L 4-Cylinder',
    mileage: '19,000 km',
    transmission: 'Automatic',
    fuel: 'Petrol',
    capacity: '5 passengers',
    doors: 5,
    description: 'Compact SUV with excellent fuel economy',
    isAvailable: true,
    power: '155 hp',
    fuelEfficiency: '7.5 L/100km'
  },
  {
    name: 'Toyota KI 5',
    image: '/vehicles/KI 5.png',
    type: 'Electric',
    category: 'Eco-Friendly',
    price: '13,000',
    year: 2023,
    engine: 'Electric Motor',
    mileage: '5,000 km',
    transmission: 'Single-Speed',
    fuel: 'Electric',
    capacity: '5 passengers',
    doors: 5,
    description: 'Fully electric vehicle with zero emissions',
    isAvailable: true,
    power: '201 hp',
    fuelEfficiency: '0 L/100km'
  },
  {
    name: 'Toyota TXL',
    image: '/vehicles/TXL.png',
    type: 'Pickup',
    category: 'Commercial',
    price: '9,500',
    year: 2021,
    engine: '2.4L 4-Cylinder',
    mileage: '28,000 km',
    transmission: 'Manual',
    fuel: 'Petrol',
    capacity: '5 passengers',
    doors: 4,
    description: 'Reliable pickup truck for work and transportation',
    isAvailable: true,
    power: '160 hp',
    fuelEfficiency: '9.0 L/100km'
  },
  {
    name: 'Toyota TXL-02',
    image: '/vehicles/TXL-02.png',
    type: 'Pickup',
    category: 'Commercial',
    price: '10,500',
    year: 2022,
    engine: '2.8L 4-Cylinder',
    mileage: '20,000 km',
    transmission: 'Automatic',
    fuel: 'Diesel',
    capacity: '5 passengers',
    doors: 4,
    description: 'Powerful diesel pickup for heavy-duty work',
    isAvailable: true,
    power: '177 hp',
    fuelEfficiency: '8.5 L/100km'
  }
];

const bookings = [
  {
    type: 'Car Rental',
    name: 'John Smith',
    phone: '+254712345678',
    nationality: 'Kenyan',
    idOrPassport: '12345678',
    carType: 'Toyota RAV4',
    pickupDate: '2024-01-15',
    pickupTime: '09:00',
    returnDate: '2024-01-18',
    returnTime: '17:00',
    rentalDays: 3,
    returnConfirmed: true,
    fullTank: true,
    status: 'Completed'
  },
  {
    type: 'Airport Transfer',
    name: 'Sarah Johnson',
    phone: '+254798765432',
    nationality: 'American',
    idOrPassport: 'US123456789',
    carType: 'Toyota Coaster',
    pickupDate: '2024-01-20',
    pickupTime: '06:30',
    returnDate: '2024-01-20',
    returnTime: '08:00',
    rentalDays: 1,
    returnConfirmed: false,
    fullTank: false,
    status: 'Active'
  },
  {
    type: 'Car Rental',
    name: 'Michael Chen',
    phone: '+254701234567',
    nationality: 'Chinese',
    idOrPassport: 'CN987654321',
    carType: 'Toyota Land Cruiser',
    pickupDate: '2024-01-25',
    pickupTime: '10:00',
    returnDate: '2024-01-30',
    returnTime: '16:00',
    rentalDays: 5,
    returnConfirmed: false,
    fullTank: true,
    status: 'Active'
  },
  {
    type: 'Taxi Service',
    name: 'Emma Wilson',
    phone: '+254723456789',
    nationality: 'British',
    idOrPassport: 'GB456789123',
    carType: 'Toyota Prius',
    pickupDate: '2024-01-22',
    pickupTime: '14:00',
    returnDate: '2024-01-22',
    returnTime: '15:30',
    rentalDays: 1,
    returnConfirmed: true,
    fullTank: false,
    status: 'Completed'
  },
  {
    type: 'Car Rental',
    name: 'David Brown',
    phone: '+254734567890',
    nationality: 'South African',
    idOrPassport: 'ZA789123456',
    carType: 'Toyota Noah',
    pickupDate: '2024-02-01',
    pickupTime: '08:00',
    returnDate: '2024-02-05',
    returnTime: '18:00',
    rentalDays: 4,
    returnConfirmed: false,
    fullTank: true,
    status: 'Pending'
  },
  {
    type: 'Airport Transfer',
    name: 'Lisa Anderson',
    phone: '+254745678901',
    nationality: 'Canadian',
    idOrPassport: 'CA321654987',
    carType: 'Toyota Coaster',
    pickupDate: '2024-02-03',
    pickupTime: '05:00',
    returnDate: '2024-02-03',
    returnTime: '07:00',
    rentalDays: 1,
    returnConfirmed: false,
    fullTank: false,
    status: 'Active'
  },
  {
    type: 'Car Rental',
    name: 'Robert Taylor',
    phone: '+254756789012',
    nationality: 'Australian',
    idOrPassport: 'AU147258369',
    carType: 'Toyota Sorento',
    pickupDate: '2024-01-28',
    pickupTime: '11:00',
    returnDate: '2024-02-02',
    returnTime: '14:00',
    rentalDays: 5,
    returnConfirmed: true,
    fullTank: true,
    status: 'Completed'
  },
  {
    type: 'Taxi Service',
    name: 'Maria Garcia',
    phone: '+254767890123',
    nationality: 'Spanish',
    idOrPassport: 'ES963852741',
    carType: 'Toyota Levin',
    pickupDate: '2024-02-04',
    pickupTime: '16:00',
    returnDate: '2024-02-04',
    returnTime: '17:00',
    rentalDays: 1,
    returnConfirmed: false,
    fullTank: false,
    status: 'Active'
  },
  {
    type: 'Car Rental',
    name: 'James Miller',
    phone: '+254778901234',
    nationality: 'Kenyan',
    idOrPassport: '87654321',
    carType: 'Toyota Sonata',
    pickupDate: '2024-02-06',
    pickupTime: '09:30',
    returnDate: '2024-02-08',
    returnTime: '17:30',
    rentalDays: 2,
    returnConfirmed: false,
    fullTank: true,
    status: 'Pending'
  },
  {
    type: 'Airport Transfer',
    name: 'Jennifer Davis',
    phone: '+254789012345',
    nationality: 'German',
    idOrPassport: 'DE159753486',
    carType: 'Toyota Coaster',
    pickupDate: '2024-02-07',
    pickupTime: '04:30',
    returnDate: '2024-02-07',
    returnTime: '06:00',
    rentalDays: 1,
    returnConfirmed: false,
    fullTank: false,
    status: 'Active'
  }
];

const notifications = [
  {
    userId: 1,
    message: 'New booking received: Car rental for John Smith',
    type: 'booking',
    read: false
  },
  {
    userId: 1,
    message: 'Vehicle Toyota RAV4 has been returned successfully',
    type: 'return',
    read: true
  },
  {
    userId: null,
    message: 'System maintenance scheduled for tomorrow at 2:00 AM',
    type: 'system',
    read: false
  },
  {
    userId: 1,
    message: 'Payment received for booking #1234',
    type: 'payment',
    read: false
  },
  {
    userId: 1,
    message: 'Airport transfer booking confirmed for Sarah Johnson',
    type: 'booking',
    read: true
  },
  {
    userId: null,
    message: 'New vehicle Toyota Sorento added to fleet',
    type: 'inventory',
    read: false
  },
  {
    userId: 1,
    message: 'Customer feedback received for booking #1234',
    type: 'feedback',
    read: false
  },
  {
    userId: 1,
    message: 'Vehicle Toyota Land Cruiser requires maintenance',
    type: 'maintenance',
    read: true
  },
  {
    userId: 1,
    message: 'New taxi booking from Emma Wilson',
    type: 'booking',
    read: false
  },
  {
    userId: null,
    message: 'Database backup completed successfully',
    type: 'system',
    read: true
  },
  {
    userId: 1,
    message: 'Booking #1235 cancelled by customer',
    type: 'cancellation',
    read: false
  },
  {
    userId: 1,
    message: 'Vehicle Toyota Noah is now available',
    type: 'inventory',
    read: true
  },
  {
    userId: 1,
    message: 'Payment overdue for booking #1236',
    type: 'payment',
    read: false
  },
  {
    userId: null,
    message: 'Weather alert: Heavy rain expected tomorrow',
    type: 'weather',
    read: false
  },
  {
    userId: 1,
    message: 'Customer David Brown requested booking modification',
    type: 'modification',
    read: false
  },
  {
    userId: 1,
    message: 'Vehicle Toyota Coaster returned with damage',
    type: 'damage',
    read: true
  },
  {
    userId: 1,
    message: 'New airport transfer booking from Lisa Anderson',
    type: 'booking',
    read: false
  },
  {
    userId: null,
    message: 'System update completed - new features available',
    type: 'system',
    read: false
  },
  {
    userId: 1,
    message: 'Customer Robert Taylor left 5-star review',
    type: 'review',
    read: false
  },
  {
    userId: 1,
    message: 'Vehicle Toyota Sonata maintenance completed',
    type: 'maintenance',
    read: true
  },
  {
    userId: 1,
    message: 'Booking #1237 confirmed for Maria Garcia',
    type: 'booking',
    read: false
  },
  {
    userId: null,
    message: 'Monthly revenue report is ready',
    type: 'report',
    read: false
  },
  {
    userId: 1,
    message: 'Customer James Miller requested early pickup',
    type: 'modification',
    read: false
  },
  {
    userId: 1,
    message: 'Vehicle Toyota Levin fuel level low',
    type: 'maintenance',
    read: true
  },
  {
    userId: 1,
    message: 'New booking from Jennifer Davis confirmed',
    type: 'booking',
    read: false
  },
  {
    userId: null,
    message: 'Security alert: Unusual login attempt detected',
    type: 'security',
    read: false
  },
  {
    userId: 1,
    message: 'Customer feedback: Excellent service experience',
    type: 'feedback',
    read: false
  },
  {
    userId: 1,
    message: 'Vehicle Toyota Coaster cleaned and ready',
    type: 'inventory',
    read: true
  },
  {
    userId: 1,
    message: 'Payment received for booking #1238',
    type: 'payment',
    read: false
  }
];

async function seedAll() {
  try {
    console.log('🌱 Starting comprehensive database seeding...');
    
    // Seed vehicles
    console.log('📦 Seeding vehicles...');
    const vehicleResult = await prisma.vehicle.createMany({
      data: vehicles,
      skipDuplicates: true
    });
    console.log(`✅ Successfully seeded ${vehicleResult.count} vehicles`);
    
    // Seed bookings
    console.log('📋 Seeding bookings...');
    const bookingResult = await prisma.booking.createMany({
      data: bookings,
      skipDuplicates: true
    });
    console.log(`✅ Successfully seeded ${bookingResult.count} bookings`);
    
    // Seed notifications
    console.log('🔔 Seeding notifications...');
    const notificationResult = await prisma.notification.createMany({
      data: notifications,
      skipDuplicates: true
    });
    console.log(`✅ Successfully seeded ${notificationResult.count} notifications`);
    
    console.log('🎉 All data seeded successfully!');
    
    // Display summary
    const totalVehicles = await prisma.vehicle.count();
    const totalBookings = await prisma.booking.count();
    const totalNotifications = await prisma.notification.count();
    
    console.log('\n📊 Database Summary:');
    console.log(`   Vehicles: ${totalVehicles}`);
    console.log(`   Bookings: ${totalBookings}`);
    console.log(`   Notifications: ${totalNotifications}`);
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAll(); 