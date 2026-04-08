
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({
    select: { 
      id: true, 
      email: true, 
      clerkId: true, 
      whatsapp: true, 
      goal: true 
    }
  });
  console.log("=== USUÁRIOS NO BANCO ===");
  console.log(JSON.stringify(users, null, 2));
}

check();
