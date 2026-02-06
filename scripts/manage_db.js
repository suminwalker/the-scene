// scripts/manage_db.js
// Run with: node scripts/manage_db.js "SELECT NOW();" 
// Or: node scripts/manage_db.js path/to/file.sql

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// 1. Load Env Logic (same as migrate_venues.js)
try {
    const envPath = path.resolve(__dirname, '../.env.local');
    if (fs.existsSync(envPath)) {
        const envFile = fs.readFileSync(envPath, 'utf8');
        envFile.split('\n').forEach(line => {
            const [key, ...rest] = line.split('=');
            if (key && rest.length > 0) {
                const value = rest.join('=').trim().replace(/^["']|["']$/g, ''); // simplistic unquote
                process.env[key.trim()] = value;
            }
        });
        console.log('Loaded environment variables from .env.local');
    }
} catch (e) {
    console.warn('Could not read .env.local, checking process.env directly...');
}

// 2. Get Connection String
const connectionString = process.env.SUPABASE_DB_URL;

if (!connectionString) {
    console.error('\n❌ Missing SUPABASE_DB_URL in .env.local');
    console.error('Please add your Connection String from Supabase Settings -> Database -> Connection String (Nodejs)\n');
    console.error('Format: SUPABASE_DB_URL="postgresql://postgres.[ref]:[password]@aws-0-us-west-1.pooler.supabase.com:6543/postgres"\n');
    process.exit(1);
}

const client = new Client({
    connectionString: connectionString,
});

async function run() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error('Please provide a SQL query or a path to a .sql file.');
        process.exit(1);
    }

    const input = args[0];
    let query = input;

    // Check if input is a file
    if (fs.existsSync(input) || input.endsWith('.sql')) {
        try {
            query = fs.readFileSync(input, 'utf8');
            console.log(`Executing SQL from file: ${input}`);
        } catch (e) {
            // It might be a raw query that just looks like a path?
            // If it ends not existing, we assume it's a query string if it starts with SELECT/UPDATE etc
            if (!input.match(/^(SELECT|INSERT|UPDATE|DELETE|ALTER|CREATE|DROP)/i)) {
                console.error(`Could not read file: ${input}`);
                process.exit(1);
            }
        }
    } else {
        console.log(`Executing raw SQL query...`);
    }

    try {
        await client.connect();
        const res = await client.query(query);

        console.log('\n✅ Success!');
        if (res.rows.length > 0) {
            console.table(res.rows);
        } else {
            console.log('No rows returned.');
        }

    } catch (err) {
        console.error('\n❌ Database Error:', err.message);
    } finally {
        await client.end();
    }
}

run();
