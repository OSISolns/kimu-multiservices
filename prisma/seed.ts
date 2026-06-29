const { PrismaClient } = require('../src/generated/prisma');
const bcrypt = require('bcryptjs');
const { vehicles } = require('../src/data/vehicles');

const prisma = new PrismaClient();

async function main() {
  const agentPassword = 'agent1@2025';
  const agentHash = await bcrypt.hash(agentPassword, 10);

  // Upsert agent user
  await prisma.user.upsert({
    where: { username: 'agent1' },
    update: { passwordHash: agentHash },
    create: {
      username: 'agent1',
      passwordHash: agentHash,
    },
  });

  const adminPassword = 'kimu@2025';
  const adminHash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: { passwordHash: adminHash, role: 'admin' },
    create: {
      username: 'admin',
      passwordHash: adminHash,
      role: 'admin',
    },
  });

  console.log('Seeded agent1 and admin user.');
  console.log('Agent1 password: agent1@2025');
  console.log('Admin password: kimu@2025');

  // Seed vehicles
  for (const vehicle of vehicles) {
    await prisma.vehicle.upsert({
      where: { id: vehicle.id },
      update: vehicle,
      create: vehicle,
    });
  }
  console.log('Seeded vehicles.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 