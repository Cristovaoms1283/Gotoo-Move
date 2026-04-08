import { PrismaClient } from '@prisma/client';
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from 'dotenv';
dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function check() {
  try {
    const workouts = await prisma.workout.findMany({
      where: {
        OR: [
          { category: { contains: "RUNNING", mode: "insensitive" } },
          { title: { contains: "corrida", mode: "insensitive" } },
          { title: { contains: "fortalecimento", mode: "insensitive" } }
        ]
      },
      select: { id: true, title: true, category: true }
    });
    console.log("WORKOUTS_FOUND:", workouts);
    process.exit(0);
  } catch (err) {
    console.error("ERRO:", err);
    process.exit(1);
  }
}
check();
