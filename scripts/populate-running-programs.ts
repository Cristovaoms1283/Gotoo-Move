import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });
import type { PrismaClient } from '@prisma/client';
let prisma: any;

const DISTANCES = ["3km", "5km", "7km", "10km", "21km"];

// Generic base generators for Running plans based on distance & month
function generateRunningExercises(distance: string, month: number) {
  const exercises: any[] = [];
  let orderCounter = 1;

  // Base Volume by distance and month multiplier
  let baseVolumeMin = 20;
  let intervalDistance = "400m";
  let longRunKm = 2; // base for 3km

  if (distance === "5km") {
    longRunKm = 3;
    baseVolumeMin = 25;
    intervalDistance = "500m";
  } else if (distance === "7km") {
    longRunKm = 4;
    baseVolumeMin = 30;
    intervalDistance = "600m";
  } else if (distance === "10km") {
    longRunKm = 6;
    baseVolumeMin = 35;
    intervalDistance = "800m";
  } else if (distance === "21km") {
    longRunKm = 10;
    baseVolumeMin = 45;
    intervalDistance = "1000m";
  }

  // Aumentar dificuldade levemente por mês (+10% ao mês na rodagem longa)
  const monthFactor = 1 + (month - 1) * 0.1;
  const currentBaseVolume = Math.round(baseVolumeMin * monthFactor);
  const currentLongRun = (longRunKm * monthFactor).toFixed(1);

  const addEx = (name: string, desc: string, sets = "-", reps = "-", rest = "-") => {
    exercises.push({
      name,
      description: desc,
      youtubeId: "J8a4x4Kx8Zk", // Video genérico de corrida técnica
      videoProvider: "youtube",
      sets,
      reps,
      rest,
      order: orderCounter++
    });
  };

  // Semana 1
  addEx("Semana 1 - Segunda", `${currentBaseVolume} min de trote leve (confortável) + Mobilidade`, "1", `${currentBaseVolume} min`, "Livre");
  addEx("Semana 1 - Quarta", `10x [1 min corrida moderada / 1 min caminhada]`, "10", "1 min", "1 min");
  addEx("Semana 1 - Sábado", `Rodagem Base: ${currentLongRun}km de trote contínuo`, "1", `${currentLongRun} km`, "Livre");

  // Semana 2
  addEx("Semana 2 - Segunda", `${currentBaseVolume + 5} min de trote leve`, "1", `${currentBaseVolume + 5} min`, "Livre");
  addEx("Semana 2 - Quarta", `Treino de Tiros: 6x [${intervalDistance} rápido / 1 min descanso parado]`, "6", intervalDistance, "1 min");
  addEx("Semana 2 - Sábado", `Rodagem Base: ${(Number(currentLongRun) * 1.1).toFixed(1)}km com ritmo constante`, "1", `${Math.round(Number(currentLongRun) * 1.1)} km`, "Livre");

  // Semana 3
  addEx("Semana 3 - Segunda", `${currentBaseVolume + 10} min de trote leve`, "1", `${currentBaseVolume + 10} min`, "Livre");
  addEx("Semana 3 - Quarta", `Intervalado Curto: 8x [Faça 8 tiros de esforço alto]`, "8", "Tiros", "1 min");
  addEx("Semana 3 - Sábado", `Rodagem Longa ou Simulado: ${(Number(currentLongRun) * 1.25).toFixed(1)}km`, "1", "Simulado", "Livre");

  // Semana 4 (Polimento)
  addEx("Semana 4 - Segunda", `Trote Regenerativo de ${currentBaseVolume - 5} min`, "1", `${currentBaseVolume - 5} min`, "Livre");
  addEx("Semana 4 - Quarta", `4x [${intervalDistance} no ritmo de prova / 1 min descanso]`, "4", intervalDistance, "1 min");
  
  if (month % 3 === 0) {
    // Prova teste a cada 3 meses
    addEx("Semana 4 - Sábado", `Dia do Desafio: Corra os ${distance} buscando seu melhor tempo (Prova teste)!`, "1", distance, "Final");
  } else {
    // Semana regenerativa pra proximo ciclo
    addEx("Semana 4 - Sábado", `Rodagem Confortável de encerramento do ciclo: ${currentLongRun}km`, "1", `${currentLongRun} km`, "Livre");
  }

  return exercises;
}

