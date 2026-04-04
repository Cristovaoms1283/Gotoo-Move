const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const clerkId = 'user_3AfS8E13AInQbdvTOGzeAeyYOdg';
  console.log("Procurando usuario com clerkId:", clerkId);
  const user = await prisma.user.findUnique({ where: { clerkId } });
  
  if (user) {
    await prisma.user.update({
      where: { clerkId },
      data: { role: 'admin' }
    });
    console.log("SUCESSO: Usuário atualizado para ROLE = admin.");
  } else {
    console.log("AVISO: Usuário não encontrado no banco de dados Prisma! O Webhook do Clerk pode ter falhado.");
    
    // Vamos listar os usuários existentes
    const users = await prisma.user.findMany();
    console.log("Usuários existentes no banco:", users.length);
    if(users.length > 0) {
      console.log("Exemplo de user:", users[0].clerkId, users[0].email, users[0].name);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
