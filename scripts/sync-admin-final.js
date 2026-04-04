require('dotenv').config()
const { Pool } = require('pg')

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
})

async function main() {
  const email = 'cristovaoms@gmail.com'
  const newClerkId = 'user_3Btn9Ul50HSyvWj00oDCpiqtAjh'
  
  try {
    console.log(`Iniciando sincronização para ${email}...`)
    
    // 1. Verificar se existe o registro antigo (admin)
    const adminQuery = await pool.query('SELECT id, role, "clerkId" FROM "fitconnect"."User" WHERE email = $1', [email])
    
    if (adminQuery.rows.length === 0) {
        console.error('ERRO: Nenhum registro encontrado para este e-mail no banco de dados.')
        return
    }
    
    console.log(`Registro atual encontrado. Role: ${adminQuery.rows[0].role}, ClerkId: ${adminQuery.rows[0].clerkId}`)

    // 2. Atualizar o clerkId para o novo fornecido pelo usuário e garantir role: admin e status: active
    const updateQuery = await pool.query(`
        UPDATE "fitconnect"."User" 
        SET "clerkId" = $1, role = 'admin', status = 'active'
        WHERE email = $2
        RETURNING id, email, role, "clerkId", status
    `, [newClerkId, email])
    
    console.log('SUCESSO! O registro foi atualizado:')
    console.table(updateQuery.rows)
    
    console.log('\nAgora você pode atualizar a página do dashboard e o acesso deve estar liberado!')
    
  } catch (e) {
    console.error('Erro durante a sincronização:', e)
  } finally {
    await pool.end()
  }
}

main()
