require('dotenv').config()
const { Pool } = require('pg')

// Simulate adding options to connection string
let connectionString = process.env.DATABASE_URL
if (!connectionString.includes('options=')) {
    const separator = connectionString.includes('?') ? '&' : '?'
    connectionString += `${separator}options=-csearch_path%3Dfitconnect`
}

console.log('Testing connection with options:', connectionString.replace(/:[^:@]+@/, ':***@'))

const pool = new Pool({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
})

async function main() {
  try {
    console.log('Querying current_schema()...')
    const schemaRes = await pool.query('SELECT current_schema()')
    console.log('Current schema (should be fitconnect):', schemaRes.rows[0].current_schema)

    console.log('Querying User table without schema prefix...')
    const userRes = await pool.query('SELECT COUNT(*) FROM "User"')
    console.log('Success! User count:', userRes.rows[0].count)

  } catch (e) {
    console.error('Error:', e.message)
    if (e.detail) console.error('Detail:', e.detail)
  } finally {
    await pool.end()
  }
}

main()
