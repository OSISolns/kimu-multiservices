
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Triggers ---');
    const triggers = await prisma.$queryRaw`SELECT name, tbl_name, sql FROM sqlite_master WHERE type='trigger'`;
    console.log(JSON.stringify(triggers, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
