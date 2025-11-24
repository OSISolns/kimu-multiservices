const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL },
  },
});

// Map vehicle names to their corresponding image files from the tariff banner
const vehicleImageMap = {
  'Toyota Prado TXL': '/vehicles/TXL.png',
  'Toyota Coaster': '/vehicles/COASTER.png', 
  'Rav4 Full Electric': '/vehicles/RAV 4.png',
  'KIA SORENTO': '/vehicles/SORENTO.png',
  'Hyundai Sonata': '/vehicles/SONATA.png',
  'Toyota Noah': '/vehicles/NOAH.png',
  'Hyundai Tucson': '/vehicles/TUCSON.png',
  'Toyota Levin': '/vehicles/LEVIN.png',
  'Toyota Prius': '/vehicles/PRIUS.png',
  'Kia K5 Optima': '/vehicles/KI 5.png',
};

async function updateVehicleImages() {
  console.log('Updating vehicle images to match tariff banner...');
  
  for (const [vehicleName, imagePath] of Object.entries(vehicleImageMap)) {
    try {
      const result = await prisma.vehicle.updateMany({
        where: { name: vehicleName },
        data: { image: imagePath }
      });
      
      if (result.count > 0) {
        console.log(`✅ Updated ${vehicleName} image to ${imagePath}`);
      } else {
        console.log(`⚠️  No vehicle found with name: ${vehicleName}`);
      }
    } catch (error) {
      console.error(`❌ Error updating ${vehicleName}:`, error.message);
    }
  }
  
  console.log('Image update completed!');
}

updateVehicleImages()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
