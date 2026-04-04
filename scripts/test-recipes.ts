import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const recipes = await prisma.recipe.findMany()
  console.log('Total de Receitas:', recipes.length)
  console.log('Categorias:', recipes.map(r => r.category))
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
