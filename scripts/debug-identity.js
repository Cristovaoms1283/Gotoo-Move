const { Pool } = require('pg');
require('dotenv').config();

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const res = await pool.query(`
      SELECT id, name, email, goal, whatsapp, "clerkId", "updatedAt" 
      FROM fitconnect."User" 
      WHERE email ILIKE '%cristovaoms%' OR name ILIKE '%Cristo%'
      ORDER BY "updatedAt" DESC
    `);
    console.log("MATCHING USERS:");
    console.table(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
