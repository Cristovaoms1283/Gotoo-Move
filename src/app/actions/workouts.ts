"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";

export async function createWorkout(formData: FormData) {
  await checkAdmin();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;

  // Extrair exercícios (formato simplificado para este exemplo)
  // No mundo ideal, seria um JSON ou campos dinâmicos
  // Para MVP, vamos criar apenas o treino por enquanto ou lidar com campos enumerados
  
  await prisma.workout.create({
    data: {
      title,
      description,
      category,
    },
  });

  revalidatePath("/admin/workouts");
  revalidatePath("/workouts");
  
  // Retorna o ID para redirecionar se necessário
  const workout = await prisma.workout.findFirst({
    where: { title, category },
    orderBy: { createdAt: "desc" }
  });
  
  if (workout) {
    redirect(`/admin/workouts/${workout.id}`);
  }
}

export async function updateWorkout(id: string, formData: FormData) {
  await checkAdmin();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;

  await prisma.workout.update({
    where: { id },
    data: {
      title,
      description,
      category,
    },
  });

  revalidatePath("/admin/workouts");
  revalidatePath(`/admin/workouts/${id}`);
}

export async function addExercise(workoutId: string, formData: FormData) {
  try {
    await checkAdmin();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const youtubeId = formData.get("youtubeId") as string;
    const videoProvider = (formData.get("videoProvider") as string) || "youtube";
    const setsRaw = formData.get("sets") as string;
    const repsRaw = formData.get("reps") as string;
    const restRaw = formData.get("rest") as string;
    const isGironda = formData.get("isGironda") === "true";

    const sets = isGironda ? "8" : setsRaw;
    const reps = isGironda ? "8" : repsRaw;
    const rest = isGironda ? "30s" : restRaw;

    console.log(`[ADD_EXERCISE] Dados recebidos:`, { workoutId, name, videoProvider, youtubeId, reps, rest, isGironda });

    // Pegar o último 'order' para adicionar ao final
    const lastExercise = await prisma.exercise.findFirst({
      where: { workoutId },
      orderBy: { order: "desc" },
    });

    const nextOrder = (lastExercise?.order || 0) + 1;
    const exerciseId = `ex_${Math.random().toString(36).substring(2, 11)}`;
    const now = new Date();

    console.log(`[ADD_EXERCISE] Próxima ordem: ${nextOrder}`);

    // Usando raw query com tagged template para garantir tipagem e sincronização no Windows
    await prisma.$executeRaw`
      INSERT INTO "fitconnect"."Exercise" 
      ("id", "workoutId", "name", "description", "youtubeId", "videoProvider", "sets", "reps", "rest", "isGironda", "order", "createdAt", "updatedAt") 
      VALUES (
        ${exerciseId},
        ${workoutId},
        ${name},
        ${description || ""},
        ${youtubeId},
        ${videoProvider},
        ${sets || ""},
        ${reps || ""},
        ${rest || ""},
        ${isGironda},
        ${nextOrder},
        ${now},
        ${now}
      )
    `;

    console.log(`[ADD_EXERCISE] Sucesso! ID: ${exerciseId}`);
    revalidatePath(`/admin/workouts/${workoutId}`);
    revalidatePath("/admin", "layout");
  } catch (error: any) {
    if (error.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error(`[ADD_EXERCISE] Erro fatal:`, error);
    throw new Error(`Falha ao adicionar exercício: ${error.message || 'Erro desconhecido'}`);
  }
}

export async function updateExercise(id: string, workoutId: string, data: any) {
  try {
    await checkAdmin();

    console.log(`[UPDATE_EXERCISE] Atualizando exercício ${id}:`, data);

    const isGironda = !!data.isGironda;
    const sets = isGironda ? "8" : (data.sets || "");
    const reps = isGironda ? "8" : (data.reps || "");
    const rest = isGironda ? "30s" : (data.rest || "");

    // Usando raw query com tagged template para garantir tipagem e sincronização no Windows
    await prisma.$executeRaw`
      UPDATE "fitconnect"."Exercise" 
      SET 
        "name" = ${data.name},
        "sets" = ${sets},
        "reps" = ${reps},
        "rest" = ${rest},
        "isGironda" = ${isGironda},
        "youtubeId" = ${data.youtubeId || ""},
        "videoProvider" = ${data.videoProvider || "upload"},
        "description" = ${data.description || ""},
        "updatedAt" = ${new Date()}
      WHERE "id" = ${id}
    `;

    console.log(`[UPDATE_EXERCISE] Sucesso! ID: ${id}`);
    revalidatePath(`/admin/workouts/${workoutId}`);
    revalidatePath("/admin", "layout");
  } catch (error: any) {
    if (error.digest?.startsWith('NEXT_REDIRECT')) throw error;
    console.error(`[UPDATE_EXERCISE] ERRO DETALHADO:`, {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });
    throw new Error(`Falha ao atualizar exercício: ${error.message || 'Erro desconhecido'}`);
  }
}

export async function deleteExercise(id: string, workoutId: string) {
  await checkAdmin();

  await prisma.exercise.delete({
    where: { id },
  });

  revalidatePath(`/admin/workouts/${workoutId}`);
  revalidatePath("/admin", "layout");
}

export async function deleteWorkout(id: string) {
  await checkAdmin();

  await prisma.workout.delete({
    where: { id },
  });

  revalidatePath("/admin/workouts");
  revalidatePath("/workouts");
}

export async function syncExerciseVideos() {
  await checkAdmin();
  
  const exercisesWithVideo = await prisma.exercise.findMany({
    where: {
      youtubeId: { not: "" },
    },
    select: {
      name: true,
      youtubeId: true,
      videoProvider: true,
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });

  const videoMap = new Map<string, { youtubeId: string; videoProvider: string }>();
  for (const ex of exercisesWithVideo) {
    if (!videoMap.has(ex.name) && ex.youtubeId && ex.youtubeId.trim() !== "") {
      videoMap.set(ex.name, { youtubeId: ex.youtubeId, videoProvider: ex.videoProvider });
    }
  }

  let updatedCount = 0;

  for (const [name, video] of videoMap.entries()) {
    const result = await prisma.exercise.updateMany({
      where: {
        name: name,
        youtubeId: ""
      },
      data: {
        youtubeId: video.youtubeId,
        videoProvider: video.videoProvider,
      }
    });
    updatedCount += result.count;
  }

  revalidatePath("/admin/workouts");
  revalidatePath("/workouts");
  revalidatePath("/admin", "layout");
  
  return { success: true, count: updatedCount };
}

export async function getExercisesWithoutVideo() {
  await checkAdmin();
  
  // 1. Buscar todos os nomes únicos de exercícios no sistema
  const allExercises = await prisma.exercise.findMany({
    select: { name: true, youtubeId: true }
  });

  const uniqueNames = Array.from(new Set(allExercises.map(ex => ex.name)));
  
  // 2. Identificar quais nomes NÃO possuem vídeo em NENHUMA ocorrência
  const namesWithVideo = new Set(
    allExercises
      .filter(ex => ex.youtubeId && ex.youtubeId.trim() !== "")
      .map(ex => ex.name)
  );

  const results = uniqueNames
    .filter(name => !namesWithVideo.has(name))
    .sort((a, b) => a.localeCompare(b));

  return results;
}

export async function updateVideoForExerciseName(name: string, youtubeId: string, videoProvider: string = "youtube") {
  await checkAdmin();

  const result = await prisma.exercise.updateMany({
    where: { name },
    data: {
      youtubeId,
      videoProvider
    }
  });

  revalidatePath("/admin/workouts");
  revalidatePath("/workouts");
  revalidatePath("/admin", "layout");

  return { success: true, count: result.count };
}

export async function saveWorkoutLog(data: { 
  userId: string; 
  workoutId: string; 
  duration: number; 
  effortScale: number; 
}) {
  try {
    const { userId, workoutId, duration, effortScale } = data;

    // 1. Buscar dados atuais do usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        fitCoins: true, 
        streak: true, 
        lastWorkoutDate: true,
        isDeloadActive: true 
      }
    });

    if (!user) throw new Error("Usuário não encontrado");

    let newFitCoins = user.fitCoins;
    let newStreak = user.streak;
    let suggestDeload = false;

    const now = new Date();
    const lastDate = user.lastWorkoutDate ? new Date(user.lastWorkoutDate) : null;

    // 2. Lógica de Gamificação (Duração mínima de 30 minutos)
    if (duration >= 30) {
      newFitCoins += 10; // +10 por treino

      // Lógica de Streak (Ofensiva) - 48h de tolerância
      if (lastDate) {
        const diffInHours = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);
        
        if (diffInHours <= 48) {
          // Se treinou hoje novamente, não incrementa o streak (apenas uma vez por dia)
          // Mas se for um novo dia dentro das 48h, incrementa
          const isSameDay = now.toDateString() === lastDate.toDateString();
          if (!isSameDay) {
            newStreak += 1;
          }
        } else {
          newStreak = 1; // Reseta se passou de 48h
        }
      } else {
        newStreak = 1; // Primeiro treino
      }

      // Bônus de Semana (+50)
      // Simplificado: se o novo streak for múltiplo de 7
      if (newStreak > 0 && newStreak % 7 === 0 && (newStreak !== user.streak)) {
        newFitCoins += 50;
      }

      // Bônus de Mês (+100)
      if (newStreak > 0 && newStreak % 30 === 0 && (newStreak !== user.streak)) {
        newFitCoins += 100;
      }
    }

    // 3. Inteligência Adaptativa (Borg & Deload)
    // Verificar os últimos 2 treinos para ver se atingiu o limite de 3 seguidos
    const lastLogs = await prisma.workoutLog.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      take: 2,
    });

    if (effortScale >= 9) {
      const highEffortCount = lastLogs.filter(log => log.effortScale >= 9).length;
      if (highEffortCount >= 2) {
        suggestDeload = true;
      }
    }

    // 4. Salvar o Log e Atualizar Usuário
    await prisma.$transaction([
      prisma.workoutLog.create({
        data: {
          userId,
          workoutId,
          duration,
          effortScale,
          completedAt: now
        }
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          fitCoins: newFitCoins,
          streak: newStreak,
          lastWorkoutDate: now
        }
      })
    ]);

    revalidatePath("/dashboard");
    
    return { 
      success: true, 
      fitCoinsGained: duration >= 30 ? 10 : 0,
      newStreak,
      suggestDeload 
    };
  } catch (error: any) {
    console.error("[SAVE_WORKOUT_LOG] Erro:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleDeload(userId: string, active: boolean) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isDeloadActive: active }
    });
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/workouts");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function saveExerciseLoad(userId: string, exerciseId: string, weight: number) {
  try {
    await prisma.exerciseLoad.create({
      data: {
        userId,
        exerciseId,
        weight,
      },
    });
    return { success: true };
  } catch (error: any) {
    console.error("[SAVE_EXERCISE_LOAD] Erro:", error);
    return { success: false, error: error.message };
  }
}

export async function getExerciseLoadHistory(userId: string, exerciseId: string) {
  try {
    const history = await prisma.exerciseLoad.findMany({
      where: { userId, exerciseId },
      orderBy: { createdAt: "asc" }, // Ascendente para gráfico de evolução
      take: 20,
    });
    return { success: true, history };
  } catch (error: any) {
    console.error("[GET_EXERCISE_LOAD_HISTORY] Erro:", error);
    return { success: false, history: [] };
  }
}

export async function getLastExerciseLoad(userId: string, exerciseId: string) {
  try {
    const lastLoad = await prisma.exerciseLoad.findFirst({
      where: { userId, exerciseId },
      orderBy: { createdAt: "desc" },
    });
    return lastLoad;
  } catch (error: any) {
    return null;
  }
}
