import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });

import { prisma } from './src/lib/db';

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
  })
  
  console.log("=== PROGRAMS AND GOALS ===");
  for (const p of programs) {
    console.log(`Program: ${p.title} | Goal: ${p.goal} | Workouts: ${p.workouts.length}`);
    for (const pw of p.workouts) {
      console.log(`  - [${pw.label}] ${pw.workout.title} (${pw.workout.exercises.length} exercises)`);
    }
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
