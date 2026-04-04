// Versão do Prisma atualizada: 12/03/2026 - v2
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});

const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Se o prisma já existe no global, verificamos se ele tem os modelos novos ou campos novos
if (globalForPrisma.prisma && 
    (!('trainingProgram' in globalForPrisma.prisma) || 
      !('recipe' in globalForPrisma.prisma) ||
      !('reward' in globalForPrisma.prisma) ||
      !('exerciseLoad' in globalForPrisma.prisma))
) {
  console.log("⚠️ Prisma Client Global detectado como DESATUALIZADO (Reward ausente). Resetando...");
  globalForPrisma.prisma = undefined;
}

if (!globalForPrisma.prisma) {
  console.log("🚀 Inicializando Novo Prisma Client com suporte a TrainingProgram...");
  globalForPrisma.prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma;

console.log("✅ Prisma Ativo. Modelos:", Object.keys(prisma).filter(k => !k.startsWith('$') && !k.startsWith('_')));

export default prisma;
