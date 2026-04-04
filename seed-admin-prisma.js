require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { Pool } = require('pg')
const { PrismaPg } = require('@prisma/adapter-pg')

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  try {
    console.log('Inserting admin user into fitconnect.User...')
    const admin = await prisma.user.upsert({
        where: { email: 'cristovaoms@gmail.com' },
        update: { role: 'admin' },
        create: {
            id: 'user_admin_01',
            clerkId: 'manual_admin',
            name: 'Cristovão',
            email: 'cristovaoms@gmail.com',
            role: 'admin'
        }
    })
    console.log('Success! Admin user:', admin.email, 'Role:', admin.role)
    
    const count = await prisma.user.count()
    console.log('Total users in fitconnect.User:', count)

  } catch (e) {
    console.error('Error during Prisma operation:', e.message)
    console.error(e)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main()
