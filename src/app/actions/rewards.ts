"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getRewards() {
  return await prisma.reward.findMany({
    orderBy: { cost: "asc" }
  });
}

export async function createReward(data: { name: string, description: string, cost: number, imageUrl?: string }) {
  try {
    const reward = await prisma.reward.create({
      data: {
        title: data.name,
        description: data.description,
        cost: data.cost,
        imageUrl: data.imageUrl
      }
    });
    revalidatePath("/admin/rewards");
    revalidatePath("/dashboard/rewards");
    return { success: true, reward };
  } catch (error: any) {
    console.error("Erro ao criar reward:", error);
    return { success: false, error: error?.message || "Erro desconhecido no servidor" };
  }
}

export async function deleteReward(id: string) {
  try {
    await prisma.reward.delete({ where: { id } });
    revalidatePath("/admin/rewards");
    revalidatePath("/dashboard/rewards");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message };
  }
}

export async function redeemReward(userId: string, rewardId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, fitCoins: true }
    });

    const reward = await prisma.reward.findUnique({
      where: { id: rewardId }
    });

    if (!user || !reward) return { success: false, error: "Usuário ou Recompensa não encontrado" };
    if (user.fitCoins < reward.cost) return { success: false, error: "FitCoins insuficientes" };

    // Transação: Descontar moedas e criar registro de resgate
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { fitCoins: { decrement: reward.cost } }
      }),
      prisma.userReward.create({
        data: {
          userId: user.id,
          rewardId: reward.id,
          status: "pending"
        }
      })
    ]);

    revalidatePath("/dashboard/rewards");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Erro ao resgatar:", error);
    return { success: false, error: "Erro interno no servidor" };
  }
}

export async function getUserStats(clerkId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { 
        status: true, 
        goal: true, 
        id: true, 
        role: true, 
        fitCoins: true, 
        streak: true 
      },
    });
    
    return {
      id: user?.id,
      status: user?.status || "inactive",
      goal: user?.goal || null,
      role: user?.role || "user",
      fitCoins: user?.fitCoins || 0,
      streak: user?.streak || 0
    };
  } catch (error) {
    console.error("Erro ao buscar status:", error);
    return null;
  }
}
