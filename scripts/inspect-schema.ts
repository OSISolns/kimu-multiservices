
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Employee Table Definition ---');
    const tableResult = await prisma.$queryRaw`SELECT sql FROM sqlite_master WHERE type='table' AND name='Employee'`;
    console.log(JSON.stringify(tableResult, null, 2));

    console.log('--- Employee Indexes ---');
    const indexResult = await prisma.$queryRaw`SELECT name, sql FROM sqlite_master WHERE type='index' AND tbl_name='Employee'`;
    console.log(JSON.stringify(indexResult, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
