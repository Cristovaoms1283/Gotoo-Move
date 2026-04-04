const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Carrega variáveis novamente para garantir
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
  // 1. Create Plans
  const plans = [
    { name: 'Mensal', price: 19, interval: 'month', stripePriceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || 'price_monthly_id' },
    { name: 'Trimestral', price: 49, interval: '3 months', stripePriceId: process.env.NEXT_PUBLIC_STRIPE_QUARTERLY_PRICE_ID || 'price_quarterly_id' },
    { name: 'Semestral', price: 79, interval: '6 months', stripePriceId: process.env.NEXT_PUBLIC_STRIPE_SEMIANNUAL_PRICE_ID || 'price_semiannual_id' },
    { name: 'Anual', price: 99, interval: 'year', stripePriceId: process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID || 'price_annual_id' },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { stripePriceId: plan.stripePriceId },
      update: {},
      create: plan,
    });
  }

  // 2. Create Initial Workout (Musculação)
  const workout = await prisma.workout.create({
    data: {
      title: 'Hipertrofia - Treino A',
      description: 'Foco em Peito e Tríceps para iniciantes e intermediários.',
      category: 'Musculação',
      exercises: {
        create: [
          {
            name: 'Supino Reto',
            description: 'Mantenha as escápulas retraídas e o core firme.',
            youtubeId: 'X0vL6V1N7_0',
            sets: '3x12',
            order: 1,
          },
          {
            name: 'Supino Inclinado',
            description: 'Foco na parte superior do peitoral.',
            youtubeId: 'v8Z0qj6xI6I',
            sets: '3x10',
            order: 2,
          },
          {
            name: 'Tríceps Corda',
            description: 'Extensão completa do cotovelo.',
            youtubeId: '2MoGxae-zyo',
            sets: '3x15',
            order: 3,
          },
        ],
      },
    },
  });

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
