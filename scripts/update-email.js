const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    try {
        const email = 'valery.osisolns@gmail.com'; // Using a likely valid email from codebase for testing
        console.log(`Updating admin email to ${email}...`);

        await prisma.user.update({
            where: { username: 'admin' },
            data: { email: email }
        });

        console.log('Admin email updated successfully.');
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
