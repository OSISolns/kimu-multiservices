const { createClient } = require('@libsql/client');
const { readFileSync } = require('fs');
require('dotenv').config();

const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
});

async function pushSchema() {
    try {
        console.log('🚀 Connecting to Turso database...');

        // Read the migration SQL
        const migrationSQL = readFileSync('./migration.sql', 'utf-8');

        // Split by semicolon and execute each statement
        const statements = migrationSQL
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        console.log(`📝 Executing ${statements.length} SQL statements...`);

        for (const statement of statements) {
            try {
                await client.execute(statement);
                console.log('✅ Executed:', statement.substring(0, 60) + '...');
            } catch (error) {
                // Ignore "table already exists" errors
                if (!error.message.includes('already exists')) {
                    console.error('❌ Error executing statement:', statement.substring(0, 60));
                    console.error('Error:', error.message);
                } else {
                    console.log('⚠️  Table already exists, skipping...');
                }
            }
        }

        console.log('✅ Schema pushed successfully to Turso!');

        // Verify by listing tables
        const tables = await client.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name;
    `);

        console.log('\n📊 Tables in database:');
        tables.rows.forEach(row => {
            console.log(`  - ${row.name}`);
        });

    } catch (error) {
        console.error('❌ Error pushing schema:', error);
        process.exit(1);
    } finally {
        client.close();
    }
}

pushSchema();
