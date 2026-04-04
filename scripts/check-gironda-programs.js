const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const programs = await prisma.trainingProgram.findMany({
    select: {
      id: true,
      title: true,
      goal: true,
      workouts: {
        select: {
          workout: {
            select: {
              exercises: {
                select: {
                  isGironda: true,
                  sets: true,
                  reps: true
                }
              }
            }
          }
        }
      }
    }
  });

  const summary = programs.map(p => {
    let girondaCount = 0;
    let totalExercises = 0;
    p.workouts.forEach(pw => {
      pw.workout.exercises.forEach(e => {
        totalExercises++;
        if (e.isGironda) girondaCount++;
      });
    });
    return {
      title: p.title,
      goal: p.goal,
      totalExercises,
      girondaCount,
      isGirondaProgram: girondaCount > 0
    };
  });

  console.log(JSON.stringify(summary, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
