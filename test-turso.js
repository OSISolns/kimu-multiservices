const { PrismaClient } = require('@prisma/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');
require('dotenv').config();

async function testDatabase() {
    try {
        console.log('🧪 Testing Turso database connection...\n');

        // Initialize Prisma with libSQL adapter (same way as in src/lib/prisma.ts)
        const adapter = new PrismaLibSQL({
            url: process.env.TURSO_DATABASE_URL,
            authToken: process.env.TURSO_AUTH_TOKEN,
        });

        const prisma = new PrismaClient({
            adapter,
            log: ['error'],
        });

        // Test 1: Count existing users
        const userCount = await prisma.user.count();
        console.log(`✅ Test 1: Found ${userCount} users in database`);

        // Test 2: Count vehicles
        const vehicleCount = await prisma.vehicle.count();
        console.log(`✅ Test 2: Found ${vehicleCount} vehicles in database`);

        // Test 3: Count bookings
        const bookingCount = await prisma.booking.count();
        console.log(`✅ Test 3: Found ${bookingCount} bookings in database`);

        // Test 4: List all tables
        const tables = await prisma.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%'
      ORDER BY name;
    `;
        console.log(`\n✅ Test 4: Database has ${tables.length} tables:`);
        tables.forEach(table => console.log(`   - ${table.name}`));

        console.log('\n🎉 All tests passed! Your Vercel Turso database is working correctly!');

        await prisma.$disconnect();

    } catch (error) {
        console.error('❌ Database test failed:', error);
        process.exit(1);
    }
}

testDatabase();
