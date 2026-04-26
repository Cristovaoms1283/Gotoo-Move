"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

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
