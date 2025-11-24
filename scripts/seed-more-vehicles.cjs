/*
  Adds additional vehicles matching the official tariff list and a few variants.
  Usage: node scripts/seed-more-vehicles.cjs
*/
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

const vehiclesToAdd = [
  // From tariff
  { name: 'Toyota Prado TXL', type: 'SUV', category: 'Luxury', price: '120,000', year: 2023, image: '/vehicles/land-cruiser.jpg', description: 'Luxury SUV with driver', engine: '4.0L V6', mileage: '18,000 km', transmission: 'Automatic', fuel: 'Petrol', capacity: '7 passengers', doors: 5, power: '271 HP', fuelEfficiency: '12.0 L/100km' },
  { name: 'Toyota Coaster', type: 'Bus', category: 'Commercial', price: '100,000', year: 2021, image: '/vehicles/COASTER.png', description: 'Large capacity bus ideal for group transportation', engine: '4.0L 6-Cylinder', mileage: '35,000 km', transmission: 'Manual', fuel: 'Diesel', capacity: '30 passengers', doors: 2, power: '150 HP', fuelEfficiency: '15.0 L/100km' },
  { name: 'RAV4 Full Electric', type: 'SUV', category: 'Eco-Friendly', price: '100,000', year: 2023, image: '/vehicles/RAV 4.png', description: 'Electric SUV with great range', engine: 'Dual Motor Electric', mileage: '12,000 km', transmission: 'Single Speed', fuel: 'Electric', capacity: '5 passengers', doors: 5, power: '300 HP', fuelEfficiency: '0 L/100km' },
  { name: 'KIA SORENTO', type: 'SUV', category: 'Premium', price: '80,000', year: 2023, image: '/vehicles/SORENTO.png', description: 'Comfortable 7-seater SUV', engine: '3.5L V6', mileage: '20,000 km', transmission: 'Automatic', fuel: 'Petrol', capacity: '7 passengers', doors: 5, power: '290 HP', fuelEfficiency: '10.2 L/100km' },
  { name: 'Hyundai Sonata', type: 'Sedan', category: 'Premium', price: '50,000', year: 2022, image: '/vehicles/SONATA.png', description: 'Comfortable sedan with driver', engine: '2.5L 4-Cylinder', mileage: '25,000 km', transmission: 'Automatic', fuel: 'Petrol', capacity: '5 passengers', doors: 4, power: '191 HP', fuelEfficiency: '7.2 L/100km' },
  { name: 'Toyota Noah', type: 'MPV', category: 'Family', price: '80,000', year: 2022, image: '/vehicles/NOAH.png', description: 'Family MPV with spacious interior', engine: '2.0L 4-Cylinder', mileage: '22,000 km', transmission: 'Automatic', fuel: 'Petrol', capacity: '8 passengers', doors: 5, power: '150 HP', fuelEfficiency: '8.0 L/100km' },
  { name: 'Hyundai Tucson', type: 'SUV', category: 'Compact', price: '60,000', year: 2022, image: '/vehicles/TUCSON.png', description: 'Compact SUV', engine: '2.0L 4-Cylinder', mileage: '30,000 km', transmission: 'Automatic', fuel: 'Petrol', capacity: '5 passengers', doors: 5, power: '155 HP', fuelEfficiency: '7.8 L/100km' },
  { name: 'Toyota Levin', type: 'Sedan', category: 'Economy', price: '60,000', year: 2021, image: '/vehicles/LEVIN.png', description: 'Economy sedan', engine: '1.8L 4-Cylinder', mileage: '45,000 km', transmission: 'Manual', fuel: 'Petrol', capacity: '5 passengers', doors: 4, power: '132 HP', fuelEfficiency: '6.5 L/100km' },
  { name: 'Toyota Prius', type: 'Hybrid', category: 'Eco-Friendly', price: '50,000', year: 2023, image: '/vehicles/PRIUS.png', description: 'Hybrid vehicle with excellent efficiency', engine: '1.8L 4-Cylinder + Electric', mileage: '18,000 km', transmission: 'CVT', fuel: 'Hybrid', capacity: '5 passengers', doors: 4, power: '121 HP', fuelEfficiency: '4.5 L/100km' },
  { name: 'Kia K5 Optima', type: 'Sedan', category: 'Premium', price: '50,000', year: 2022, image: '/vehicles/KI 5.png', description: 'Premium sedan', engine: '2.5L 4-Cylinder', mileage: '24,000 km', transmission: 'Automatic', fuel: 'Petrol', capacity: '5 passengers', doors: 4, power: '191 HP', fuelEfficiency: '7.0 L/100km' },
];

async function main() {
  console.log('📦 Seeding additional vehicles...');
  let created = 0;
  for (const v of vehiclesToAdd) {
    const vehicleId = v.name.replace(/\s+/g, '').toUpperCase() + '-' + String(Math.floor(Math.random() * 900) + 100);
    await prisma.vehicle.create({
      data: {
        ...v,
        isAvailable: true,
        quantity: 1,
        status: 'available',
        licensePlate: `RA${String(Math.floor(Math.random() * 899) + 100)}`,
        vehicleId,
      },
    });
    created++;
  }
  console.log(`✅ Added ${created} vehicles.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });


