const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const programs = await prisma.trainingProgram.findMany({
    where: { title: { contains: 'Metabólico / Intensificação' } },
    select: { id: true, title: true, goal: true }
  });
  console.log(`Encontrados ${programs.length} programas.`);
  programs.forEach(p => console.log(`- [${p.id}] ${p.title} (${p.goal})`));
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
