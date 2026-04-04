import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Listando tabelas e testando inserção direta...");
  try {
    // Tenta uma query direta SQL
    const tables = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'fitconnect'`;
    console.log("Tabelas no schema 'fitconnect':", tables);

    const rewardsTable = await prisma.$queryRaw`SELECT 1 FROM "fitconnect"."Reward" LIMIT 1`;
    console.log("Tabela Reward existe?", !!rewardsTable);

  } catch (error) {
    console.error("ERRO NO DIAGNÓSTICO:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
