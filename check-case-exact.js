require('dotenv').config()
const { Pool } = require('pg')

const connectionString = process.env.DATABASE_URL + '&options=-csearch_path%3Dfitconnect'
const pool = new Pool({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
})

async function main() {
  try {
    const res = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'fitconnect'
    `)
    console.log('Exact table names in fitconnect:')
    res.rows.forEach(r => {
        console.log(`'${r.table_name}'`)
    })

    const userRes = await pool.query(`
        SELECT table_name, column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'fitconnect' AND (table_name = 'User' OR table_name = 'user')
    `)
    console.log('\nColumns for User/user:')
    userRes.rows.forEach(r => {
        console.log(`${r.table_name}.${r.column_name}`)
    })

  } catch (e) {
    console.error('Error:', e)
  } finally {
    await pool.end()
  }
}

main()
