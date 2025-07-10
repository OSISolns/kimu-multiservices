const { PrismaClient } = require('../src/generated/prisma');
const speakeasy = require('speakeasy');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Generate a unique TOTP secret for the agent
  const agentTotpSecret = speakeasy.generateSecret({ length: 20 }).base32;
  const agentPassword = 'agent1@2025';
  const agentHash = await bcrypt.hash(agentPassword, 10);

  // Upsert agent user
  await prisma.user.upsert({
    where: { username: 'agent1' },
    update: { passwordHash: agentHash, totpSecret: agentTotpSecret },
    create: {
      username: 'agent1',
      passwordHash: agentHash,
      totpSecret: agentTotpSecret,
    },
  });

  // Generate a unique TOTP secret for the admin
  const adminTotpSecret = speakeasy.generateSecret({ length: 20 }).base32;
  const adminPassword = 'kimu@2025';
  const adminHash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: { passwordHash: adminHash, role: 'admin', totpSecret: adminTotpSecret },
    create: {
      username: 'admin',
      passwordHash: adminHash,
      role: 'admin',
      totpSecret: adminTotpSecret,
    },
  });

  console.log('Seeded agent1 and admin user with TOTP secrets.');
  console.log('Agent1 password: agent1@2025');
  console.log('Admin password: kimu@2025');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 