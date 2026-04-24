const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    try {
        const userCount = await prisma.user.count();
        console.log(`User count: ${userCount}`);

        if (userCount === 0) {
            console.log('No users found. Creating default admin user...');
            const hashedPassword = await bcrypt.hash('password123', 10);

            const user = await prisma.user.create({
                data: {
                    username: 'admin',
                    passwordHash: hashedPassword,
                    email: 'admin@kimu.com', // Ensure this email is valid for testing 2FA if needed, or user can update it
                    fullName: 'System Admin',
                    role: 'admin',
                    status: 'active',
                    emailNotifications: true
                }
            });
            console.log('Created user:', user.username);
        } else {
            const users = await prisma.user.findMany({
                select: { username: true, email: true, role: true }
            });
            console.log('Existing users:', users);
        }
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
