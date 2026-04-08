const { Pool } = require('pg');
require('dotenv').config();

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const res = await pool.query('SELECT id, name, email, goal, whatsapp, "clerkId" FROM fitconnect."User" ORDER BY "updatedAt" DESC LIMIT 5');
    console.log("LAST UPDATED USERS:");
    console.table(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

main();
