const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

const notifications = [
  {
    userId: 1,
    message: 'New booking received: Car rental for John Smith',
    type: 'booking',
    read: false
  },
  {
    userId: 1,
    message: 'Vehicle Toyota RAV4 has been returned successfully',
    type: 'return',
    read: true
  },
  {
    userId: null,
    message: 'System maintenance scheduled for tomorrow at 2:00 AM',
    type: 'system',
    read: false
  },
  {
    userId: 1,
    message: 'Payment received for booking #1234',
    type: 'payment',
    read: false
  },
  {
    userId: 1,
    message: 'Airport transfer booking confirmed for Sarah Johnson',
    type: 'booking',
    read: true
  },
  {
    userId: null,
    message: 'New vehicle Toyota Sorento added to fleet',
    type: 'inventory',
    read: false
  },
  {
    userId: 1,
    message: 'Customer feedback received for booking #1234',
    type: 'feedback',
    read: false
  },
  {
    userId: 1,
    message: 'Vehicle Toyota Land Cruiser requires maintenance',
    type: 'maintenance',
    read: true
  },
  {
    userId: 1,
    message: 'New taxi booking from Emma Wilson',
    type: 'booking',
    read: false
  },
  {
    userId: null,
    message: 'Database backup completed successfully',
    type: 'system',
    read: true
  },
  {
    userId: 1,
    message: 'Booking #1235 cancelled by customer',
    type: 'cancellation',
    read: false
  },
  {
    userId: 1,
    message: 'Vehicle Toyota Noah is now available',
    type: 'inventory',
    read: true
  },
  {
    userId: 1,
    message: 'Payment overdue for booking #1236',
    type: 'payment',
    read: false
  },
  {
    userId: null,
    message: 'Weather alert: Heavy rain expected tomorrow',
    type: 'weather',
    read: false
  },
  {
    userId: 1,
    message: 'Customer David Brown requested booking modification',
    type: 'modification',
    read: false
  },
  {
    userId: 1,
    message: 'Vehicle Toyota Coaster returned with damage',
    type: 'damage',
    read: true
  },
  {
    userId: 1,
    message: 'New airport transfer booking from Lisa Anderson',
    type: 'booking',
    read: false
  },
  {
    userId: null,
    message: 'System update completed - new features available',
    type: 'system',
    read: false
  },
  {
    userId: 1,
    message: 'Customer Robert Taylor left 5-star review',
    type: 'review',
    read: false
  },
  {
    userId: 1,
    message: 'Vehicle Toyota Sonata maintenance completed',
    type: 'maintenance',
    read: true
  },
  {
    userId: 1,
    message: 'Booking #1237 confirmed for Maria Garcia',
    type: 'booking',
    read: false
  },
  {
    userId: null,
    message: 'Monthly revenue report is ready',
    type: 'report',
    read: false
  },
  {
    userId: 1,
    message: 'Customer James Miller requested early pickup',
    type: 'modification',
    read: false
  },
  {
    userId: 1,
    message: 'Vehicle Toyota Levin fuel level low',
    type: 'maintenance',
    read: true
  },
  {
    userId: 1,
    message: 'New booking from Jennifer Davis confirmed',
    type: 'booking',
    read: false
  },
  {
    userId: null,
    message: 'Security alert: Unusual login attempt detected',
    type: 'security',
    read: false
  },
  {
    userId: 1,
    message: 'Customer feedback: Excellent service experience',
    type: 'feedback',
    read: false
  },
  {
    userId: 1,
    message: 'Vehicle Toyota Coaster cleaned and ready',
    type: 'inventory',
    read: true
  },
  {
    userId: 1,
    message: 'Payment received for booking #1238',
    type: 'payment',
    read: false
  }
];

async function seedNotifications() {
  try {
    console.log('🌱 Seeding notifications...');
    
    const result = await prisma.notification.createMany({
      data: notifications,
      skipDuplicates: true
    });
    
    console.log(`✅ Successfully seeded ${result.count} notifications`);
  } catch (error) {
    console.error('❌ Error seeding notifications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedNotifications(); 