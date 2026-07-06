import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";

export async function getUserRole() {
  const { userId } = await auth();
  if (!userId) return null;
  
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });
  
  return user?.role || "user";
}

export async function requireAdminOrSupervisor() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true, id: true },
  });

  const role = user?.role;
  
  if (role !== "admin" && role !== "supervisor") {
    console.log(`[CHECK_AUTH] Acesso bloqueado. Role: ${role}`);
    redirect("/");
  }

  return { clerkId: userId, dbId: user?.id, role };
}

export async function requireAdmin() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true, id: true },
  });

  if (user?.role !== "admin") {
    console.log(`[CHECK_AUTH] Acesso bloqueado. Exigido: Admin. Recebido: ${user?.role}`);
    redirect("/"); 
  }

  return { clerkId: userId, dbId: user?.id, role: user.role };
}
