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
      select: { 
        status: true, 
        goal: true, 
        id: true, 
        role: true, 
        fitCoins: true, 
        streak: true, 
        isDeloadActive: true, 
        isGuest: true,
        whatsapp: true 
      },
    });
    // 2. Buscar a assinatura ativa atual (se não for convidado)
    let planName = user?.isGuest ? "Combo Performance" : "Nenhum";
    let access = {
      canGym: true, // Musculação costuma ser a base, mas vamos refinar abaixo
      canHIIT: true,
      canRunning: true
    };

    if (!user?.isGuest && user?.id) {
      const activeSub = await prisma.subscription.findFirst({
        where: { 
          userId: user.id,
          status: "active"
        },
        include: { plan: true },
        orderBy: { createdAt: 'desc' }
      });
      
      if (activeSub) {
        planName = activeSub.plan.name;
      } else {
        // Se não tem assinatura ativa, mas tem status active, pode ser compra avulsa
        const oneOff = await prisma.oneOffPurchase.findFirst({
          where: { userId: user.id, status: "completed" }
        });
        if (oneOff) planName = "Plano Avulso";
      }
    }

    // 3. Mapeamento de Regras (Conforme solicitado)
    // PERFORMANCE / AVULSO: Tudo ✅
    // RUNNER: Musculação + Corrida ✅ | HIIT 🔒
    // COMPLETO: Musculação + HIIT ✅ | Corrida 🔒
    // MUSCULAÇÃO: Musculação ✅ | HIIT/Corrida 🔒
    // FUNCIONAL: HIIT ✅ | Musculação/Corrida 🔒

    const normalizedPlan = planName.toLowerCase();
    const isAdmin = user?.role === 'admin';
    
    access = {
      canGym: isAdmin || 
              normalizedPlan.includes("musculação") || 
              normalizedPlan.includes("runner") || 
              normalizedPlan.includes("completo") || 
              normalizedPlan.includes("performance") || 
              normalizedPlan.includes("avulso") ||
              ["mensal", "trimestral", "semestral", "anual"].includes(normalizedPlan),
      canHIIT: isAdmin || 
               normalizedPlan.includes("funcional") || 
               normalizedPlan.includes("completo") || 
               normalizedPlan.includes("performance") || 
               normalizedPlan.includes("avulso"),
      canRunning: isAdmin || 
                  normalizedPlan.includes("runner") || 
                  normalizedPlan.includes("performance") || 
                  normalizedPlan.includes("avulso")
    };

    return {
      id: user?.id,
      status: user?.isGuest ? "active" : (user?.status || "inactive"),
      goal: user?.goal || null,
      role: user?.role || "user",
      fitCoins: user?.fitCoins || 0,
      streak: user?.streak || 0,
      isDeloadActive: user?.isDeloadActive || false,
      isGuest: user?.isGuest || false,
      whatsapp: user?.whatsapp || null,
      planName,
      access
    };
  } catch (error) {
    console.error("Erro ao buscar status da assinatura:", error);
    return { 
      id: null, 
      status: "inactive", 
      goal: null, 
      role: "user", 
      isGuest: false, 
      whatsapp: null,
      planName: "Nenhum",
      access: { canGym: false, canHIIT: false, canRunning: false }
    };
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
              include: { workout: { include: { exercises: { orderBy: { order: "asc" } } } } },
              orderBy: { order: "asc" }
            }
          }
        },
        runningProgram: {
          include: {
            workouts: {
              include: { workout: { include: { exercises: { orderBy: { order: "asc" } } } } },
              orderBy: { order: "asc" }
            }
          }
        }
      }
    });

    if (!user) return null;

    let mergedProgram = null;

    if (user.activeProgram && user.runningProgram) {
      mergedProgram = {
        ...user.activeProgram,
        title: `${user.runningProgram.title} + ${user.activeProgram.title}`,
        workouts: [
          ...user.runningProgram.workouts.map((pw: any) => ({ ...pw, type: 'running' })),
          ...user.activeProgram.workouts.map((pw: any) => ({ ...pw, type: 'gym' }))
        ]
      };
    } else if (user.activeProgram) {
      mergedProgram = {
        ...user.activeProgram,
        workouts: user.activeProgram.workouts.map((pw: any) => ({ ...pw, type: 'gym' }))
      };
    } else if (user.runningProgram) {
      mergedProgram = {
        ...user.runningProgram,
        workouts: user.runningProgram.workouts.map((pw: any) => ({ ...pw, type: 'running' }))
      };
    }

    return mergedProgram;
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
