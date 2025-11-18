/*
  Increment quantity by 15 for every vehicle model.
  Usage: node scripts/add-fifteen-to-each-model.cjs
*/
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL },
  },
});

async function main() {
  console.log('Adding 15 cars to each model fleet...');
  const res = await prisma.vehicle.updateMany({
    data: { quantity: { increment: 15 } },
  });
  console.log(`Updated ${res.count} models.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });


