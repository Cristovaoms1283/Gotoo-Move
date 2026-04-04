import prisma from './src/lib/db';
import fs from 'fs';

async function main() {
  const users = await prisma.user.findMany();
  fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
  console.log("Salvo", users.length, "usuarios em users.json");
}

main().catch(console.error);
