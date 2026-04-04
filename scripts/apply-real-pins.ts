import 'dotenv/config';
import prisma from '../src/lib/db';

async function main() {
  console.log('Restaurando IDs do Pinterest ocultos no histórico...');

  // Mapa manual baseado na descoberta minuciosa do histórico do usuário
  const REAL_PINS = {
    'supino reto com barra': '988047605767751042',
    'supino inclinado com halteres': '108790147244005757', // "supino 45"
    'voador': '19492210980846848', // "adutor de braço" / voador
    'crucifixo na máquina (peck deck)': '19492210980846848',
    'crossover polia alta': '19492210980846848',
    
    'remada baixa sentada': '11610911541763323',
    'puxada frontal estrita': '9499849208746964', // "pulley frente"
    'pulldown com corda': '9499849208746964',
    'puxada triângulo': '9499849208746964',
    'remada curvada com barra': '11610911541763323',

    'tríceps pulley': '99079260547872285', // "triceps na polia"
    'tríceps testa': '988047605767751151', // "triceps testa halter"
    'tríceps corda': '51228514506946513',
    'rosca scott': '475833516898542746',
    'rosca direta com barra': '983544006122746029',
    'rosca martelo': '758786237251097700',
    'desenvolvimento com halteres': '63331938504578603',
    'elevação lateral': '122300946127782915', // fallback
    'elevação frontal': '122300946127782915',

    'prancha isométrica': '18718154695024369', // "prancha"
    'esteira (cardio)': '31666003621429359',
    'elíptico (cardio)': '31666003621429359',
    
    'abdominal crunch (supra)': '3870349675132417',
    'abdominal infra (elevação de pernas)': '3870349675132417', // "abdominal infra"
    
    'cadeira abdutora': '10485011645559502',
    'agachamento livre': '10485011645559502', // fallback legs
    'leg press 45': '10485011645559502',
    'cadeira extensora': '10485011645559502',
    'cadeira flexora': '10485011645559502',
    'mesa flexora': '10485011645559502',
    'stiff com barra': '10485011645559502',
    'elevação pélvica': '10485011645559502',
    'panturrilha em pé máquina': '10485011645559502',
    'passada com halteres': '10485011645559502',
    'hack squat': '10485011645559502'
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
        
        const pinId = REAL_PINS[ex.name.toLowerCase().trim() as keyof typeof REAL_PINS];
        if (pinId && pinId !== ex.youtubeId) {
          await prisma.exercise.update({
            where: { id: ex.id },
            data: { youtubeId: pinId, videoProvider: 'pinterest' }
          });
          updated++;
        }
      }
    }
  }

  console.log(`Feito! ${updated} exercícios receberam as variações originais.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
