import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando vinculação de treino...");
  
  // 1. Encontrar o usuário (CRISTOVAO)
  const user = await prisma.user.findFirst({
    where: { 
      OR: [
        { name: { contains: "CRISTOVAO", mode: "insensitive" } },
        { email: { contains: "cristovao", mode: "insensitive" } }
      ]
    }
  });

  if (!user) {
    console.error("Usuário não encontrado!");
    return;
  }

  console.log(`Usuário encontrado: ${user.name} (${user.id})`);

  // 2. Encontrar o programa de corrida 5km Mês 1
  const runningProgram = await prisma.trainingProgram.findFirst({
    where: { 
      title: { contains: "5km", mode: "insensitive" },
      month: 1
    }
  });

  // 3. Encontrar um programa de musculação base (Hipertrofia Mês 1)
  const gymProgram = await prisma.trainingProgram.findFirst({
    where: { 
      goal: "hipertrofia",
      month: 1,
      category: "GYM"
    }
  });

  if (!runningProgram || !gymProgram) {
    console.warn("Aviso: Alguns programas não foram encontrados.", { running: !!runningProgram, gym: !!gymProgram });
  }

  // 4. Vincular ao usuário
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      runningProgramId: runningProgram?.id || null,
      activeProgramId: gymProgram?.id || null,
      goal: "Corrida de Rua"
    }
  });

  console.log("Sucesso! Usuário atualizado com os seguintes programas:");
  console.log(`- Corrida: ${runningProgram?.title || 'Não encontrado'}`);
  console.log(`- Musculação: ${gymProgram?.title || 'Não encontrado'}`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
