const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

// Load .env manually
try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        const envFile = fs.readFileSync(envPath, 'utf8');
        envFile.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const value = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
                if (key && value) {
                    process.env[key] = value;
                }
            }
        });
        console.log('Loaded .env file');
    }
} catch (e) {
    console.log('Could not load .env file, relying on process.env');
}

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
    console.error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
    console.log('Please ensure these variables are set in your .env file');
    process.exit(1);
}

console.log(`Connecting to Turso DB at ${url.replace(/:[^:]*@/, ':***@')}...`);

const client = createClient({
    url,
    authToken,
});

const sql = `
CREATE TABLE IF NOT EXISTS "PettyCashTransaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT,
    "receiptUrl" TEXT,
    "requestedBy" TEXT,
    "approvedBy" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "balanceAfter" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
`;

async function main() {
    try {
        console.log('Creating PettyCashTransaction table...');
        await client.execute(sql);
        console.log('Table created successfully!');
    } catch (e) {
        console.error('Error creating table:', e);
    } finally {
        // client.close() is not always available/needed depending on the adapter version, but good practice if it exists
        if (client.close) client.close();
    }
}

main();
