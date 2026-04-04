"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export type HomeWorkoutData = {
  title: string;
  instructor: string;
  level: string;
  calories: string;
  youtubeId: string;
  order?: number;
};

// Obter todos os treinos em casa (ordenados)
export async function getHomeWorkouts() {
  try {
    const workouts = await prisma.homeWorkout.findMany({
      orderBy: { order: "asc" }
    });
    return workouts;
  } catch (error) {
    console.error("Erro ao buscar treinos em casa:", error);
    return [];
  }
}

export async function getHomeWorkoutById(id: string) {
  try {
    return await prisma.homeWorkout.findUnique({ where: { id } });
  } catch (error) {
    console.error("Erro ao buscar treino por id:", error);
    return null;
  }
}

// Criar um novo treino em casa
export async function createHomeWorkout(data: HomeWorkoutData) {
  try {
    const lastWorkout = await prisma.homeWorkout.findFirst({
      orderBy: { order: "desc" }
    });
    
    const newOrder = lastWorkout ? lastWorkout.order + 1 : 1;

    await prisma.homeWorkout.create({
      data: {
        ...data,
        order: data.order ?? newOrder
      }
    });

    revalidatePath("/treino-em-casa");
    revalidatePath("/admin/home-workouts");
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar treino em casa:", error);
    return { success: false, error: "Falha ao criar treino" };
  }
}

// Atualizar um treino em casa
export async function updateHomeWorkout(id: string, data: Partial<HomeWorkoutData>) {
  try {
    await prisma.homeWorkout.update({
      where: { id },
      data
    });

    revalidatePath("/treino-em-casa");
    revalidatePath("/admin/home-workouts");
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar treino em casa:", error);
    return { success: false, error: "Falha ao atualizar treino" };
  }
}

// Excluir um treino em casa
export async function deleteHomeWorkout(id: string) {
  try {
    await prisma.homeWorkout.delete({
      where: { id }
    });

    revalidatePath("/treino-em-casa");
    revalidatePath("/admin/home-workouts");
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar treino em casa:", error);
    return { success: false, error: "Falha ao deletar treino" };
  }
}
