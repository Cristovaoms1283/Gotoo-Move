require('dotenv').config()
const { Pool } = require('pg')

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
})

async function main() {
  try {
    console.log('--- Listagem de Usuários (Schema fitconnect) ---')
    const res = await pool.query('SELECT id, email, "clerkId", role, name FROM fitconnect."User"')
    console.table(res.rows)
  } catch (e) {
    console.error('Erro ao consultar banco:', e.message)
    // Se falhar, tenta sem schema ou outro schema
    try {
        const res2 = await pool.query('SELECT id, email, "clerkId", role, name FROM "User"')
        console.table(res2.rows)
    } catch (e2) {
        console.error('Erro ao consultar sem schema:', e2.message)
    }
  } finally {
    await pool.end()
  }
}

main()
