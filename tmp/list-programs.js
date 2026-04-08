require('dotenv').config()
const { Pool } = require('pg')

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
})

async function main() {
  try {
    const res = await pool.query(`
        SELECT id, title, category, goal, month 
        FROM "fitconnect"."TrainingProgram"
        ORDER BY category, month, title
    `)
    console.table(res.rows)
  } catch (e) {
    console.error('Error:', e)
  } finally {
    await pool.end()
  }
}

main()