const MOBILITY_DB = [
  { name: "Mobilidade Quadril / Afundo", youtubeId: "c_lG11zT4Xw", desc: "Aumenta flexibilidade da passada" },
  { name: "Alongamento Panturrilha", youtubeId: "-M4-G8p8fmc", desc: "Evita fascite plantar e canelite" },
  { name: "Mobilidade Tornozelo Dinâmica", youtubeId: "D7KaRcUTQeE", desc: "Melhor impulsão na corrida" },
  { name: "Liberação Miofascial (Rolo)", youtubeId: "Jvj2wV0IQc8", desc: "Redução de tensão no trato iliotibial" }
];

async function generateMobilityWorkout(programTitle: string) {
  const workout = await prisma.workout.create({
    data: {
      title: `${programTitle} - Mobilidade`,
      category: "RUNNING",
      description: "Sessão de alongamento e mobilidade para dias OFF",
      exercises: {
        create: MOBILITY_DB.map((ex, i) => ({
          name: ex.name,
          description: ex.desc,
          youtubeId: ex.youtubeId,
          videoProvider: "youtube",
          sets: "1",
          reps: "30s",
          rest: "10s",
          order: i + 1,
        }))
      }
    }
  });
  return workout.id;
}


async function main() {
  const dbModule = await import('../src/lib/db');
  prisma = dbModule.prisma;

  console.log("Iniciando o Seed de Planilhas de Corrida Periodizadas...");

  // Para não duplicar, podemos deletar as anteriores de corrida
  await prisma.trainingProgram.deleteMany({
    where: {
      category: "RUNNING"
    }
  });

  for (const distance of DISTANCES) {
    console.log(`\n============================`);
    console.log(`🏃 Gerando Periodização: Corrida ${distance}`);
    console.log(`============================`);

    const level = distance === "10km" || distance === "21km" ? "Avançado" : "Intermediário";

    for (let month = 1; month <= 12; month++) {
      const programTitle = `Prog Corrida ${distance} - Mês ${month}`;
      console.log(`⚡ ${programTitle}`);

      const trainingProgram = await prisma.trainingProgram.create({
        data: {
          title: `Programa Corrida ${distance} - Mês ${month}`,
          description: `Periodização focada em melhorar pace e resistência nos ${distance}.`,
          durationDays: 30,
          goal: `Corrida ${distance}`,
          category: "RUNNING",
          subcategory: distance,
          level: level,
          month: month
        }
      });

      // 1. CORRIDA ESPECÍFICA (O bloco das 4 semanas)
      const runningExs = generateRunningExercises(distance, month);
      const runningWorkout = await prisma.workout.create({
        data: {
          title: `${programTitle} - Planilha`,
          category: "RUNNING",
          description: `Todas as 4 semanas do mês listadas em ordem. Rola a página para seguir dia a dia.`,
          exercises: {
            create: runningExs
          }
        }
      });

      // Ligar o bloco de corrida na primeira aba
      await prisma.programWorkout.create({
        data: {
          programId: trainingProgram.id,
          workoutId: runningWorkout.id,
          label: "CORRIDA ESPECÍFICA",
          order: 0
        }
      });

      let nextOrder = 1;


      // 3. DIA OFF / MOBILIDADE
      const mobilityWorkoutId = await generateMobilityWorkout(programTitle);
      await prisma.programWorkout.create({
        data: {
          programId: trainingProgram.id,
          workoutId: mobilityWorkoutId,
          label: "DIA OFF / MOBILIDADE",
          order: nextOrder
        }
      });
    }
  }

  console.log("\n✅ Periodização de PLANILHAS DE CORRIDA gerada com sucesso!");
}

main().catch(err => {
  console.error("Erro no seed de corrida:", err);
  process.exit(1);
});
