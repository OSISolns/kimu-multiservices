
import { prisma } from '../src/lib/prisma';

async function main() {
    try {
        console.log('Verifying Turso connection...');

        // Check environment variables
        if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
            console.warn('⚠️  Turso credentials not found in process.env!');
        } else {
            console.log('✅ Turso credentials detected.');
        }

        const userCount = await prisma.user.count();
        console.log(`✅ Connected successfully! Found ${userCount} users.`);

        const vehicles = await prisma.vehicle.count();
        console.log(`✅ Found ${vehicles} vehicles.`);

    } catch (error) {
        console.error('❌ Connection failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
