const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

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

async function seedBookings() {
  try {
    console.log('🌱 Seeding bookings...');
    
    const result = await prisma.booking.createMany({
      data: bookings,
    });
    
    console.log(`✅ Successfully seeded ${result.count} bookings`);
  } catch (error) {
    console.error('❌ Error seeding bookings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedBookings(); 