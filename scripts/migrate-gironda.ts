import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('--- Iniciando Limpeza Profunda de Dados Bi-set para Gironda ---')

  // 1. Identificar exercícios que eram bi-sets pelo conteúdo do campo reps/sets
  const exercisesToUpdate = await prisma.exercise.findMany({
    where: {
      OR: [
        { reps: { contains: '(Bi-set' } },
        { sets: { contains: '(Bi-set' } },
        { name: { contains: 'Bi-set', mode: 'insensitive' } }
      ]
    }
  })

  console.log(`Encontrados ${exercisesToUpdate.length} exercícios para conversão.`)

  for (const ex of exercisesToUpdate) {
    console.log(`Convertendo: ${ex.name} (${ex.id})`)
    await prisma.exercise.update({
      where: { id: ex.id },
      data: {
        isGironda: true,
        sets: '8',
        reps: '8',
        rest: '30s'
      }
    })
  }

  // 2. Limpar qualquer texto (Bi-set) remanescente nos campos mesmo que não fiquem Gironda (segurança)
  const result = await prisma.$executeRaw`
    UPDATE "fitconnect"."Exercise" 
    SET "reps" = REPLACE(REPLACE("reps", '(Bi-sets)', ''), '(Bi-set)', ''),
        "sets" = REPLACE(REPLACE("sets", '(Bi-sets)', ''), '(Bi-set)', '')
    WHERE "reps" ILIKE '%(Bi-set)%' OR "sets" ILIKE '%(Bi-set)%'
  `
  
  console.log(`Limpeza de texto finalizada: ${result} linhas afetadas.`)
  console.log('--- Migração concluída com sucesso ---')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
