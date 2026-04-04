require('dotenv').config()
const { Pool } = require('pg')

const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
})

async function main() {
  try {
    const res = await pool.query(`SELECT * FROM "fitconnect"."User" WHERE email = 'cristovaoms@gmail.com'`)
    console.log(JSON.stringify(res.rows, null, 2))
  } catch (e) {
    console.error('Error:', e)
  } finally {
    await pool.end()
  }
}

main()
