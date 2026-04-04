require('dotenv').config()
const { Pool } = require('pg')

const connectionString = process.env.DATABASE_URL + '&options=-csearch_path%3Dfitconnect'
const pool = new Pool({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
})

async function main() {
  try {
    console.log('Testing case sensitivity...')
    
    try {
        console.log('Querying "User" (quoted)...')
        const q1 = await pool.query('SELECT count(*) FROM "User"')
        console.log('Success "User":', q1.rows[0].count)
    } catch(e) { console.log('Failed "User":', e.message) }

    try {
        console.log('Querying User (unquoted)...')
        const q2 = await pool.query('SELECT count(*) FROM User')
        console.log('Success User:', q2.rows[0].count)
    } catch(e) { console.log('Failed User:', e.message) }

    try {
        console.log('Querying "user" (quoted lowercase)...')
        const q3 = await pool.query('SELECT count(*) FROM "user"')
        console.log('Success "user":', q3.rows[0].count)
    } catch(e) { console.log('Failed "user":', e.message) }

  } catch (e) {
    console.error('Error:', e)
  } finally {
    await pool.end()
  }
}

main()
