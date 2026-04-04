import 'dotenv/config';
import prisma from '../src/lib/db';

async function main() {
  const exercises = await prisma.exercise.findMany({
    where: { videoProvider: 'pinterest' },
    select: { name: true, youtubeId: true },
    distinct: ['name']
  });

  console.log(JSON.stringify(exercises, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
