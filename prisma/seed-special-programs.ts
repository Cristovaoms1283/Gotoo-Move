import 'dotenv/config';
import prisma from '../src/lib/db';

async function main() {
  console.log('Iniciando a criação de programas especiais...');

  // Helper
  const createExercisesParams = (exercisesStrArray: any[]) => {
    return exercisesStrArray.map((ex, index) => ({
      name: ex.name,
      description: ex.description || 'Executar com boa forma e controle.',
      youtubeId: ex.youtubeId || 'dQw4w9WgXcQ', 
      videoProvider: 'youtube',
      sets: ex.sets || '3',
      reps: ex.reps || '12',
      rest: ex.rest || '60s',
      order: index + 1
    }));
  };

  // ============================================
  // PROGRAMA 1: DIABÉTICOS (Controle e Resistência)
  // ============================================
  console.log('Criando Programa Diabéticos...');
  const diab_A = [
    { name: 'Caminhada Rápida / Esteira', sets: '1', reps: '15 min', rest: '-' },
    { name: 'Agachamento Livre (Halteres)', sets: '3', reps: '15', rest: '60s' },
    { name: 'Remada Sentada Máquina', sets: '3', reps: '15', rest: '60s' },
    { name: 'Supino Máquina', sets: '3', reps: '15', rest: '60s' },
    { name: 'Elevacão Pélvica', sets: '3', reps: '15', rest: '60s' },
    { name: 'Prancha Isométrica', sets: '3', reps: '30s', rest: '60s' },
    { name: 'Bicicleta Ergométrica', sets: '1', reps: '10 min', rest: '-' }
  ];

  const diab_B = [
    { name: 'Bicicleta Ergométrica', sets: '1', reps: '10 min', rest: '-' },
    { name: 'Leg Press 45', sets: '3', reps: '15', rest: '60s' },
    { name: 'Puxada Frontal Aberta', sets: '3', reps: '15', rest: '60s' },
    { name: 'Desenvolvimento Máquina', sets: '3', reps: '15', rest: '60s' },
    { name: 'Mesa Flexora', sets: '3', reps: '15', rest: '60s' },
    { name: 'Abdominal Supra (Solo)', sets: '3', reps: '20', rest: '45s' },
    { name: 'Caminhada Rápida / Esteira', sets: '1', reps: '15 min', rest: '-' }
  ];

  const wDiabA = await prisma.workout.create({ data: { title: 'Ficha A - Full Body A', category: 'Saúde', exercises: { create: createExercisesParams(diab_A) } } });
  const wDiabB = await prisma.workout.create({ data: { title: 'Ficha B - Full Body B', category: 'Saúde', exercises: { create: createExercisesParams(diab_B) } } });

  await prisma.trainingProgram.create({
    data: {
      title: 'Controle Glicêmico (Diabéticos)',
      description: 'Programa focado em aumento da sensibilidade à insulina, combinando exercícios resistidos de intensidade moderada com aeróbico.',
      durationDays: 30,
      goal: 'Tenho diabetes ou colesterol alto e hipertrofia', // Correspondente ao PricingSection.tsx
      workouts: {
        create: [
          { workoutId: wDiabA.id, label: 'Ficha A', order: 1 },
          { workoutId: wDiabB.id, label: 'Ficha B', order: 2 },
        ]
      }
    }
  });

  // ============================================
  // PROGRAMA 2: BI-SET EMAGRECIMENTO (Alta Intensidade)
  // ============================================
  console.log('Criando Programa Bi-Set Emagrecimento...');
  // Bi-set means pairs of exercises done without rest between them.
  const biset_A = [
    { name: 'Agachamento com Salto (Bi-set)', sets: '4', reps: '15', rest: '0s', description: 'Sem descanso, ir para a Cadeira Extensora' },
    { name: 'Cadeira Extensora (Bi-set)', sets: '4', reps: '15', rest: '90s' },
    { name: 'Supino Reto Halteres (Bi-set)', sets: '4', reps: '15', rest: '0s', description: 'Sem descanso, ir para Flexão' },
    { name: 'Flexão de Braço (Bi-set)', sets: '4', reps: 'Máx', rest: '90s' },
    { name: 'Polichinelo', sets: '3', reps: '1 min', rest: '45s' },
    { name: 'Abdominal Remador', sets: '4', reps: '20', rest: '45s' }
  ];

  const biset_B = [
    { name: 'Stiff (Bi-set)', sets: '4', reps: '15', rest: '0s', description: 'Sem descanso, ir para Mesa Flexora' },
    { name: 'Mesa Flexora (Bi-set)', sets: '4', reps: '15', rest: '90s' },
    { name: 'Puxada Frontal (Bi-set)', sets: '4', reps: '15', rest: '0s', description: 'Sem descanso, ir para Remada Curvada' },
    { name: 'Remada Curvada Halteres (Bi-set)', sets: '4', reps: '15', rest: '90s' },
    { name: 'Burpee', sets: '3', reps: '15', rest: '60s' },
    { name: 'Prancha Isométrica', sets: '4', reps: '45s', rest: '45s' }
  ];

  const wBisetA = await prisma.workout.create({ data: { title: 'Ficha A - Inferior/Peito (Bi-set)', category: 'Emagrecimento', exercises: { create: createExercisesParams(biset_A) } } });
  const wBisetB = await prisma.workout.create({ data: { title: 'Ficha B - Posterior/Costas (Bi-set)', category: 'Emagrecimento', exercises: { create: createExercisesParams(biset_B) } } });

  await prisma.trainingProgram.create({
    data: {
      title: 'Emagrecimento Acelerado (Bi-set)',
      description: 'Programa de alta densidade metabólica combinando exercícios em bi-set para máximo gasto calórico.',
      durationDays: 30,
      goal: 'Emagrecimento',
      workouts: {
        create: [
          { workoutId: wBisetA.id, label: 'Ficha A', order: 1 },
          { workoutId: wBisetB.id, label: 'Ficha B', order: 2 },
        ]
      }
    }
  });

  // ============================================
  // PROGRAMA 3: HIPERTENSOS (Controle e Segurança)
  // ============================================
  console.log('Criando Programa Hipertensos...');
  const hiper_A = [
    { name: 'Esteira / Caminhada Leve', sets: '1', reps: '10 min', rest: '-' },
    { name: 'Agachamento no Banco', sets: '3', reps: '12', rest: '90s', description: 'Evitar apneia (prender a respiração).' },
    { name: 'Cadeira Extensora', sets: '3', reps: '15', rest: '90s' },
    { name: 'Supino Máquina', sets: '3', reps: '12', rest: '90s', description: 'Controlar respiração, cargas moderadas.' },
    { name: 'Remada Máquina', sets: '3', reps: '12', rest: '90s' },
    { name: 'Bicicleta Ergométrica', sets: '1', reps: '15 min', rest: '-' }
  ];

  const hiper_B = [
    { name: 'Bicicleta Ergométrica', sets: '1', reps: '10 min', rest: '-' },
    { name: 'Leg Press Horizontal (Baixa Carga)', sets: '3', reps: '15', rest: '90s' },
    { name: 'Mesa Flexora', sets: '3', reps: '12', rest: '90s' },
    { name: 'Desenvolvimento Máquina', sets: '3', reps: '12', rest: '90s', description: 'Cuidado com braços acima da cabeça, carga muito leve.' },
    { name: 'Puxada Frontal Triângulo', sets: '3', reps: '15', rest: '90s' },
    { name: 'Caminhada Estação Plana', sets: '1', reps: '15 min', rest: '-' }
  ];

  const wHiperA = await prisma.workout.create({ data: { title: 'Ficha A - Base Segura', category: 'Saúde', exercises: { create: createExercisesParams(hiper_A) } } });
  const wHiperB = await prisma.workout.create({ data: { title: 'Ficha B - Base Segura', category: 'Saúde', exercises: { create: createExercisesParams(hiper_B) } } });

  await prisma.trainingProgram.create({
    data: {
      title: 'Treino Hipertenso Seguro',
      description: 'Programa para controle de pressão arterial. Evita sobrecargas excessivas, manobra de Valsalva (apneia) e foca em intervalos maiores.',
      durationDays: 30,
      goal: 'Sou hipertenso e Emagrecimento',
      workouts: {
        create: [
          { workoutId: wHiperA.id, label: 'Ficha A', order: 1 },
          { workoutId: wHiperB.id, label: 'Ficha B', order: 2 },
        ]
      }
    }
  });

  console.log('✅ Todos os novos programas foram criados com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
