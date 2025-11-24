/*
  Seed or update tariff vehicles to quantity 15 each.
  Usage (ensure DATABASE_URL is set):
    node scripts/seed-tariff-vehicles.cjs
*/
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL },
  },
});

const QTY = 15;

// Models from the provided tariff banner
const tariffVehicles = [
  {
    name: 'Toyota Prado TXL',
    image: '/vehicles/TXL.png',
    type: 'SUV',
    category: 'SUV',
    price: '120,000 RWF/day',
    year: 2021,
    engine: '4.0L V6',
    mileage: '25,000km',
    transmission: 'Automatic',
    fuel: 'Petrol',
    capacity: '7 Seats',
    doors: 5,
    description: 'Luxury, power and comfort. With driver.',
    power: '271 HP',
    fuelEfficiency: '12.0L/100km',
  },
  {
    name: 'Toyota Noah',
    image: '/vehicles/NOAH.png',
    type: 'Minivan',
    category: 'Van',
    price: '80,000 RWF/day',
    year: 2019,
    engine: '1.8L I4 Hybrid',
    mileage: '88,000km',
    transmission: 'Automatic',
    fuel: 'Hybrid (Petrol)',
    capacity: '7 Seats',
    doors: 5,
    description: 'Versatile family/group MPV. With driver.',
    power: '99 HP',
    fuelEfficiency: '5.8L/100km',
  },
  {
    name: 'Toyota Coaster',
    image: '/vehicles/COASTER.png',
    type: 'Bus',
    category: 'Bus',
    price: '100,000 RWF/day',
    year: 2018,
    engine: '4.0L I6',
    mileage: '180,000km',
    transmission: 'Manual',
    fuel: 'Diesel',
    capacity: '28 Seats',
    doors: 3,
    description: 'Ideal for group travel and tours. With driver.',
    power: '150 HP',
    fuelEfficiency: '12.0L/100km',
  },
  {
    name: 'Hyundai Tucson',
    image: '/vehicles/TUCSON.png',
    type: 'SUV',
    category: 'SUV',
    price: '60,000 RWF/day',
    year: 2019,
    engine: '2.0L I4',
    mileage: '60,000km',
    transmission: 'Automatic',
    fuel: 'Petrol',
    capacity: '5 Seats',
    doors: 5,
    description: 'Compact SUV. With driver.',
    power: '155 HP',
    fuelEfficiency: '7.8L/100km',
  },
  {
    name: 'Rav4 Full Electric',
    image: '/vehicles/RAV 4.png',
    type: 'SUV',
    category: 'SUV',
    price: '100,000 RWF/day',
    year: 2023,
    engine: 'Dual Motor Electric',
    mileage: '30,000km',
    transmission: 'Single Speed',
    fuel: 'Electric',
    capacity: '5 Seats',
    doors: 5,
    description: 'Eco-friendly electric SUV. With driver.',
    power: '302 HP',
    fuelEfficiency: '0.0L/100km',
  },
  {
    name: 'Toyota Levin',
    image: '/vehicles/LEVIN.png',
    type: 'Sedan',
    category: 'Car',
    price: '60,000 RWF/day',
    year: 2018,
    engine: '1.8L I4 Hybrid',
    mileage: '62,700km',
    transmission: 'Automatic',
    fuel: 'Hybrid',
    capacity: '5 Seats',
    doors: 4,
    description: 'Efficient and modern sedan. With driver.',
    power: '99 HP',
    fuelEfficiency: '5.2L/100km',
  },
  {
    name: 'KIA SORENTO',
    image: '/vehicles/SORENTO.png',
    type: 'SUV',
    category: 'SUV',
    price: '80,000 RWF/day',
    year: 2019,
    engine: '2.2L I4 Diesel',
    mileage: '110,000km',
    transmission: 'Automatic',
    fuel: 'Diesel',
    capacity: '5 Seats',
    doors: 5,
    description: 'Spacious and comfortable SUV. With driver.',
    power: '136 HP',
    fuelEfficiency: '6.8L/100km',
  },
  {
    name: 'Toyota Prius',
    image: '/vehicles/PRIUS.png',
    type: 'Sedan',
    category: 'Car',
    price: '50,000 RWF/day',
    year: 2015,
    engine: '1.8L Hybrid',
    mileage: '130,000km',
    transmission: 'Automatic',
    fuel: 'Hybrid',
    capacity: '5 Seats',
    doors: 4,
    description: 'Legendary hybrid efficiency. With driver.',
    power: '134 HP',
    fuelEfficiency: '4.3L/100km',
  },
  {
    name: 'Hyundai Sonata',
    image: '/vehicles/SONATA.png',
    type: 'Sedan',
    category: 'Car',
    price: '50,000 RWF/day',
    year: 2014,
    engine: '2.0L I4',
    mileage: '50,000km',
    transmission: 'Automatic',
    fuel: 'Petrol',
    capacity: '5 Seats',
    doors: 4,
    description: 'Comfortable sedan. With driver.',
    power: '150 HP',
    fuelEfficiency: '6.2L/100km',
  },
  {
    name: 'Kia K5 Optima',
    image: '/vehicles/KI 5.png',
    type: 'Sedan',
    category: 'Car',
    price: '50,000 RWF/day',
    year: 2016,
    engine: '2.0L I4',
    mileage: '76,500km',
    transmission: 'Automatic',
    fuel: 'Petrol',
    capacity: '5 Seats',
    doors: 4,
    description: 'Premium sedan with driver.',
    power: '150 HP',
    fuelEfficiency: '6.5L/100km',
  },
];

async function upsertVehicle(v) {
  const existing = await prisma.vehicle.findFirst({
    where: { name: v.name }
  });
  
  if (existing) {
    return prisma.vehicle.update({
      where: { id: existing.id },
      data: { quantity: QTY }
    });
  } else {
    return prisma.vehicle.create({
      data: {
        name: v.name,
        image: v.image,
        type: v.type,
        category: v.category,
        price: v.price,
        year: v.year,
        engine: v.engine,
        mileage: v.mileage,
        transmission: v.transmission,
        fuel: v.fuel,
        capacity: v.capacity,
        doors: v.doors,
        description: v.description,
        isAvailable: true,
        power: v.power,
        fuelEfficiency: v.fuelEfficiency,
        quantity: QTY,
        status: 'available',
      }
    });
  }
}

async function main() {
  console.log(`Seeding tariff vehicles to quantity ${QTY} each...`);
  for (const v of tariffVehicles) {
    await upsertVehicle(v);
    console.log(`✔ Upserted: ${v.name}`);
  }
  console.log('Done.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });


