require('dotenv').config()
const { Pool } = require('pg')

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
})

async function main() {
  try {
    console.log('Checking details for: cristovaoms@gmail.com')
    const res = await pool.query(`SELECT id, name, email, role, status, "clerkId" FROM "fitconnect"."User" WHERE email = 'cristovaoms@gmail.com'`)
    
    if (res.rows.length > 0) {
        console.log('User found:')
        console.table(res.rows)
    } else {
        console.log('User NOT found in "fitconnect"."User"')
    }
  } catch (e) {
    console.error('Error:', e)
  } finally {
    await pool.end()
  }
}

main()
