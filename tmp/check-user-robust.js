require('dotenv').config()
const { Pool } = require('pg')

const connectionString = process.env.DATABASE_URL
console.log('ConnectionString starting with:', connectionString.substring(0, 20))

const pool = new Pool({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
})

async function main() {
  try {
    console.log('Connecting to pool...')
    const client = await pool.connect()
    console.log('Connected!')
    
    const email = 'gun_fire2508@hotmail.com'
    const res = await client.query('SELECT id, email, "activeProgramId", "runningProgramId" FROM "fitconnect"."User" WHERE email = $1', [email])
    console.log('Result:', JSON.stringify(res.rows, null, 2))
    
    client.release()
  } catch (e) {
    console.error('OH NO ERROR:', e.message)
    console.error(e.stack)
  } finally {
    await pool.end()
  }
}

main()
