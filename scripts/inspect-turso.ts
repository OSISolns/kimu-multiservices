
import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';

// Manual .env parsing
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf-8');
            content.split('\n').forEach(line => {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    const value = match[2].trim().replace(/^["']|["']$/g, ''); // strip quotes
                    if (!process.env[key]) {
                        process.env[key] = value;
                    }
                }
            });
            console.log('.env file manually loaded.');
        } else {
            console.log('.env file not found at', envPath);
        }
    } catch (e: any) {
        console.error('Error manual loading .env:', e.message);
    }
}

loadEnv();

async function main() {
    console.log('--- Inspecting Turso Remote Database ---');

    let tursoUrl = process.env.TURSO_DATABASE_URL || process.env.kimutransport_TURSO_DATABASE_URL;
    let tursoToken = process.env.TURSO_AUTH_TOKEN || process.env.kimutransport_TURSO_AUTH_TOKEN;

    // Clean up "undefined" string if present
    if (tursoUrl === 'undefined') tursoUrl = undefined;
    if (tursoToken === 'undefined') tursoToken = undefined;

    console.log('URL defined?', !!tursoUrl);
    console.log('Token defined?', !!tursoToken);

    if (!tursoUrl || !tursoToken) {
        console.error('❌ Missing Turso credentials!');
        return;
    }

    const libsql = createClient({
        url: tursoUrl,
        authToken: tursoToken,
    });

    const adapter = new PrismaLibSQL(libsql);
    const prisma = new PrismaClient({ adapter });

    try {
        console.log('\n--- Employee Table Definition ---');
        const tableResult = await prisma.$queryRaw`SELECT sql FROM sqlite_master WHERE type='table' AND name='Employee'`;
        console.log(JSON.stringify(tableResult, null, 2));

        console.log('\n--- Employee Indexes ---');
        const indexResult = await prisma.$queryRaw`SELECT name, sql FROM sqlite_master WHERE type='index' AND tbl_name='Employee'`;
        console.log(JSON.stringify(indexResult, null, 2));

        // TEST INSERTION 
        // ... (Simplified test)
        console.log('\n--- Test: Create with OMITTED userId ---');
        try {
            const createData: any = {
                employeeId: `TEST_TURSO_OMIT_${Date.now()}`,
                firstName: 'Turso',
                lastName: 'Omit',
                position: 'Tester',
                department: 'IT',
                employmentType: 'full-time',
                hireDate: new Date(),
                salary: 50000,
                salaryStructures: { create: { baseSalary: 50000, allowances: {}, deductions: {}, effectiveDate: new Date(), isActive: true } }
            };
            const emp = await prisma.employee.create({ data: createData });
            console.log('✅ Success! ID:', emp.id);
            await prisma.employee.delete({ where: { id: emp.id } });
        } catch (e: any) {
            console.error('❌ Failed:', e.code, e.message);
        }

    } catch (e: any) {
        console.error('Error during inspection:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
