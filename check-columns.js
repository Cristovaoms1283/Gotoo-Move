require('dotenv').config()
const { Pool } = require('pg')

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
})

async function main() {
  try {
    await pool.query('SET search_path TO fitconnect, public');
    console.log('Listing columns for User table in fitconnect schema...')
    const res = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'fitconnect' AND table_name = 'User'
    `)
    console.log('Columns in User table:', res.rows)
  } catch (e) {
    console.error('Error:', e)
  } finally {
    await pool.end()
  }
}

main()
