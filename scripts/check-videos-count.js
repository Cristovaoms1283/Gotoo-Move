const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

async function main() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    // 1. Todos os exercícios
    const allExercises = await prisma.exercise.findMany({
      select: { name: true, youtubeId: true }
    });

    const uniqueNames = Array.from(new Set(allExercises.map(ex => ex.name)));
    const totalRecords = allExercises.length;

    // 2. Nomes com pelo menos um vídeo
    const namesWithVideo = new Set(
      allExercises
        .filter(ex => ex.youtubeId && ex.youtubeId.trim() !== "" && ex.youtubeId !== "SN")
        .map(ex => ex.name)
    );

    // 3. Nomes sem nenhum vídeo
    const namesWithoutVideo = uniqueNames.filter(name => !namesWithVideo.has(name));

    // 4. Registros individuais sem vídeo
    const recordsWithoutVideo = allExercises.filter(ex => !ex.youtubeId || ex.youtubeId.trim() === "" || ex.youtubeId === "SN");

    console.log('--- RELATÓRIO DE VÍDEOS ---');
    console.log(`Total de exercícios únicos (nomes): ${uniqueNames.length}`);
    console.log(`Nomes ÚNICOS sem nenhum vídeo: ${namesWithoutVideo.length}`);
    console.log(`Progresso de cobertura: ${(((uniqueNames.length - namesWithoutVideo.length) / uniqueNames.length) * 100).toFixed(1)}%`);
    console.log('---------------------------');
    console.log(`Total de registros (instâncias): ${totalRecords}`);
    console.log(`Registros individuais sem vídeo: ${recordsWithoutVideo.length}`);
    console.log('---------------------------');

    if (namesWithoutVideo.length > 0) {
      console.log('\nTop 10 nomes faltando (alfabético):');
      namesWithoutVideo.sort().slice(0, 10).forEach(name => console.log(`- ${name}`));
    }

  } catch (e) {
    console.error('Erro:', e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
