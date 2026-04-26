"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";

export async function createProgram(formData: FormData) {
  await checkAdmin();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const durationDays = parseInt(formData.get("durationDays") as string) || 30;
  const goal = formData.get("goal") as string;

  const program = await prisma.trainingProgram.create({
    data: {
      title,
      description,
      durationDays,
      goal: goal || null,
    },
  });

  revalidatePath("/admin/programs");
  redirect(`/admin/programs/${program.id}`);
}

export async function updateProgram(id: string, formData: FormData) {
  await checkAdmin();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const durationDays = parseInt(formData.get("durationDays") as string) || 30;
  const goal = formData.get("goal") as string;

  await prisma.trainingProgram.update({
    where: { id },
    data: {
      title,
      description,
      durationDays,
      goal: goal || null,
    },
  });

  revalidatePath("/admin/programs");
  revalidatePath(`/admin/programs/${id}`);
}

export async function deleteProgram(id: string) {
  await checkAdmin();
  await prisma.trainingProgram.delete({
    where: { id },
  });
  revalidatePath("/admin/programs");
}

export async function addWorkoutToProgram(programId: string, formData: FormData) {
  await checkAdmin();
  const workoutId = formData.get("workoutId") as string;
  const label = formData.get("label") as string; // ex: "Ficha A"
  const order = parseInt(formData.get("order") as string) || 0;

  await prisma.programWorkout.create({
    data: {
      programId,
      workoutId,
      label,
      order,
    },
  });

  revalidatePath(`/admin/programs/${programId}`);
}

export async function removeWorkoutFromProgram(programWorkoutId: string, programId: string) {
  await checkAdmin();
  const programWorkout = await prisma.programWorkout.findUnique({
    where: { id: programWorkoutId },
    include: { workout: true }
  });

  if (programWorkout) {
    // Delete the ProgramWorkout link
    await prisma.programWorkout.delete({
      where: { id: programWorkoutId },
    });
    // Also delete the newly created standalone workout for this Ficha
    await prisma.workout.delete({
      where: { id: programWorkout.workoutId },
    });
  }

  revalidatePath(`/admin/programs/${programId}`);
}

export async function createFichaForProgram(programId: string, formData: FormData) {
  await checkAdmin();
  const label = formData.get("label") as string; // ex: "Ficha A"
  const order = parseInt(formData.get("order") as string) || 0;
  
  const program = await prisma.trainingProgram.findUnique({ where: { id: programId } });

  // Create a new independent workout for this Program's Ficha
  const workout = await prisma.workout.create({
    data: {
      title: `${program?.title || 'Programa'} - ${label}`,
      category: "program-specific",
      description: `Ficha dedicada para o programa ${program?.title}`,
    }
  });

  // Link it to the program as a Ficha
  await prisma.programWorkout.create({
    data: {
      programId,
      workoutId: workout.id,
      label,
      order,
    },
  });

  revalidatePath(`/admin/programs/${programId}`);
}

export async function assignProgramToUser(userId: string, programId: string | null) {
  await checkAdmin();
  await prisma.user.update({
    where: { id: userId },
    data: {
      activeProgramId: programId,
    },
  });
  
  revalidatePath("/admin/users"); // Assuming we'll have a users page
}

export async function duplicateProgram(id: string) {
  await checkAdmin();
  
  const program = await prisma.trainingProgram.findUnique({
    where: { id },
    include: {
      workouts: {
        include: {
          workout: {
            include: {
              exercises: true
            }
          }
        }
      }
    }
  });

  if (!program) throw new Error("Program not found");

  // 1. Criar novo programa
  const newProgram = await prisma.trainingProgram.create({
    data: {
      title: `${program.title} (Cópia)`,
      description: program.description,
      durationDays: program.durationDays,
      goal: program.goal, // Copia o objetivo, mas o admin pode mudar
    }
  });

  // 2. Clonar Workouts e Fichas
  for (const pw of program.workouts) {
    // Cria novo Workout base
    const newWorkout = await prisma.workout.create({
      data: {
        title: `${pw.workout.title} (Cópia)`,
        description: pw.workout.description,
        category: pw.workout.category,
      }
    });

    // Copia exercícios para o novo Workout
    if (pw.workout.exercises.length > 0) {
      await prisma.exercise.createMany({
        data: pw.workout.exercises.map(ex => ({
          workoutId: newWorkout.id,
          name: ex.name,
          description: ex.description,
          youtubeId: ex.youtubeId || "M7lc1UVf-VE",
          videoProvider: ex.videoProvider || "youtube",
          sets: ex.sets,
          reps: ex.reps,
          rest: ex.rest,
          order: ex.order
        }))
      });
    }

    // Cria o vínculo (Aba Ficha)
    await prisma.programWorkout.create({
      data: {
        programId: newProgram.id,
        workoutId: newWorkout.id,
        label: pw.label,
        order: pw.order,
      }
    });
  }

  revalidatePath("/admin/programs");
}

export async function rotateUserProgram(userId: string, targetMonth: number) {
  console.log(`[PROGRAM_ROTATION] Iniciando rotação para o usuário ${userId} para o mês ${targetMonth}`);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { activeProgram: true, runningProgram: true }
  });

  if (!user) throw new Error("Usuário não encontrado");

  let activeProgramId = user.activeProgramId;
  let runningProgramId = user.runningProgramId;

  // 1. Rotação de Musculação (GYM)
  const baseGoal = user.activeProgram?.goal || user.goal;
  if (baseGoal) {
    const nextGym = await prisma.trainingProgram.findFirst({
      where: {
        category: "GYM",
        goal: { equals: baseGoal, mode: 'insensitive' },
        month: targetMonth
      }
    });

    if (nextGym) {
      activeProgramId = nextGym.id;
      console.log(`[PROGRAM_ROTATION] Novo programa GYM: ${nextGym.title}`);
    } else {
      console.warn(`[PROGRAM_ROTATION] Nenhum programa GYM encontrado para Mês ${targetMonth} e Objetivo "${baseGoal}"`);
    }
  }

  // 2. Rotação de Corrida (RUNNING)
  const baseSubcategory = user.runningProgram?.subcategory || user.targetDistance;
  if (baseSubcategory) {
    const nextRunning = await prisma.trainingProgram.findFirst({
      where: {
        category: "RUNNING",
        subcategory: { equals: baseSubcategory, mode: 'insensitive' },
        month: targetMonth
      }
    });

    if (nextRunning) {
      runningProgramId = nextRunning.id;
      console.log(`[PROGRAM_ROTATION] Novo programa RUNNING: ${nextRunning.title}`);
    } else {
      console.warn(`[PROGRAM_ROTATION] Nenhum programa RUNNING encontrado para Mês ${targetMonth} e Distância "${baseSubcategory}"`);
    }
  }

  // 3. Atualiza o usuário
  await prisma.user.update({
    where: { id: userId },
    data: {
      activeProgramId,
      runningProgramId,
      current_training_month: targetMonth
    }
  });

  revalidatePath("/dashboard");
  return { success: true, month: targetMonth };
}
