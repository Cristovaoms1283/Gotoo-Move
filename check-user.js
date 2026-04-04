require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    const email = 'cristovaoms@gmail.com'
    const clerkId = 'user_3AfS8E13AInQbdvTOGzeAeyYOdg'
    
    console.log(`Buscando por email: ${email} ou clerkId: ${clerkId}`)
    
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { clerkId: clerkId }
        ]
      }
    })

    if (user) {
      console.log('USUÁRIO ENCONTRADO NO PRISMA:')
      console.log(JSON.stringify(user, null, 2))
    } else {
      console.log('USUÁRIO NÃO ENCONTRADO NO BANCO.')
      const count = await prisma.user.count()
      console.log('Total de usuários vinculados:', count)
      
      const allUsers = await prisma.user.findMany({ take: 3 })
      console.log('Amostra de usuários:', JSON.stringify(allUsers, null, 2))
    }
  } catch (err) {
    console.error('ERRO AO BUSCAR USUÁRIO:', err)
  } finally {
    await prisma.$disconnect()
  }
}

main()
