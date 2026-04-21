const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserPlan(whatsapp) {
  try {
    const user = await prisma.user.findFirst({
      where: { whatsapp: whatsapp },
      include: {
        subscriptions: {
          include: {
            plan: true
          },
          where: {
            status: 'active'
          }
        }
      }
    });

    console.log(JSON.stringify(user, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Test with a known number if possible, or just see the structure
checkUserPlan('5511999999999');
