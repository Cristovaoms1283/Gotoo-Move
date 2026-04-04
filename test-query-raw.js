require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { Pool } = require('pg')
const { PrismaPg } = require('@prisma/adapter-pg')

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
})

pool.on('connect', (client) => {
  client.query('SET search_path TO fitconnect, public');
});

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  try {
    console.log('Testing $queryRaw with explicit schema...')
    const users = await prisma.$queryRaw`SELECT * FROM "fitconnect"."User"`
    console.log('Success $queryRaw! Found users:', users.length)
    if (users.length > 0) {
        console.log('First user email:', users[0].email)
    }

    console.log('\nTesting $queryRaw with search_path...')
    const users2 = await prisma.$queryRaw`SELECT * FROM "User"`
    console.log('Success $queryRaw (unprefixed)! Found users:', users2.length)

  } catch (e) {
    console.error('Error:', e.message)
    console.error(e)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main()
