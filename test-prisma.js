require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { Pool } = require('pg')
const { PrismaPg } = require('@prisma/adapter-pg')

//pg automatically parses options from DATABASE_URL
const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  try {
    console.log('Testing Prisma with Adapter and search_path from URL...')
    const users = await prisma.user.findMany()
    console.log('Success! Found users:', users.length)
    if (users.length > 0) {
        console.log('Email do primeiro usuário:', users[0].email)
    }
  } catch (e) {
    console.error('Error during Prisma test:', e.message)
    console.error(e)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main()
