const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando Aplicação Sistemática do Protocolo Gironda (8x8) ---');

  // 1. Buscar programas alvo: Meses 9-12 que sejam de Hipertrofia ou Emagrecimento
  // E que tenham "Metabólico / Intensificação" no título.
  const programs = await prisma.trainingProgram.findMany({
    where: {
      AND: [
        {
          OR: [
            { title: { contains: 'Mês 9' } },
            { title: { contains: 'Mês 10' } },
            { title: { contains: 'Mês 11' } },
            { title: { contains: 'Mês 12' } },
          ]
        },
        { title: { contains: 'Metabólico / Intensificação' } },
        {
          OR: [
            { goal: { equals: 'Hipertrofia' } },
            { goal: { equals: 'Emagrecimento' } },
          ]
        }
      ],
      // Exclusão explícita de qualquer menção a Hipertensão (por segurança extra)
      NOT: [
        { goal: { contains: 'Hipertenso' } },
        { goal: { contains: 'Hipertensão' } },
        { title: { contains: '(Sou)' } } // Convenção vista no print para planos de saúde
      ]
    },
    include: {
      workouts: {
        include: {
          workout: {
            include: {
              exercises: true
            }
          }
        }
      }
    }
  });

  console.log(`Encontrados ${programs.length} programas para conversão.`);

  let totalUpdated = 0;

  for (const p of programs) {
    console.log(`\nProcessando Programa: ${p.title} (${p.goal})`);
    
    for (const pw of p.workouts) {
      console.log(`  -> Ficha: ${pw.label} (${pw.workout.exercises.length} exercícios)`);
      
      for (const ex of pw.workout.exercises) {
        // Atualizar exercício para o protocolo Gironda
        await prisma.exercise.update({
          where: { id: ex.id },
          data: {
            isGironda: true,
            sets: '8',
            reps: '8',
            rest: '30s',
            // Limpeza de termos bi-set legados se existirem
            name: ex.name.replace(/\(Bi-set\)/gi, '').replace(/\(Bi-sets\)/gi, '').trim(),
            reps: '8', 
            sets: '8'
          }
        });
        totalUpdated++;
      }
    }
  }

  console.log(`\n--- Atualização Concluída ---`);
  console.log(`Total de exercícios atualizados: ${totalUpdated}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
