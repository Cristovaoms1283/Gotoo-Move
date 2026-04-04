const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const programs = await prisma.trainingProgram.findMany({
    include: {
      workouts: {
        include: {
          workout: {
            include: {
              exercises: true
            }
          }
        }
      }
    }
  });

  const girondaPrograms = programs.filter(p => {
    return p.workouts.some(pw => 
      pw.workout.exercises.some(e => e.isGironda)
    );
  });

  console.log('Programas que utilizam a metodologia Gironda:');
  girondaPrograms.forEach(p => {
    console.log(`- ${p.title} (Objetivo: ${p.goal})`);
    const girondaWorkouts = p.workouts.filter(pw => 
      pw.workout.exercises.some(e => e.isGironda)
    );
    girondaWorkouts.forEach(pw => {
       const gExCount = pw.workout.exercises.filter(e => e.isGironda).length;
       console.log(`  * ${pw.label}: ${gExCount} exercícios Gironda`);
    });
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
