import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();
  try {
    const users = await prisma.user.findMany({
      take: 10,
      orderBy: { updatedAt: 'desc' }
    });
    console.log("LAST 10 UPDATED USERS:");
    console.table(users.map(u => ({
      id: u.id,
      email: u.email,
      whatsapp: u.whatsapp,
      goal: u.goal,
      clerkId: u.clerkId,
      updatedAt: u.updatedAt
    })));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
