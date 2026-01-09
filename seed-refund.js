
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');

async function main() {
    const tursoUrl = process.env.TURSO_DATABASE_URL;
    const tursoToken = process.env.TURSO_AUTH_TOKEN;

    const adapter = new PrismaLibSQL({
        url: tursoUrl,
        authToken: tursoToken,
    });
    const prisma = new PrismaClient({ adapter });


    const retryOperation = async (operation, maxRetries = 3) => {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await operation();
            } catch (error) {
                if (i === maxRetries - 1) throw error;
                console.log(`Attempt ${i + 1} failed, retrying...`);
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
            }
        }
    };

    try {
        console.log('creating income...');
        const income = await retryOperation(() => prisma.income.create({
            data: {
                description: 'Rental - Toyota RAV4 (Seed)',
                amount: 100000,
                category: 'car_rental',
                paymentMethod: 'Cash',
                date: new Date(),
                clientName: 'Test Client',
            },
        }));
        console.log('Created Income:', income.id);

        console.log('Creating partial refund...');
        const refund = await retryOperation(() => prisma.income.create({
            data: {
                description: 'Partial Refund - Toyota RAV4',
                amount: -20000,
                category: 'refund',
                paymentMethod: 'Cash',
                date: new Date(),
                isRefund: true,
                originalIncomeId: income.id,
            },
        }));
        console.log('Created Refund:', refund.id);


    } catch (error) {
        console.error('Error seeding refund:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
