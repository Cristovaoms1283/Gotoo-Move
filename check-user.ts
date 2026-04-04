import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = 'cristovaoms@gmail.com'
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { clerkId: 'user_3AfS8E13AInQbdvTOGzeAeyYOdg' }
      ]
    }
  })

  if (user) {
    console.log('USUÁRIO ENCONTRADO:')
    console.log(JSON.stringify(user, null, 2))
  } else {
    console.log('USUÁRIO NÃO ENCONTRADO NO BANCO.')
    const allUsers = await prisma.user.findMany({ take: 5 })
    console.log('Primeiros 5 usuários no banco:', JSON.stringify(allUsers, null, 2))
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
