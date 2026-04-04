require('dotenv').config()
const { Pool } = require('pg')

const connectionString = process.env.DATABASE_URL
console.log('Testing connection to:', connectionString.replace(/:[^:@]+@/, ':***@'))

const pool = new Pool({ 
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
})

async function main() {
  try {
    console.log('Querying SELECT NOW()...')
    const res = await pool.query('SELECT NOW()')
    console.log('Success! Database time:', res.rows[0].now)
    
    console.log('Querying current_schema()...')
    const schemaRes = await pool.query('SELECT current_schema()')
    console.log('Current schema:', schemaRes.rows[0].current_schema)

    console.log('Listing tables in fitconnect schema...')
    const tablesRes = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'fitconnect'")
    console.log('Tables:', tablesRes.rows.map(r => r.table_name))

  } catch (e) {
    console.error('Error during raw PG test:', e)
  } finally {
    await pool.end()
  }
}

main()
