import 'dotenv/config';
import prisma from '../src/lib/db';

const FallbackPinterestPins = {
  upper: '4222812042730606', // Placeholder GIF Supino/Upper
  back: '4222812042730606',
  lower: '988047605767', // Placeholder Leg GIF
  arms: '2111131580252532',
};

async function main() {
  console.log('Criando o programa com 5 Fichas (A, B, C, D, E)...');

  // Buscar todos os exercícios que usam Pinterest no sistema (para reciclar IDs)
  const allPinterestExercises = await prisma.exercise.findMany({
    where: { videoProvider: 'pinterest' }
  });

  const pinterestMap = new Map<string, string>();
  for (const ex of allPinterestExercises) {
    if (ex.youtubeId && ex.youtubeId.match(/\d{10,}/)) {
      const cleanId = ex.youtubeId.match(/\d{10,}/)?.[0];
      if (cleanId) {
        pinterestMap.set(ex.name.toLowerCase().trim(), cleanId);
        if (ex.name.toLowerCase().includes('supino reto')) pinterestMap.set('supino', cleanId);
        if (ex.name.toLowerCase().includes('agachamento')) pinterestMap.set('agachamento livre', cleanId);
        if (ex.name.toLowerCase().includes('leg press')) pinterestMap.set('leg press 45', cleanId);
      }
    }
  }

  // Helper para criar os exercícios com pinId reutilizado, mantendo os parâmetros pedidos: 5 séries, 12 reps, 50s
  const createExercisesParams = (exercisesStrArray: { name: string, type: 'upper' | 'lower' | 'back' | 'arms' }[]) => {
    return exercisesStrArray.map((ex, index) => {
      let pinId = pinterestMap.get(ex.name.toLowerCase().trim());
      if (!pinId) {
        if (ex.name.toLowerCase().includes('supino')) pinId = pinterestMap.get('supino') || FallbackPinterestPins.upper;
        else if (ex.name.toLowerCase().includes('rosca') || ex.name.toLowerCase().includes('tríceps')) pinId = pinterestMap.get('rosca direta com barra') || FallbackPinterestPins.arms;
        else if (ex.name.toLowerCase().includes('remada') || ex.name.toLowerCase().includes('puxada')) pinId = pinterestMap.get('remada curvada com barra') || FallbackPinterestPins.back;
        else if (ex.name.toLowerCase().includes('agachamento') || ex.name.toLowerCase().includes('leg') || ex.name.toLowerCase().includes('extensora')) pinId = pinterestMap.get('leg press 45') || FallbackPinterestPins.lower;
        else pinId = FallbackPinterestPins[ex.type];
      }

      return {
        name: ex.name,
        description: 'Foque na execução e no tempo sob tensão (5x12)',
        youtubeId: pinId,
        videoProvider: 'pinterest',
        sets: '5',
        reps: '12',
        rest: '50s',
        order: index + 1
      };
    });
  };

  const fichaA = [
    { name: 'Supino Reto com Barra', type: 'upper' as const },
    { name: 'Supino Inclinado com Halteres', type: 'upper' as const },
    { name: 'Crucifixo na Máquina (Peck Deck)', type: 'upper' as const },
    { name: 'Crossover Polia Alta', type: 'upper' as const },
    { name: 'Voador', type: 'upper' as const },
  ];

  const fichaB = [
    { name: 'Puxada Frontal Estrita', type: 'back' as const },
    { name: 'Remada Curvada com Barra', type: 'back' as const },
    { name: 'Remada Baixa Sentada', type: 'back' as const },
    { name: 'Pulldown com Corda', type: 'back' as const },
    { name: 'Puxada Triângulo', type: 'back' as const },
  ];

  const fichaC = [
    { name: 'Agachamento Livre', type: 'lower' as const },
    { name: 'Leg Press 45', type: 'lower' as const },
    { name: 'Cadeira Extensora', type: 'lower' as const },
    { name: 'Hack Squat', type: 'lower' as const },
    { name: 'Passada com Halteres', type: 'lower' as const },
  ];

  const fichaD = [
    { name: 'Desenvolvimento com Halteres', type: 'arms' as const },
    { name: 'Elevação Lateral', type: 'arms' as const },
    { name: 'Rosca Direta com Barra', type: 'arms' as const },
    { name: 'Tríceps Pulley', type: 'arms' as const },
    { name: 'Rosca Martelo', type: 'arms' as const },
  ];

  const fichaE = [
    { name: 'Mesa Flexora', type: 'lower' as const },
    { name: 'Cadeira Flexora', type: 'lower' as const },
    { name: 'Stiff com Barra', type: 'lower' as const },
    { name: 'Elevação Pélvica', type: 'lower' as const },
    { name: 'Panturrilha em Pé Máquina', type: 'lower' as const },
  ];

  const paramsA = createExercisesParams(fichaA);
  const paramsB = createExercisesParams(fichaB);
  const paramsC = createExercisesParams(fichaC);
  const paramsD = createExercisesParams(fichaD);
  const paramsE = createExercisesParams(fichaE);

  const workoutA = await prisma.workout.create({ data: { title: 'Ficha A - Peito', category: 'Hipertrofia', exercises: { create: paramsA } } });
  const workoutB = await prisma.workout.create({ data: { title: 'Ficha B - Costas', category: 'Hipertrofia', exercises: { create: paramsB } } });
  const workoutC = await prisma.workout.create({ data: { title: 'Ficha C - Quadríceps', category: 'Hipertrofia', exercises: { create: paramsC } } });
  const workoutD = await prisma.workout.create({ data: { title: 'Ficha D - Ombro, Bíceps e Tríceps', category: 'Hipertrofia', exercises: { create: paramsD } } });
  const workoutE = await prisma.workout.create({ data: { title: 'Ficha E - Posterior de Perna', category: 'Hipertrofia', exercises: { create: paramsE } } });

  const program = await prisma.trainingProgram.create({
    data: {
      title: 'Hipertrofia 5 Dias (ABCDE)',
      description: 'Programa avançado dividido em 5 fichas (A, B, C, D, E) com alto volume e descanso curto (5x12 - 50s).',
      durationDays: 30,
      goal: 'Hipertrofia',
      workouts: {
        create: [
          { workoutId: workoutA.id, label: 'Ficha A', order: 1 },
          { workoutId: workoutB.id, label: 'Ficha B', order: 2 },
          { workoutId: workoutC.id, label: 'Ficha C', order: 3 },
          { workoutId: workoutD.id, label: 'Ficha D', order: 4 },
          { workoutId: workoutE.id, label: 'Ficha E', order: 5 },
        ]
      }
    }
  });

  console.log('Programa Hipertrofia 5 Dias criado com sucesso! ID:', program.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
