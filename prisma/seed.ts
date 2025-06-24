const { PrismaClient } = require('../src/generated/prisma');
const speakeasy = require('speakeasy');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Generate a unique TOTP secret for the agent
  const agentTotpSecret = speakeasy.generateSecret({ length: 20 }).base32;

  // Upsert agent user
  await prisma.user.upsert({
    where: { username: 'agent1' },
    update: { totpSecret: agentTotpSecret },
    create: {
      username: 'agent1',
      passwordHash: 'demo', // Not used for TOTP, just a placeholder
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 