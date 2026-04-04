import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
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
    
    // Obter também todos os workouts normais (avulsos)
    const workouts = await prisma.workout.findMany({
      include: {
        exercises: true
      }
    });

    return NextResponse.json({ programs, workouts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
