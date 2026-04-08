"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function updateUserRunningGoal(data: {
  distance: string;
  gymGoal?: string;
  time5k?: string;
  time10k?: string;
}) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!user) throw new Error("User not found");

  // Definir o nível baseado na distância (12km+ é avançado)
  const level = data.distance === "12km+" ? "Avançado" : "Iniciante/Intermediário";

  // Buscar o programa de corrida correspondente
  const runningProgram = await prisma.trainingProgram.findFirst({
    where: {
      category: "RUNNING",
      subcategory: data.distance,
    },
  });

  // Buscar o programa de ginásio correspondente se houver gymGoal
  let gymProgramId = undefined;
  if (data.gymGoal) {
    // Tenta buscar o programa específico do mês
    let gymProgram = await prisma.trainingProgram.findFirst({
      where: {
        category: "GYM",
        goal: data.gymGoal,
        month: user.current_training_month || 1
      }
    });

    // Fallback: busca por programa sem mês definido (caso geral)
    if (!gymProgram) {
      gymProgram = await prisma.trainingProgram.findFirst({
        where: {
          category: "GYM",
          goal: data.gymGoal,
          month: null
        }
      });
    }

    gymProgramId = gymProgram?.id;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      goal: data.gymGoal || `Corrida ${data.distance}`,
      activeProgramId: gymProgramId,
      runningProgramId: runningProgram?.id,
      // Aqui poderíamos salvar os tempos de 5k/10k em um campo de metadados se existisse, 
      // mas no momento vamos focar na ativação do plano.
    },
  });

  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Script de Seed para criar a estrutura básica de Corrida (para fins de demonstração inicial)
 */
export async function seedRunningPrograms() {
  const distances = ["3km", "5km", "7km", "10km", "12km+"];
  
  for (const dist of distances) {
    const program = await prisma.trainingProgram.upsert({
      where: { id: `prog-run-${dist}` },
      update: {},
      create: {
        id: `prog-run-${dist}`,
        title: `Periodização Corrida ${dist}`,
        description: `Plano anual de 52 semanas focado em performance e saúde para ${dist}.`,
        category: "RUNNING",
        subcategory: dist,
        durationDays: 365,
        level: dist === "12km+" ? "Avançado" : "Intermediário",
      }
    });

    // Criar Treinos modelo para este programa (Simplificado para o Seed)
    const runWorkout = await prisma.workout.upsert({
      where: { id: `workout-run-${dist}` },
      update: {},
      create: {
        id: `workout-run-${dist}`,
        title: `${dist} | Rodagem Base`,
        category: "RUNNING",
        description: "Treino aeróbico de base para adaptação cardiovascular.",
      }
    });

    const strengthWorkout = await prisma.workout.upsert({
      where: { id: `workout-strength-runners-${dist}` },
      update: {},
      create: {
        id: `workout-strength-runners-${dist}`,
        title: "Fortalecimento Corredores",
        category: "GYM",
        description: "Prevenção de lesões e estabilidade de core.",
      }
    });

    // Vincular ao programa
    await prisma.programWorkout.upsert({
      where: { id: `pw-run-${dist}` },
      update: {},
      create: {
        id: `pw-run-${dist}`,
        programId: program.id,
        workoutId: runWorkout.id,
        label: "Corrida",
        order: 1,
      }
    });

    await prisma.programWorkout.upsert({
      where: { id: `pw-strength-${dist}` },
      update: {},
      create: {
        id: `pw-strength-${dist}`,
        programId: program.id,
        workoutId: strengthWorkout.id,
        label: "Fortalecimento",
        order: 2,
      }
    });
  }

  return { success: true };
}
