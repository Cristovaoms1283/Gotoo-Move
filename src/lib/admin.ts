import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";

export async function checkAdmin() {
  const { userId } = await auth();
  console.log(`[CHECK_ADMIN] Verificando acesso para UserID: ${userId || 'Nulo'}`);

  if (!userId) {
    console.log("[CHECK_ADMIN] Redirecionando para /sign-in por falta de UserID");
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  console.log(`[CHECK_ADMIN] Resultado da query DB para ${userId}:`, user);

  if (user?.role !== "admin") {
    console.log(`[CHECK_ADMIN] ACESSO NEGADO. Role: ${user?.role || 'null'}. Redirecionando para /`);
    redirect("/");
  }

  console.log(`[CHECK_ADMIN] ACESSO PERMITIDO (admin).`);
  return user;

  return user;
}
