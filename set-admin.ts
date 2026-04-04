import 'dotenv/config';
import prisma from './src/lib/db';

async function main() {
  const clerkId = 'user_3AfS8E13AInQbdvTOGzeAeyYOdg';
  const email = 'admin_' + Date.now() + '@fitconnect.com';
  console.log("Variáveis de ambiente carregadas.");
  console.log("Upserting usuario com raw SQL...");
  
  try {
    const result = await prisma.$executeRawUnsafe(`
      INSERT INTO fitconnect."User" ("id", "clerkId", "name", "email", "role", "updatedAt") 
      VALUES (gen_random_uuid()::text, $1, 'Admin Local', $2, 'admin', NOW())
      ON CONFLICT ("clerkId") 
      DO UPDATE SET "role" = 'admin';
    `, clerkId, email);
    
    console.log("SUCESSO: Usuário criado/atualizado com Raw SQL para ROLE = admin.");
  } catch (err) {
    console.error("ERRO:", err);
  }
}

main().catch(console.error);
