"use server";

import prisma from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function syncUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) return null;

  try {
    // 1. Verificar se já existe um usuário com este e-mail (pode ser um bolsista pendente)
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Se o ID do Clerk estiver diferente (pendente), atualizamos
      if (existingUser.clerkId !== clerkUser.id) {
        return await prisma.user.update({
          where: { id: existingUser.id },
          data: { 
            clerkId: clerkUser.id,
            name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || existingUser.name
          },
        });
      }
      return existingUser;
    }

    // 2. Se não existe, criamos um novo usuário
    // Verificamos se há algum convite/metadata no Clerk (opcional)
    const isGuest = clerkUser.publicMetadata.isGuest === true;

    return await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "Usuário",
        email: email,
        isGuest: isGuest,
        status: isGuest ? "active" : "inactive",
      },
    });
  } catch (error) {
    console.error("Erro ao sincronizar usuário:", error);
    return null;
  }
}

export async function updateUserProfile(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Não autorizado");

  const whatsapp = formData.get("whatsapp") as string;
  const goal = formData.get("goal") as string;

  if (!whatsapp || !goal) {
    throw new Error("Todos os campos são obrigatórios.");
  }

  await prisma.user.update({
    where: { clerkId: user.id },
    data: {
      whatsapp,
      goal,
    },
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
