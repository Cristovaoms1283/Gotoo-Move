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
    // 1. Prioridade: Buscar pelo clerkId único
    let user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (user) {
      // Garantir e-mail sincronizado se mudou no Clerk
      if (user.email !== email) {
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { email }
          });
        } catch (e) {
          console.warn("E-mail ja em uso por outro registro, mantendo o atual.");
        }
      }
      return user;
    }

    // 2. Fallback: Buscar por e-mail (caso seja um usuário pré-criado via Admin/Stripe sem clerkId ainda)
    const existingByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingByEmail) {
      console.log("Sincronizando usuário existente via e-mail:", email);
      return await prisma.user.update({
        where: { id: existingByEmail.id },
        data: { 
          clerkId: clerkUser.id,
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || existingByEmail.name
        },
      });
    }

    // 3. Novo Usuário: Criar se não existir nada
    console.log("Criando registro para novo usuário:", email);
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
    console.error("Erro crítico ao sincronizar usuário:", error);
    return null;
  }
}

export async function updateUserProfile(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Não autorizado");

  const whatsapp = formData.get("whatsapp") as string;
  const goal = formData.get("goal") as string;
  const targetDistance = formData.get("targetDistance") as string;
  const email = user.emailAddresses[0]?.emailAddress;

  console.log("Updating profile for:", { clerkId: user.id, email, whatsapp, goal, targetDistance });

  if (!whatsapp || !goal) {
    throw new Error("Todos os campos são obrigatórios.");
  }

  try {
    // Tenta atualizar primeiro pelo clerkId
    let updated;
    const userData = { whatsapp, goal, targetDistance };
    
    try {
      updated = await prisma.user.update({
        where: { clerkId: user.id },
        data: userData,
      });
    } catch (e) {
      console.warn("Update by clerkId failed, trying email fallback...");
      // Fallback: Tenta pelo e-mail se o clerkId falhou (pode ser o caso de migração)
      if (email) {
        updated = await prisma.user.update({
          where: { email: email.toLowerCase() },
          data: { 
            whatsapp: whatsapp,
            goal: goal,
            targetDistance: targetDistance,
            clerkId: user.id 
          },
        });
      } else {
        throw e;
      }
    }

    // 3. Atribuição Automática de Programa Base
    let programUpdate: any = {};
    
    if (goal === "corrida" || goal === "Corrida de Rua") {
      // Busca programa de corrida (Mês 1) que contenha a distância no título
      // Ex: "Programa Corrida 10km - Mês 1"
      const distLabel = targetDistance || "5km";
      
      // Tenta encontrar o programa de corrida exato para a distância selecionada
      const runningProgram = await prisma.trainingProgram.findFirst({
        where: { 
          title: { contains: distLabel, mode: "insensitive" },
          category: "RUNNING",
          month: 1
        },
        orderBy: { title: 'desc' } // Garante que 10km (maior string) venha antes de 5km se houver conflito de busca parcial
      });

      if (runningProgram) {
        console.log(`[ONBOARDING] Vinculando programa de corrida: ${runningProgram.title}`);
        programUpdate.runningProgramId = runningProgram.id;
      } else {
        console.warn(`[ONBOARDING] Nenhum programa de corrida encontrado para: ${distLabel}`);
        // Fallback para qualquer programa de mês 1 se a distância exata falhar
        const fallbackRunning = await prisma.trainingProgram.findFirst({
          where: { category: "RUNNING", month: 1 }
        });
        if (fallbackRunning) programUpdate.runningProgramId = fallbackRunning.id;
      }
      
      // Também adiciona um programa de musculação base se estiver disponível (Combo)
      const baseGym = await prisma.trainingProgram.findFirst({
        where: { 
          category: "GYM", 
          OR: [
            { title: { contains: "Mês 1", mode: "insensitive" } },
            { month: 1 }
          ]
        }
      });
      if (baseGym) programUpdate.activeProgramId = baseGym.id;
    } else {
      // Busca programa de musculação baseado no objetivo
      const gymGoal = goal.toLowerCase();
      const defaultGym = await prisma.trainingProgram.findFirst({
        where: { 
          category: "GYM",
          AND: [
            {
              OR: [
                { goal: { contains: gymGoal, mode: "insensitive" } },
                { title: { contains: gymGoal, mode: "insensitive" } }
              ]
            },
            {
              OR: [
                 { title: { contains: "Mês 1", mode: "insensitive" } },
                 { month: 1 }
              ]
            }
          ]
        }
      });
      if (defaultGym) programUpdate.activeProgramId = defaultGym.id;
    }

    // Aplica a atribuição de programas
    if (Object.keys(programUpdate).length > 0) {
      updated = await prisma.user.update({
        where: { id: updated.id },
        data: programUpdate
      });
      console.log("Automatic Program Assignment SUCCESS:", programUpdate);
    }

    console.log("Onboarding SUCCESS:", { 
      id: updated.id, 
      clerkId: user.id,
      whatsapp: updated.whatsapp, 
      goal: updated.goal 
    });
  } catch (error) {
    console.error("Onboarding ERROR updating DB:", error);
    throw error;
  }

  // Limpa o cache de TODA a aplicação e redireciona
  revalidatePath("/", "layout");
  redirect("/dashboard");
}
