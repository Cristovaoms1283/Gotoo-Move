import { PrismaClient } from '@prisma/client';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

const prisma = new PrismaClient();

async function test() {
  try {
    const plans = await prisma.plan.findMany();
    console.log('Plans:', plans);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
