import 'dotenv/config';
import prisma from '../src/lib/db';

async function main() {
  console.log('Mapeando exercícios com Pinterest já existentes...');

  // Buscar TODOS os exercícios do banco de dados (de qualquer programa) que usam Pinterest
  const allPinterestExercises = await prisma.exercise.findMany({
    where: { videoProvider: 'pinterest' },
    orderBy: { updatedAt: 'desc' } // Pega os editados/atualizados mais recentemente
  });

  const pinterestMap = new Map<string, string>();
  
  for (const ex of allPinterestExercises) {
    if (ex.youtubeId && ex.youtubeId.match(/^\d{15,18}$/)) { // Apenas IDs perfeitos do Pinterest (15-18 dígitos) sem textos colados
      const cleanId = ex.youtubeId.match(/^\d{15,18}$/)?.[0];
      if (cleanId) {
        // Salva só se ainda não existir no mapa (garante que pega o mais recente válido)
        if (!pinterestMap.has(ex.name.toLowerCase().trim())) {
          pinterestMap.set(ex.name.toLowerCase().trim(), cleanId);
        }
      }
    }
  }

  // Debug: mostrar quais pinos conseguimos mapear e validar perfeitamente
  console.log(`Encontrados ${pinterestMap.size} exercícios únicos com Pinterest perfeito e nativo do usuário:`);
  for (const [name, id] of pinterestMap.entries()) {
    console.log(`- ${name}: ${id}`);
  }

  // Buscar os exercícios inseridos nos novos programas (Hipertrofia 3 e 5)
  const programs = await prisma.trainingProgram.findMany({
    where: {
      OR: [
        { title: 'Hipertrofia 3' },
        { title: 'Hipertrofia 5 Dias (ABCDE)' }
      ]
    },
    include: {
      workouts: {
        include: { workout: { include: { exercises: true } } }
      }
    }
  });

  let updated = 0;
  for (const program of programs) {
    for (const pw of program.workouts) {
      for (const ex of pw.workout.exercises) {
        
        let matchName = ex.name.toLowerCase().trim();
        const foundPin = pinterestMap.get(matchName);

        if (foundPin && foundPin !== ex.youtubeId) {
          // Se achei o exato id pra esse nome baseado no histórico do usuário
          await prisma.exercise.update({
            where: { id: ex.id },
            data: {
              videoProvider: 'pinterest',
              youtubeId: foundPin
            }
          });
          updated++;
          console.log(`Atualizado no programa: ${ex.name} -> copiou ID real ${foundPin}`);
        }
      }
    }
  }

  console.log(`Sucesso: ${updated} exercícios resgataram e espelharam o vídeo das suas fichas passadas!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
