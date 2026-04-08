import prisma from "../src/lib/db";

async function main() {
  try {
    const email = 'gun_fire2508@hotmail.com';
    console.log(`Checking user: ${email}`);
    
    // Buscar o programa Hipertrofia (GYM)
    const gymProgram = await prisma.trainingProgram.findFirst({
        where: { category: 'GYM', goal: 'Hipertrofia' }
    });
    
    // Buscar o programa 3km (RUNNING)
    const runProgram = await prisma.trainingProgram.findFirst({
        where: { category: 'RUNNING', subcategory: '3km' }
    });
    
    console.log(`Program IDs found: GYM=${gymProgram?.id}, RUN=${runProgram?.id}`);
    
    if (gymProgram && runProgram) {
        const updatedUser = await prisma.user.update({
            where: { email },
            data: {
                activeProgramId: gymProgram.id,
                runningProgramId: runProgram.id
            }
        });
        console.log('User updated successfully:', updatedUser.id);
        console.log('Active Program ID:', updatedUser.activeProgramId);
        console.log('Running Program ID:', updatedUser.runningProgramId);
    } else {
        console.error('Could not find programs to assign.');
    }
    
  } catch (e) {
    console.error('Error during update:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
