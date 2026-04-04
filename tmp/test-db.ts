import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Tentando criar recompensa de teste...");
  try {
    const reward = await prisma.reward.create({
      data: {
        title: "Teste de Persistência",
        description: "Testando se a tabela existe e aceita dados",
        cost: 100,
        imageUrl: "https://exemplo.com/foto.jpg"
      }
    });
    console.log("Sucesso! Recompensa criada:", reward);
  } catch (error) {
    console.error("ERRO FATAL NA CRIAÇÃO:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
