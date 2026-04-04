import 'dotenv/config';
import prisma from './src/lib/db';

async function main() {
  const clerkId = 'user_3AfS8E13AInQbdvTOGzeAeyYOdg';
  console.log("Variáveis de ambiente carregadas.");
  
  const user = await prisma.user.findUnique({
    where: { clerkId: clerkId }
  });
  
  if (user) {
    console.log("USUARIO ENCONTRADO:");
    console.log(JSON.stringify(user, null, 2));
  } else {
    console.log("USUARIO NÃO ENCONTRADO NO BANCO!");
    const allUsers = await prisma.user.findMany({ take: 10 });
    console.log("Primeiros 10 usuários no banco:", JSON.stringify(allUsers, null, 2));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
