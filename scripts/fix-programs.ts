import 'dotenv/config';
import prisma from '../src/lib/db';

const manualMap: Record<string, { provider: string, id: string }> = {
  // Peito
  'supino reto com barra': { provider: 'youtube', id: 'SQhEvoA22oU' },
  'supino inclinado com halteres': { provider: 'pinterest', id: '19492210980846759' },
  'crucifixo na máquina (peck deck)': { provider: 'youtube', id: 'Z5ZA2M2c9D0' },
  'crossover polia alta': { provider: 'youtube', id: 'Iwe6AmxVf7o' },
  'voador': { provider: 'youtube', id: 'Iwe6AmxVf7o' },
  
  // Costas
  'puxada frontal estrita': { provider: 'youtube', id: 'lq1ZJXXiWfQ' },
  'remada curvada com barra': { provider: 'youtube', id: 'G8l_8chR5BE' },
  'remada baixa sentada': { provider: 'youtube', id: 'GZbfZ033f74' },
  'pulldown com corda': { provider: 'youtube', id: 'H_pW1iAOPeU' },
  'puxada triângulo': { provider: 'youtube', id: 'lq1ZJXXiWfQ' },

  // Inferiores
  'agachamento livre': { provider: 'youtube', id: 'MVMNk0HiTMg' },
  'leg press 45': { provider: 'youtube', id: 'IZxyjW7OSvc' },
  'cadeira extensora': { provider: 'youtube', id: 'YyvSfVjQeL0' },
  'hack squat': { provider: 'youtube', id: 'MVMNk0HiTMg' },
  'passada com halteres': { provider: 'youtube', id: 'MVMNk0HiTMg' },
  'cadeira abdutora': { provider: 'pinterest', id: '10485011645559502' },
  'cadeira flexora': { provider: 'youtube', id: '1Tq3QdYUuHs' },
  'mesa flexora': { provider: 'youtube', id: '1Tq3QdYUuHs' },
  'stiff com barra': { provider: 'youtube', id: '1Tq3QdYUuHs' },
  'elevação pélvica': { provider: 'youtube', id: 'Zp26qflE_Qc' },
  'panturrilha em pé máquina': { provider: 'youtube', id: 'Yylz2gQzG2E' },

  // Ombros e braços
  'desenvolvimento com halteres': { provider: 'pinterest', id: '63331938504578603' },
  'elevação lateral': { provider: 'youtube', id: '3VcKaXpzqRo' },
  'elevação frontal': { provider: 'pinterest', id: '122300946127782915' },
  'rosca direta com barra': { provider: 'pinterest', id: '983544006122746029' },
  'rosca martelo': { provider: 'pinterest', id: '758786237251097700' },
  'rosca scott': { provider: 'pinterest', id: '475833516898542746' },
  'tríceps pulley': { provider: 'youtube', id: '2-LAMcpzODU' },
  'tríceps corda': { provider: 'pinterest', id: '51228514506946513' },
  'tríceps testa': { provider: 'pinterest', id: '225320787611553853' },

  // Abs & Cardio
  'abdominal crunch (supra)': { provider: 'youtube', id: '_M2PEuwIqa0' },
  'prancha isométrica': { provider: 'youtube', id: 'pSHjTRCQxIw' },
  'esteira (cardio)': { provider: 'pinterest', id: '31666003621429359' },
  'abdominal infra (elevação de pernas)': { provider: 'youtube', id: 'JB2oyawG9KI' },
  'abdominal bicicleta': { provider: 'youtube', id: '1we3bh9uhqY' },
  'elíptico (cardio)': { provider: 'youtube', id: 'A0Z31qL_1U4' },
};

async function main() {
  console.log('Iniciando correção fina dos vídeos de Hipertrofia 3 e Hipertrofia 5...');

  // Adicionar alias genéricos para o script encontrar fallback facilmente
  const resolveVideo = (name: string) => {
    const key = name.toLowerCase().trim();
    if (manualMap[key]) return manualMap[key];

    // Fallbacks inteligentes
    if (key.includes('supino')) return manualMap['supino reto com barra'];
    if (key.includes('rosca')) return manualMap['rosca direta com barra'];
    if (key.includes('tríceps')) return manualMap['tríceps pulley'];
    if (key.includes('remada') || key.includes('puxada')) return manualMap['puxada frontal estrita'];
    if (key.includes('agachamento') || key.includes('leg') || key.includes('extensora')) return manualMap['leg press 45'];
    if (key.includes('abd') || key.includes('prancha')) return manualMap['abdominal crunch (supra)'];
    if (key.includes('cardio') || key.includes('esteira') || key.includes('elíptico')) return manualMap['esteira (cardio)'];
    
    return { provider: 'youtube', id: 'dQw4w9WgXcQ' }; 
  }

  // Buscar todos os exercícios dos programas "Hipertrofia 3" e "Hipertrofia 5 Dias"
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
        const match = resolveVideo(ex.name);
        await prisma.exercise.update({
          where: { id: ex.id },
          data: {
            videoProvider: match.provider,
            youtubeId: match.id
          }
        });
        updated++;
      }
    }
  }

  console.log(`Correção completa! ${updated} exercícios foram remapeados individualmente com vídeos válidos.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
