import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("🚀 Iniciando Seeding de Corrida de Rua (52 Semanas) no Supabase...");

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("❌ DATABASE_URL não encontrada no .env!");
  }

  const pool = new Pool({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    // 1. Criar o Programa de Fortalecimento Híbrido (Obrigatório para corredores)
    const strengthProgramId = "strength-for-runners-52w";
    const strengthProgram = await prisma.trainingProgram.upsert({
      where: { id: strengthProgramId },
      update: {
        title: "Fortalecimento de Elite para Corredores",
        description: "Foco em glúteo médio, tibial anterior e estabilidade de core. 52 semanas de proteção e potência.",
        durationDays: 52 * 7,
        category: "GYM",
        level: "Avançado",
      },
      create: {
        id: strengthProgramId,
        title: "Fortalecimento de Elite para Corredores",
        description: "Foco em glúteo médio, tibial anterior e estabilidade de core. 52 semanas de proteção e potência.",
        durationDays: 52 * 7,
        category: "GYM",
        level: "Avançado",
      },
    });

    console.log("✅ Programa de Fortalecimento Híbrido criado/atualizado!");

    const distances = ["3km", "5km", "7km", "10km", "12km+"];
    
    for (const dist of distances) {
      const distId = `running-${dist.replace("+", "plus")}-52w`;
      console.log(`\n🏃‍♂️ Sincronizando periodização para ${dist}...`);

      await prisma.trainingProgram.upsert({
        where: { id: distId },
        update: {
          title: `Plano de Performance ${dist}`,
          description: `Periodização anual de 52 semanas focada em ${dist}. Mesociclos de Base, Desenvolvimento, Específico e Performance.`,
          durationDays: 52 * 7,
          category: "RUNNING",
          subcategory: dist,
          companionProgramId: strengthProgram.id,
        },
        create: {
          id: distId,
          title: `Plano de Performance ${dist}`,
          description: `Periodização anual de 52 semanas focada em ${dist}. Mesociclos de Base, Desenvolvimento, Específico e Performance.`,
          durationDays: 52 * 7,
          category: "RUNNING",
          subcategory: dist,
          companionProgramId: strengthProgram.id,
        },
      });

      console.log(`✨ OK: ${dist}`);
    }

    console.log("\n🚀 Seeding finalizado com sucesso no Supabase! Todos os programas de corrida estão ativos e vinculados.");
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
