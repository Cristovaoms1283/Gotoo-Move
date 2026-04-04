require('dotenv').config()
const { Pool } = require('pg')

const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
})

async function main() {
  try {
    const userRes = await pool.query('SELECT * FROM "fitconnect"."User" WHERE email = $1', ['cristovaoms@gmail.com'])
    const user = userRes.rows[0];
    console.log('User Result:', JSON.stringify(user, null, 2))
    
    if (user && user.id) {
        const subRes = await pool.query('SELECT * FROM "fitconnect"."Subscription" WHERE "userId" = $1', [user.id])
        console.log('Subscription Result:', JSON.stringify(subRes.rows[0], null, 2))
        
        const oneOffRes = await pool.query('SELECT * FROM "fitconnect"."OneOffPurchase" WHERE "userId" = $1', [user.id])
        console.log('OneOff Purchases:', JSON.stringify(oneOffRes.rows, null, 2))
    }
  } catch (e) {
    console.error('Error:', e)
  } finally {
    await pool.end()
  }
}
main()
