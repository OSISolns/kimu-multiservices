require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL },
  },
});

async function testIncomeInput() {
  console.log('Testing income input functionality...');
  
  try {
    // Test creating an income record
    const testIncome = await prisma.income.create({
      data: {
        description: 'Test Car Rental Payment',
        amount: 50000,
        category: 'car_rental',
        paymentMethod: 'MTN Momo',
        date: new Date(),
        reference: 'TEST-001',
        notes: 'Test income record',
        clientName: 'Test Client',
        clientPhone: '+250788123456'
      }
    });
    
    console.log('✅ Income record created successfully:', testIncome);
    
    // Test fetching income records
    const allIncome = await prisma.income.findMany({
      orderBy: { date: 'desc' }
    });
    
    console.log('✅ Total income records:', allIncome.length);
    console.log('✅ Sample income record:', allIncome[0]);
    
    // Test filtering by category
    const carRentalIncome = await prisma.income.findMany({
      where: { category: 'car_rental' }
    });
    
    console.log('✅ Car rental income records:', carRentalIncome.length);
    
  } catch (error) {
    console.error('❌ Error testing income input:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testIncomeInput();
