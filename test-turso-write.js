
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');
const { createClient } = require('@libsql/client');

async function main() {
    const tursoUrl = process.env.TURSO_DATABASE_URL;
    const tursoToken = process.env.TURSO_AUTH_TOKEN;

    if (!tursoUrl || !tursoToken) {
        console.error('Missing Turso credentials');
        process.exit(1);
    }

    console.log('Connecting to Turso...');
    console.log('URL:', tursoUrl);

    /*
  const libsql = createClient({
    url: tursoUrl,
    authToken: tursoToken,
  });

  const adapter = new PrismaLibSQL(libsql);
  */
    // Matching src/lib/prisma.ts implementation which passes config object directly?
    // Wait, let's verify if src/lib/prisma.ts uses createClient or just passes object.
    // src/lib/prisma.ts: const adapter = new PrismaLibSQL({ url: tursoUrl, authToken: tursoToken });
    // So we should do the same.

    const adapter = new PrismaLibSQL({
        url: tursoUrl,
        authToken: tursoToken,
    });
    const prisma = new PrismaClient({ adapter });

    try {
        console.log('Attempting to create a test income record...');
        const income = await prisma.income.create({
            data: {
                description: 'Test Income ' + new Date().toISOString(),
                amount: 100,
                category: 'other',
                paymentMethod: 'Cash',
                date: new Date(),
            },
        });
        console.log('Successfully created income:', income);

        console.log('Attempting to delete the test income record...');
        await prisma.income.delete({
            where: { id: income.id },
        });
        console.log('Successfully deleted test income');

    } catch (error) {
        console.error('Error executing write operation:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
