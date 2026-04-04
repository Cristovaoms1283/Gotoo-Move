import 'dotenv/config';
import prisma from '../src/lib/db';

async function main() {
  console.log('Forçando Pinterest em todos os exercícios das novas fichas...');

  // Fallbacks reais do sistema do usuário
  const PINS = {
    upper: '19492210980846759',  // Supino Inclinado
    lower: '10485011645559502',  // Cadeira Abdutora
    abs: '31666003621429359',    // Esteira (fallback para abs)
    cardio: '31666003621429359', // Esteira
    biceps: '983544006122746029',// Rosca Direta
    triceps: '51228514506946513' // Triceps Corda
  };

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
        
        let pinId = ex.youtubeId;

        // Se estiver com YouTube, devemos forçar o Pinterest
        if (ex.videoProvider !== 'pinterest') {
          const name = ex.name.toLowerCase();
          if (name.includes('agachamento') || name.includes('leg') || name.includes('extensora') || name.includes('flexora') || name.includes('stiff') || name.includes('panturrilha') || name.includes('pélvica')) {
            pinId = PINS.lower;
          } else if (name.includes('rosca')) {
            pinId = PINS.biceps;
          } else if (name.includes('tríceps')) {
            pinId = PINS.triceps;
          } else if (name.includes('abd') || name.includes('prancha')) {
            pinId = PINS.abs;
          } else if (name.includes('cardio') || name.includes('esteira') || name.includes('elíptico')) {
            pinId = PINS.cardio;
          } else {
            pinId = PINS.upper; // Costas, ombros, peito restantes
          }
        }

        await prisma.exercise.update({
          where: { id: ex.id },
          data: {
            videoProvider: 'pinterest',
            youtubeId: pinId
          }
        });
        updated++;
      }
    }
  }

  console.log(`Sucesso: ${updated} exercícios convertidos 100% para Pinterest!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
