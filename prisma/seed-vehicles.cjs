const { PrismaClient } = require('../src/generated/prisma');
const prisma = new PrismaClient();

const vehicles = [
  {
    name: 'Toyota Prado TXL',
    image: '/vehicles/TXL.png',
    type: 'SUV',
    category: 'SUV',
    price: '120,000 RWF/day',
    year: 2019,
    engine: '2800cc',
    mileage: '50,000km',
    transmission: 'Automatic',
    fuel: 'Diesel',
    capacity: '7 Leather Seats',
    doors: 5,
    description: 'The Toyota Prado TXL offers luxury, power, and comfort for both city and off-road journeys. Perfect for executive travel and family adventures in Rwanda.',
    isAvailable: true,
    power: '',
    fuelEfficiency: '',
  },
  {
    name: 'Toyota Coaster',
    image: '/vehicles/COASTER.png',
    type: 'Bus',
    category: 'Bus',
    price: '100,000 RWF/day',
    year: 2012,
    engine: '4,000cc',
    mileage: '180,000km',
    transmission: 'Manual',
    fuel: 'Diesel',
    capacity: '28 Seats',
    doors: 3,
    description: 'The Toyota Coaster is ideal for group travel, offering spacious seating and reliable performance for tours, events, and airport transfers.',
    isAvailable: true,
    power: '',
    fuelEfficiency: '',
  },
  {
    name: 'Rav4 Full Electric',
    image: '/vehicles/RAV 4.png',
    type: 'SUV',
    category: 'SUV',
    price: '100,000 RWF/day',
    year: 2025,
    engine: 'Gas/Electric I-4',
    mileage: '33,000km',
    transmission: 'Automatic',
    fuel: 'petrol-electric plug-in hybrid',
    capacity: '5 Seats',
    doors: 5,
    description: 'Experience the future of driving with the Rav4 Full Electric. Eco-friendly, powerful, and comfortable for both city and countryside.',
    isAvailable: true,
    power: '',
    fuelEfficiency: '',
  },
  {
    name: 'KIA Sorento',
    image: '/vehicles/SORENTO.png',
    type: 'SUV',
    category: 'SUV',
    price: '80,000 RWF/day',
    year: 2018,
    engine: '2.0L 4 Cylinders',
    mileage: '110,000km',
    transmission: 'Automatic',
    fuel: 'Diesel',
    capacity: '5 Seats',
    doors: 5,
    description: 'The KIA Sorento combines style, space, and performance. A great choice for families and business travelers seeking comfort and reliability.',
    isAvailable: true,
    power: '',
    fuelEfficiency: '',
  },
  {
    name: 'Hyundai Sonata',
    image: '/vehicles/SONATA.png',
    type: 'Sedan',
    category: 'Car',
    price: '50,000 RWF/day',
    year: 2012,
    engine: '1,999cc',
    mileage: '50,000km',
    transmission: 'Automatic',
    fuel: 'Hybrid (Petrol)',
    capacity: '5 Seats',
    doors: 4,
    description: 'The Hyundai Sonata offers a smooth ride, modern features, and excellent fuel efficiency. Perfect for city commutes and business trips.',
    isAvailable: true,
    power: '',
    fuelEfficiency: '',
  },
  {
    name: 'Toyota Noah',
    image: '/vehicles/NOAH.png',
    type: 'Minivan',
    category: 'Van',
    price: '80,000 RWF/day',
    year: 2018,
    engine: '1,797cc',
    mileage: '88,651km',
    transmission: 'Manual',
    fuel: 'Hybrid (Petrol)',
    capacity: '7 Seats',
    doors: 5,
    description: 'The Toyota Noah is a versatile minivan, ideal for families and groups. Enjoy spacious seating and flexible cargo options.',
    isAvailable: true,
    power: '',
    fuelEfficiency: '',
  },
  {
    name: 'Hyundai Tucson',
    image: '/vehicles/TUCSON.png',
    type: 'SUV',
    category: 'SUV',
    price: '60,000 RWF/day',
    year: 2013,
    engine: '1,995cc',
    mileage: '33,000km',
    transmission: 'Automatic',
    fuel: 'Diesel',
    capacity: '5 Seats',
    doors: 4,
    description: 'The Hyundai Tucson is a compact SUV with a reputation for reliability and comfort. Great for both urban and rural travel.',
    isAvailable: true,
    power: '',
    fuelEfficiency: '',
  },
  {
    name: 'Toyota Levin',
    image: '/vehicles/LEVIN.png',
    type: 'Sedan',
    category: 'Car',
    price: '60,000 RWF/day',
    year: 2022,
    engine: '1.8L 99HP L4',
    mileage: '62,700km',
    transmission: 'Automatic',
    fuel: 'Gasoline + Electric',
    capacity: '5 Seats',
    doors: 4,
    description: 'The Toyota Levin blends efficiency and style. A modern sedan for those who value comfort and advanced technology.',
    isAvailable: true,
    power: '',
    fuelEfficiency: '',
  },
  {
    name: 'Toyota Prius',
    image: '/vehicles/PRIUS.png',
    type: 'Sedan',
    category: 'Car',
    price: '50,000 RWF/day',
    year: 2010,
    engine: '1,798cc',
    mileage: '130,004km',
    transmission: 'Automatic',
    fuel: 'Hybrid (Petrol)',
    capacity: '5 Seats',
    doors: 4,
    description: "The Toyota Prius is the world's favorite hybrid, offering outstanding fuel economy and a comfortable ride for city and highway.",
    isAvailable: true,
    power: '',
    fuelEfficiency: '',
  },
  {
    name: 'Kia K5 Optima',
    image: '/vehicles/KI 5.png',
    type: 'Sedan',
    category: 'Car',
    price: '50,000 RWF/day',
    year: 2015,
    engine: '1,999cc',
    mileage: '76,500km',
    transmission: 'Automatic',
    fuel: 'Hybrid (Petrol)',
    capacity: '5 Seats',
    doors: 4,
    description: 'The Kia K5 Optima is a stylish sedan with advanced features and a smooth, quiet ride. Ideal for business and leisure.',
    isAvailable: true,
    power: '',
    fuelEfficiency: '',
  },
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const expandedVehicles = [];
expandedVehicles.forEach(base => {
  const count = randomInt(10, 15);
  for (let i = 0; i < count; i++) {
    expandedVehicles.push({
      ...base,
      year: randomInt(2010, 2025),
      mileage: `${randomInt(20000, 200000)}km`,
      isAvailable: Math.random() > 0.2,
      // Optionally, add a unique suffix to name to avoid duplicates
      name: `${base.name} #${i+1}`,
    });
  }
});

async function main() {
  await prisma.vehicle.createMany({
    data: expandedVehicles,
    skipDuplicates: true,
  });
  console.log('Seeded all vehicles.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 