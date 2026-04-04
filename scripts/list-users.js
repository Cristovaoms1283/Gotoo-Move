const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      clerkId: true,
      role: true,
      name: true
    }
  })
  console.log('--- Listagem de Usuários ---')
  console.table(users)
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
