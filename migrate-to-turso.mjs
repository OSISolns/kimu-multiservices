#!/usr/bin/env node

/**
 * Migrate local SQLite database to Turso
 * This script exports the schema and data from local dev.db and imports it to Turso
 */

import { createClient } from '@libsql/client';
import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

const LOCAL_DB_PATH = path.join(process.cwd(), 'prisma', 'dev.db');

async function migrateToTurso() {
    console.log('🔄 Starting migration from local SQLite to Turso...\n');

    // Check if local database exists
    if (!fs.existsSync(LOCAL_DB_PATH)) {
        console.error('❌ Local database not found at:', LOCAL_DB_PATH);
        process.exit(1);
    }

    // Check Turso credentials
    const tursoUrl = process.env.TURSO_DATABASE_URL;
    const tursoToken = process.env.TURSO_AUTH_TOKEN;

    if (!tursoUrl || !tursoToken) {
        console.error('❌ Turso credentials not found in environment variables');
        console.error('Please set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN');
        process.exit(1);
    }

    console.log('✅ Turso credentials found');
    console.log('📍 Turso URL:', tursoUrl);
    console.log('📁 Local DB:', LOCAL_DB_PATH);
    console.log('');

    try {
        // Connect to local SQLite
        console.log('📂 Opening local SQLite database...');
        const localDb = new Database(LOCAL_DB_PATH, { readonly: true });

        // Connect to Turso
        console.log('🚀 Connecting to Turso...');
        const tursoClient = createClient({
            url: tursoUrl,
            authToken: tursoToken,
        });

        // Get schema from local database
        console.log('📋 Extracting schema...');
        const schema = localDb.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();

        // Get all table names
        const tables = localDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();

        console.log(`Found ${tables.length} tables to migrate\n`);

        // Create tables in Turso
        for (const table of schema) {
            if (table.sql) {
                console.log(`Creating table: ${table.sql.match(/CREATE TABLE "?(\w+)"?/)?.[1] || 'unknown'}`);
                try {
                    await tursoClient.execute(table.sql);
                } catch (error) {
                    // Table might already exist, that's okay
                    console.log(`  ⚠️  Table might already exist, continuing...`);
                }
            }
        }

        console.log('\n📊 Migrating data...');

        // Migrate data for each table
        for (const { name } of tables) {
            console.log(`\n📦 Migrating table: ${name}`);

            const rows = localDb.prepare(`SELECT * FROM ${name}`).all();
            console.log(`  Found ${rows.length} rows`);

            if (rows.length === 0) {
                console.log(`  ⏭️  Skipping empty table`);
                continue;
            }

            // Get column names from first row
            const columns = Object.keys(rows[0]);
            const placeholders = columns.map(() => '?').join(', ');
            const insertSql = `INSERT OR REPLACE INTO ${name} (${columns.join(', ')}) VALUES (${placeholders})`;

            // Batch inserts
            const BATCH_SIZE = 50;
            let inserted = 0;

            for (let i = 0; i < rows.length; i += BATCH_SIZE) {
                const batchRows = rows.slice(i, i + BATCH_SIZE);
                const batch = batchRows.map(row => {
                    const values = columns.map(col => row[col]);
                    return {
                        sql: insertSql,
                        args: values,
                    };
                });

                try {
                    await tursoClient.batch(batch, 'write');
                    inserted += batch.length;
                    process.stdout.write(`\r  ⏳ Progress: ${inserted}/${rows.length} rows`);
                } catch (error) {
                    console.error(`\n  ❌ Error inserting batch starting at index ${i}:`, error.message);
                }
            }
            console.log(''); // New line after progress

            console.log(`  ✅ Inserted ${inserted}/${rows.length} rows`);
        }

        localDb.close();
        console.log('\n✅ Migration completed successfully!');
        console.log('\n🎉 Your Turso database is now ready to use in production!');

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    }
}

migrateToTurso();
