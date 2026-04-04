import 'dotenv/config';
import prisma from '../src/lib/db';

async function main() {
  console.log('Criando o programa Hipertrofia 3...');

  // Helper para criar exercícios
  const createExercisesParams = (exercisesStrArray: any[]) => {
    return exercisesStrArray.map((ex, index) => ({
      name: ex.name,
      description: ex.description || 'Foque na contração e na respiração.',
      youtubeId: ex.youtubeId || 'dQw4w9WgXcQ',
      videoProvider: 'youtube', // Usando YouTube focado em vídeos reais de execução
      sets: ex.sets || '3',
      reps: ex.reps || '10',
      rest: ex.rest || '60s',
      order: index + 1
    }));
  };

  // Ficha A: Membros Superiores, Abdômen e Aeróbico
  const fichaA_Exercises = [
    { name: 'Supino Reto com Barra', youtubeId: 'SQhEvoA22oU' },
    { name: 'Puxada Frontal Estrita', youtubeId: 'lq1ZJXXiWfQ' },
    { name: 'Supino Inclinado com Halteres', youtubeId: '0G2_9QZshZE' },
    { name: 'Remada Curvada com Barra', youtubeId: 'G8l_8chR5BE' },
    { name: 'Desenvolvimento com Halteres', youtubeId: 'qEwKCR5JCog' },
    { name: 'Elevação Lateral', youtubeId: '3VcKaXpzqRo' },
    { name: 'Rosca Direta com Barra', youtubeId: 'kwG2ipFRgfo' },
    { name: 'Tríceps Pulley', youtubeId: '2-LAMcpzODU' },
    { name: 'Abdominal Crunch (Supra)', youtubeId: '_M2PEuwIqa0', reps: '15' },
    { name: 'Prancha Isométrica', youtubeId: 'pSHjTRCQxIw', reps: '45s' },
    { name: 'Esteira (Cardio)', description: '20 minutos em ritmo de caminhada rápida ou trote leve', youtubeId: '8i3jgBpcMlU', sets: '1', reps: '20 min', rest: '-' }
  ];

  // Ficha B: Membros Inferiores, Abdômen e Aeróbico
  const fichaB_Exercises = [
    { name: 'Agachamento Livre', youtubeId: 'MVMNk0HiTMg' },
    { name: 'Leg Press 45', youtubeId: 'IZxyjW7OSvc' },
    { name: 'Elevação Pélvica', youtubeId: 'Zp26qflE_Qc' },
    { name: 'Cadeira Extensora', youtubeId: 'YyvSfVjQeL0' },
    { name: 'Mesa Flexora', youtubeId: '1Tq3QdYUuHs' },
    { name: 'Cadeira Abdutora', youtubeId: '5-w3d2_YngU' },
    { name: 'Panturrilha em Pé Máquina', youtubeId: 'Yylz2gQzG2E', reps: '15' },
    { name: 'Abdominal Infra (Elevação de Pernas)', youtubeId: 'JB2oyawG9KI', reps: '15' },
    { name: 'Abdominal Bicicleta', youtubeId: '1we3bh9uhqY', reps: '20' },
    { name: 'Elíptico (Cardio)', description: '20 minutos de intensidade contínua', youtubeId: 'A0Z31qL_1U4', sets: '1', reps: '20 min', rest: '-' }
  ];

  const paramsA = createExercisesParams(fichaA_Exercises);
  const paramsB = createExercisesParams(fichaB_Exercises);

  // Criar Workouts correspondentes às Fichas
  const workoutA = await prisma.workout.create({
    data: {
      title: 'Ficha A - Superiores, Abdômen e Aeróbico',
      category: 'Hipertrofia',
      exercises: { create: paramsA }
    }
  });

  const workoutB = await prisma.workout.create({
    data: {
      title: 'Ficha B - Inferiores, Abdômen e Aeróbico',
      category: 'Hipertrofia',
      exercises: { create: paramsB }
    }
  });

  // Criar Program Hipertrofia 3
  const program = await prisma.trainingProgram.create({
    data: {
      title: 'Hipertrofia 3',
      description: 'Programa focado na divisão de Superiores e Inferiores (AB). Ideal para treinar de 4 a 6 vezes na semana.',
      durationDays: 30,
      goal: 'Hipertrofia',
      workouts: {
        create: [
          { workoutId: workoutA.id, label: 'Ficha A', order: 1 },
          { workoutId: workoutB.id, label: 'Ficha B', order: 2 },
        ]
      }
    }
  });

  console.log('Programa Hipertrofia 3 criado com sucesso! ID:', program.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
