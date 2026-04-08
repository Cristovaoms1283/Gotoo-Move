import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const email = 'gun_fire2508@hotmail.com';
    console.log(`Investigando registros para o e-mail: ${email}`);
    
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        activeProgram: true,
        runningProgram: true,
      },
    });
    
    if (!user) {
      console.log('Usuário não encontrado.');
    } else {
      console.log('Dados do usuário:');
      console.log(JSON.stringify(user, null, 2));
    }
    
    const programs = await prisma.trainingProgram.findMany({
      where: {
        OR: [
          { title: { contains: 'Hipertrofia', mode: 'insensitive' } },
          { title: { contains: '3km', mode: 'insensitive' } },
        ],
      },
    });
    
    console.log('\nProgramas encontrados:');
    console.table(programs.map(p => ({ id: p.id, title: p.title, category: p.category })));

  } catch (e) {
    console.error('Erro na investigação:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
