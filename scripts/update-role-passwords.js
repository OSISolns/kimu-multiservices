const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updateRolePasswords() {
  try {
    console.log('Starting password update for accountant and transport-officer roles...');

    // New password to set
    const newPassword = 'kimu@2025';
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Find users with accountant and transport-officer roles
    const usersToUpdate = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'accountant' },
          { role: 'transport-officer' }
        ]
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true
      }
    });

    if (usersToUpdate.length === 0) {
      console.log('No users found with accountant or transport-officer roles.');
      return;
    }

    console.log(`Found ${usersToUpdate.length} users to update:`);
    usersToUpdate.forEach(user => {
      console.log(`- ${user.username} (${user.fullName || 'No full name'}) - Role: ${user.role}`);
    });

    // Confirm before proceeding
    console.log('\nUpdating passwords to "kimu@2025"...');

    // Update passwords for all found users
    const updateResult = await prisma.user.updateMany({
      where: {
        OR: [
          { role: 'accountant' },
          { role: 'transport-officer' }
        ]
      },
      data: {
        passwordHash: hashedPassword
      }
    });

    console.log(`\n✅ Successfully updated passwords for ${updateResult.count} users.`);
    
    // Log updated users for confirmation
    console.log('\nUpdated users:');
    usersToUpdate.forEach(user => {
      console.log(`✓ ${user.username} (${user.role}) - Password: kimu@2025`);
    });

  } catch (error) {
    console.error('❌ Error updating passwords:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateRolePasswords();
