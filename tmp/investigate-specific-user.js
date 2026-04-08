require('dotenv').config()
const { Pool } = require('pg')

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
})

async function main() {
  try {
    const email = 'gun_fire2508@hotmail.com'
    console.log(`Investigando registros para o e-mail: ${email}`)
    
    // Buscar o usuário
    const res = await pool.query(`
        SELECT u.id, u.name, u.email, u.role, u."activeProgramId", u."runningProgramId", 
               ap.title as active_program_title, ap.category as active_program_category,
               rp.title as running_program_title, rp.category as running_program_category
        FROM "fitconnect"."User" u
        LEFT JOIN "fitconnect"."TrainingProgram" ap ON u."activeProgramId" = ap.id
        LEFT JOIN "fitconnect"."TrainingProgram" rp ON u."runningProgramId" = rp.id
        WHERE u.email = $1
    `, [email])
    
    if (res.rows.length === 0) {
        console.log('Usuário não encontrado.')
    } else {
        console.log('Dados do usuário e seus programas:')
        console.table(res.rows)
    }
    
    // Buscar programas de treinamento disponíveis
    const progs = await pool.query(`
        SELECT id, title, category 
        FROM "fitconnect"."TrainingProgram"
        WHERE title ILIKE '%Hipertrofia%' OR title ILIKE '%3km%'
    `)
    console.log('\nProgramas disponíveis (Hipertrofia ou 3km):')
    console.table(progs.rows)

  } catch (e) {
    console.error('Erro na investigação:', e)
  } finally {
    await pool.end()
  }
}

main()
