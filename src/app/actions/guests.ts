"use server";

import prisma from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getGuests() {
  try {
    return await prisma.user.findMany({
      where: { isGuest: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Erro ao buscar convidados:", error);
    return [];
  }
}

export async function addGuest(email: string) {
  try {
    if (!email) return { success: false, error: "E-mail é obrigatório." };

    // 1. Verificar se o usuário já existe no banco
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      if (existingUser.isGuest) {
        return { success: false, error: "Este usuário já é um bolsista." };
      }

      await prisma.user.update({
        where: { id: existingUser.id },
        data: { isGuest: true, status: "active" },
      });
    } else {
      // 2. Se não existe, criamos um convite no Clerk
      // O Clerk enviará o e-mail automaticamente se configurado no Dashboard
      const client = await clerkClient();
      await client.invitations.createInvitation({
        emailAddress: email,
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/sign-up`,
        publicMetadata: {
          isGuest: true,
        },
      });

      // Criamos um registro temporário no banco para marcar como convidado
      // Quando ele se cadastrar, o webhook ou o sync deve vincular o isGuest: true
      // Mas para garantir, podemos criar o User se tivermos o nome, ou apenas aguardar o login.
      // Por simplicidade aqui, vamos apenas registrar a intenção ou criar um user placeholder.
      await prisma.user.upsert({
        where: { email },
        update: { isGuest: true, status: "active" },
        create: {
          email,
          name: "Convidado Pendente",
          clerkId: `pending_${Date.now()}`, // ID temporário que será atualizado no sync
          isGuest: true,
          status: "active",
        }
      });
    }

    revalidatePath("/admin/guests");
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao adicionar convidado:", error);
    return { success: false, error: error.message || "Erro ao processar convite." };
  }
}

export async function removeGuest(userId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isGuest: false, status: "inactive" },
    });

    revalidatePath("/admin/guests");
    return { success: true };
  } catch (error) {
    console.error("Erro ao remover convidado:", error);
    return { success: false, error: "Erro ao remover acesso do convidado." };
  }
}
