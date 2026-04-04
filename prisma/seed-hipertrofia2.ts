import 'dotenv/config';
import prisma from '../src/lib/db';

async function main() {
  console.log('Criando o programa Hipertrofia 2...');

  // Helper para criar exercícios
  const createExercisesParams = (exercisesStrArray: any[]) => {
    return exercisesStrArray.map((ex, index) => ({
      name: ex.name,
      description: ex.description || 'Executar com boa forma.',
      youtubeId: ex.youtubeId || 'dQw4w9WgXcQ', // Placeholder
      videoProvider: 'youtube',
      sets: ex.sets || '4',
      reps: ex.reps || '10',
      rest: ex.rest || '60s',
      order: index + 1
    }));
  };

  // Ficha A: Peito, Costas, Abdômen, Elíptico
  const fichaA_Exercises = [
    { name: 'Supino Reto com Barra', youtubeId: 'SQhEvoA22oU' },
    { name: 'Supino Inclinado com Halteres', youtubeId: '0G2_9QZshZE' },
    { name: 'Crucifixo na Máquina (Peck Deck)', youtubeId: 'Z5ZA2M2c9D0' },
    { name: 'Crossover (Polia Média)', youtubeId: 'Iwe6AmxVf7o' },
    { name: 'Puxada Frontal Estrita', youtubeId: 'lq1ZJXXiWfQ' },
    { name: 'Remada Curvada com Barra', youtubeId: 'G8l_8chR5BE' },
    { name: 'Remada Baixa Sentada', youtubeId: 'GZbfZ033f74' },
    { name: 'Pulldown com Corda', youtubeId: 'H_pW1iAOPeU' },
    { name: 'Abdominal Crunch (Supra)', youtubeId: '_M2PEuwIqa0' },
    { name: 'Elevação de Pernas', youtubeId: 'JB2oyawG9KI' },
    { name: 'Elíptico (Cardio)', description: '20 minutos em ritmo moderado', youtubeId: 'A0Z31qL_1U4', sets: '1', reps: '20 min' }
  ];

  // Ficha B: Pernas
  const fichaB_Exercises = [
    { name: 'Agachamento Livre', youtubeId: 'MVMNk0HiTMg' },
    { name: 'Leg Press 45', youtubeId: 'IZxyjW7OSvc' },
    { name: 'Cadeira Extensora', youtubeId: 'YyvSfVjQeL0' },
    { name: 'Mesa Flexora', youtubeId: '1Tq3QdYUuHs' },
    { name: 'Cadeira Abdutora', youtubeId: '5-w3d2_YngU' },
    { name: 'Cadeira Adutora', youtubeId: '0_U0K7Tj8F8' },
    { name: 'Panturrilha em Pé Máquina', youtubeId: 'Yylz2gQzG2E' }
  ];

  // Ficha C: Ombros e Trapézio
  const fichaC_Exercises = [
    { name: 'Desenvolvimento com Halteres', youtubeId: 'qEwKCR5JCog' },
    { name: 'Elevação Lateral', youtubeId: '3VcKaXpzqRo' },
    { name: 'Elevação Frontal', youtubeId: '-t7fuZ0KhDA' },
    { name: 'Crucifixo Inverso (Máquina ou Halter)', youtubeId: 'qt0E-vOq7n4' },
    { name: 'Encolhimento com Halteres', youtubeId: '_t3tgXONXmE' }
  ];

  // Ficha D: Bíceps e Tríceps
  const fichaD_Exercises = [
    { name: 'Rosca Direta com Barra', youtubeId: 'kwG2ipFRgfo' },
    { name: 'Rosca Martelo', youtubeId: 'zC3nLlEvin4' },
    { name: 'Rosca Scott', youtubeId: 'rCJoX6yEOfs' },
    { name: 'Tríceps Pulley', youtubeId: '2-LAMcpzODU' },
    { name: 'Tríceps Corda', youtubeId: 'vB5OHsJ3EME' },
    { name: 'Tríceps Testa', youtubeId: 'd_KZxkY_0cM' }
  ];

  const paramsA = createExercisesParams(fichaA_Exercises);
  const paramsB = createExercisesParams(fichaB_Exercises);
  const paramsC = createExercisesParams(fichaC_Exercises);
  const paramsD = createExercisesParams(fichaD_Exercises);

  // Criar Workouts
  const workoutA = await prisma.workout.create({
    data: {
      title: 'Ficha A - Peito, Costas e Abdômen',
      category: 'Hipertrofia',
      exercises: { create: paramsA }
    }
  });

  const workoutB = await prisma.workout.create({
    data: {
      title: 'Ficha B - Pernas Completas',
      category: 'Hipertrofia',
      exercises: { create: paramsB }
    }
  });

  const workoutC = await prisma.workout.create({
    data: {
      title: 'Ficha C - Ombros e Trapézio',
      category: 'Hipertrofia',
      exercises: { create: paramsC }
    }
  });

  const workoutD = await prisma.workout.create({
    data: {
      title: 'Ficha D - Bíceps e Tríceps',
      category: 'Hipertrofia',
      exercises: { create: paramsD }
    }
  });

  // Criar Program
  const program = await prisma.trainingProgram.create({
    data: {
      title: 'Hipertrofia 2',
      description: 'Programa avançado de Hipertrofia dividido em 4 fichas (A, B, C, D).',
      durationDays: 30,
      goal: 'Hipertrofia',
      workouts: {
        create: [
          { workoutId: workoutA.id, label: 'Ficha A', order: 1 },
          { workoutId: workoutB.id, label: 'Ficha B', order: 2 },
          { workoutId: workoutC.id, label: 'Ficha C', order: 3 },
          { workoutId: workoutD.id, label: 'Ficha D', order: 4 },
        ]
      }
    }
  });

  console.log('Programa criado com sucesso! ID:', program.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
