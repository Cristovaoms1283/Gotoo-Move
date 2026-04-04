require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log("Modelos disponíveis no Prisma:");
  console.log(Object.keys(prisma).filter(key => !key.startsWith('_') && !key.startsWith('$')));
  
  await prisma.$disconnect();
}

main();
