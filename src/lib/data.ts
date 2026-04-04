import prisma from "./db";

export interface Workout {
  id: string;
  title: string;
  description: string | null;
  category: string;
  exercises: Exercise[];
}

export interface Exercise {
  id: string;
  name: string;
  description: string | null;
  youtubeId: string;
  videoProvider?: string;
  sets: string | null;
  reps: string | null;
  rest: string | null;
  order: number;
}

export async function getDailyWorkouts(goal?: string | null) {
  try {
    return await prisma.workout.findMany({
      where: goal ? { category: goal } : {},
      include: {
        exercises: {
          orderBy: {
            order: "asc",
          },
        },
      },
      take: 5,
    });
  } catch (error) {
    console.error("Erro ao buscar treinos:", error);
    return [];
  }
}

export async function getWorkoutById(id: string) {
  try {
    return await prisma.workout.findUnique({
      where: { id },
      include: {
        exercises: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });
  } catch (error) {
    console.error("Erro ao buscar treino por ID:", error);
    return null;
  }
}

export async function getUserSubscriptionStatus(clerkId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { status: true, goal: true, id: true, role: true, fitCoins: true, streak: true, isDeloadActive: true },
    });
    return {
      id: user?.id,
      status: user?.status || "inactive",
      goal: user?.goal || null,
      role: user?.role || "user",
      fitCoins: user?.fitCoins || 0,
      streak: user?.streak || 0,
      isDeloadActive: user?.isDeloadActive || false
    };
  } catch (error) {
    console.error("Erro ao buscar status da assinatura:", error);
    return { id: null, status: "inactive", goal: null, role: "user" };
  }
}

export async function getActiveProgram(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        activeProgram: {
          include: {
            workouts: {
              include: {
                workout: {
                  include: {
                    exercises: {
                      orderBy: { order: "asc" }
                    }
                  }
                }
              },
              orderBy: { order: "asc" }
            }
          }
        }
      }
    });

    return user?.activeProgram || null;
  } catch (error) {
    console.error("Erro ao buscar programa ativo:", error);
    return null;
  }
}

export async function getExerciseLastLoads(userId: string, exerciseIds: string[]) {
  try {
    const lastLoads = await prisma.exerciseLoad.findMany({
      where: {
        userId,
        exerciseId: { in: exerciseIds }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Filtra para pegar apenas o mais recente de cada exerciseId
    const latestMap: Record<string, number> = {};
    if (lastLoads) {
      lastLoads.forEach(load => {
        if (!latestMap[load.exerciseId]) {
          latestMap[load.exerciseId] = load.weight;
        }
      });
    }

    return latestMap;
  } catch (error) {
    console.error("Erro ao buscar últimas cargas:", error);
    return {};
  }
}
