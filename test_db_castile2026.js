const { Client } = require('pg');

async function test() {
    const connectionString = 'postgresql://postgres.ufjhktejyxxtczkwuowr:castile2026@aws-1-us-east-1.pooler.supabase.com:6543/postgres';
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log("Connection successful!");
        await client.end();
    } catch (e) {
        console.error("Connection failed:", e.message);
    }
}
test();
