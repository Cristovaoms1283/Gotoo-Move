require('dotenv').config()
const { Pool } = require('pg')

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
})

async function main() {
  try {
    console.log('Searching for email: cristovaoms@gmail.com in all schemas...')
    const res = await pool.query(`
        SELECT table_schema, table_name 
        FROM information_schema.columns 
        WHERE column_name = 'email'
    `)
    
    for (const row of res.rows) {
        const check = await pool.query(`SELECT count(*) FROM "${row.table_schema}"."${row.table_name}" WHERE email = 'cristovaoms@gmail.com'`)
        if (parseInt(check.rows[0].count) > 0) {
            console.log(`FOUND in: ${row.table_schema}.${row.table_name}`)
        } else {
            console.log(`Tested ${row.table_schema}.${row.table_name}: not found`)
        }
    }
  } catch (e) {
    console.error('Error:', e)
  } finally {
    await pool.end()
  }
}

main()
