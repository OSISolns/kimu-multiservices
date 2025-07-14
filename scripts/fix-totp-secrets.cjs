const { PrismaClient } = require('../src/generated/prisma');
const speakeasy = require('speakeasy');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  for (const user of users) {
    if (!user.totpSecret) {
      const totpSecret = speakeasy.generateSecret({ length: 20, name: `KIMU:${user.username}`, issuer: 'KIMU' }).base32;
      await prisma.user.update({
        where: { id: user.id },
        data: { totpSecret },
      });
      console.log(`Updated user ${user.username} with new TOTP secret.`);
    }
  }
  await prisma.$disconnect();
}

main(); 