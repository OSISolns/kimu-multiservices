const { createClient } = require('@libsql/client');

// Get credentials from environment
const url = process.env.kimutransport_TURSO_DATABASE_URL || process.env.TURSO_DATABASE_URL;
const authToken = process.env.kimutransport_TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
    console.error('❌ Missing Turso credentials!');
    console.error('Please set kimutransport_TURSO_DATABASE_URL and kimutransport_TURSO_AUTH_TOKEN');
    process.exit(1);
}

console.log(`🚀 Connecting to Turso at: ${url.substring(0, 50)}...`);

const client = createClient({ url, authToken });

async function addRefundColumns() {
    try {
        console.log('📝 Adding refund columns to Income table...');

        // Add isRefund column
        try {
            await client.execute(`ALTER TABLE Income ADD COLUMN isRefund INTEGER DEFAULT 0`);
            console.log('✅ Added isRefund column');
        } catch (error) {
            if (error.message.includes('duplicate column')) {
                console.log('⚠️  isRefund column already exists');
            } else {
                throw error;
            }
        }

        // Add originalIncomeId column
        try {
            await client.execute(`ALTER TABLE Income ADD COLUMN originalIncomeId INTEGER`);
            console.log('✅ Added originalIncomeId column');
        } catch (error) {
            if (error.message.includes('duplicate column')) {
                console.log('⚠️  originalIncomeId column already exists');
            } else {
                throw error;
            }
        }

        console.log('\\n✅ Schema update complete!');

        // Verify the columns
        const result = await client.execute(`PRAGMA table_info(Income)`);
        console.log('\\n📊 Income table columns:');
        result.rows.forEach(row => {
            console.log(`  - ${row.name} (${row.type})`);
        });

    } catch (error) {
        console.error('❌ Error updating schema:', error);
        process.exit(1);
    } finally {
        client.close();
    }
}

addRefundColumns();
