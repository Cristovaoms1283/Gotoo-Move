const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Prisma keys:', Object.keys(prisma))
  process.exit(0)
}

main()
