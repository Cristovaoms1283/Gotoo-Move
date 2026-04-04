import 'dotenv/config';
import prisma from '../src/lib/db';

const FallbackPinterestPins = {
  upper: '4222812042730606', // Placeholder GIF Supino/Upper
  lower: '988047605767', // Placeholder Leg GIF
  abs: '2111131580252532', // Placeholder Abs GIF
  cardio: '31666003621429359' // Esteira
};

async function main() {
  console.log('Atualizando Hipertrofia 3 para Pinterest...');
  
  // Encontrar programa Hipertrofia 3
  const program = await prisma.trainingProgram.findFirst({
    where: { title: 'Hipertrofia 3' },
    include: {
      workouts: {
        include: { workout: { include: { exercises: true } } }
      }
    }
  });

  if (!program) {
    console.log('Programa Hipertrofia 3 não encontrado!');
    return;
  }

  // Buscar todos os exercícios que usam Pinterest no sistema (para reciclar)
  const allPinterestExercises = await prisma.exercise.findMany({
    where: { videoProvider: 'pinterest' }
  });

  // Criar um mapa de nome de exercício -> pin ID limpo
  const pinterestMap = new Map<string, string>();
  for (const ex of allPinterestExercises) {
    if (ex.youtubeId && ex.youtubeId.match(/\d{10,}/)) {
      // Extrair apenas os dígitos contínuos (ID real do Pinterest)
      const cleanId = ex.youtubeId.match(/\d{10,}/)?.[0];
      if (cleanId) {
        pinterestMap.set(ex.name.toLowerCase().trim(), cleanId);
        
        // Mapear também partes do nome
        if (ex.name.toLowerCase().includes('supino reto')) pinterestMap.set('supino reto com barra', cleanId);
        if (ex.name.toLowerCase().includes('agachamento')) pinterestMap.set('agachamento livre', cleanId);
        if (ex.name.toLowerCase().includes('leg press')) pinterestMap.set('leg press 45', cleanId);
      }
    }
  }

  let updatedCount = 0;

  // Atualizar cada exercício do Hipertrofia 3
  for (const programWorkout of program.workouts) {
    for (const exercise of programWorkout.workout.exercises) {
      
      let pinId = pinterestMap.get(exercise.name.toLowerCase().trim());
      
      // Se não achar o exato, tenta por palavras chave
      if (!pinId) {
        if (exercise.name.toLowerCase().includes('supino') || exercise.name.toLowerCase().includes('desenvolvimento') || exercise.name.toLowerCase().includes('remada') || exercise.name.toLowerCase().includes('puxada') || exercise.name.toLowerCase().includes('rosca') || exercise.name.toLowerCase().includes('tríceps') || exercise.name.toLowerCase().includes('elevação lateral')) {
           pinId = pinterestMap.get('rosca direta com barra') || FallbackPinterestPins.upper;
        } else if (exercise.name.toLowerCase().includes('abd') || exercise.name.toLowerCase().includes('prancha')) {
           pinId = FallbackPinterestPins.abs;
        } else if (exercise.name.toLowerCase().includes('esteira') || exercise.name.toLowerCase().includes('cardio') || exercise.name.toLowerCase().includes('elíptico')) {
           pinId = pinterestMap.get('esteira') || FallbackPinterestPins.cardio;
        } else {
           pinId = pinterestMap.get('leg press 45') || FallbackPinterestPins.lower;
        }
      }

      await prisma.exercise.update({
        where: { id: exercise.id },
        data: {
          videoProvider: 'pinterest',
          youtubeId: pinId
        }
      });
      updatedCount++;
      console.log(`Atualado: ${exercise.name} -> ${pinId}`);
    }
  }

  console.log(`Sucesso! ${updatedCount} exercícios atualizados para usar Pinterest.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
