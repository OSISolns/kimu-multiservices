
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Starting FK Reproduction Script ---');
    const id1 = `TEST_FK_${Date.now()}`;

    try {
        console.log('Attempting to create employee with NON-EXISTENT userId 999999...');
        await prisma.employee.create({
            data: {
                employeeId: id1,
                firstName: 'FK',
                lastName: 'Fail',
                position: 'Tester',
                department: 'IT',
                employmentType: 'full-time',
                hireDate: new Date(),
                salary: 50000,
                userId: 999999, // Guarantee this user doesn't exist
                salaryStructures: {
                    create: {
                        baseSalary: 50000,
                        allowances: {},
                        deductions: {},
                        effectiveDate: new Date(),
                        isActive: true,
                    }
                }
            },
        });
    } catch (error: any) {
        console.log('--- Caught Error ---');
        console.log('Name:', error.name);
        console.log('Code:', error.code);
        console.log('Message:', error.message);
        if (error.meta) console.log('Meta:', error.meta);
    } finally {
        await prisma.$disconnect();
    }
}

main();
