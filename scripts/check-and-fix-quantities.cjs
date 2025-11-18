const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL },
  },
});

async function main() {
  console.log('Checking current quantities...');
  const vehicles = await prisma.vehicle.findMany({
    select: { id: true, name: true, quantity: true }
  });
  
  console.log('Current quantities:');
  vehicles.forEach(v => console.log(`${v.name}: ${v.quantity}`));
  
  console.log('\nSetting all quantities to 15...');
  const result = await prisma.vehicle.updateMany({
    data: { quantity: 15 }
  });
  
  console.log(`Updated ${result.count} vehicles to quantity 15`);
  
  console.log('\nVerifying...');
  const updated = await prisma.vehicle.findMany({
    select: { name: true, quantity: true }
  });
  updated.forEach(v => console.log(`${v.name}: ${v.quantity}`));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
