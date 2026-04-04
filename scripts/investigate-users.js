require('dotenv').config()
const { Pool } = require('pg')

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
})

async function main() {
  try {
    const email = 'cristovaoms@gmail.com'
    console.log(`Investigando registros para o e-mail: ${email}`)
    
    const res = await pool.query(`
        SELECT id, name, email, role, "clerkId", status, "createdAt" 
        FROM "fitconnect"."User" 
        WHERE email = $1 
        ORDER BY "createdAt" ASC
    `, [email])
    
    if (res.rows.length > 0) {
        console.log('Resultados encontrados:')
        console.table(res.rows)
        
        if (res.rows.length > 1) {
            console.log('\nALERTA: Foram encontrados múltiplos registros para o mesmo e-mail.')
            console.log('Provavelmente um é o registro antigo (ADM) e o outro é o novo (User) criado pelo login do Clerk.')
        }
    } else {
        console.log('Nenhum usuário encontrado com esse e-mail.')
    }
  } catch (e) {
    console.error('Erro na investigação:', e)
  } finally {
    await pool.end()
  }
}

main()
