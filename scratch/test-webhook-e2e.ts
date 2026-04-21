const prisma = require('../src/lib/db').default || require('../src/lib/db');

async function simulateWebhookCheckout(clerkId: string, goal: string, stripePriceId: string) {
  console.log(`\n[TEST] Simulando Checkout Completado: User ${clerkId} | Goal: ${goal}`);
  
  // 1. Verificar se o usuário existe
  const user = await prisma.user.findUnique({
    where: { clerkId }
  });

  if (!user) {
    console.error('[TEST] ERRO: Usuário não encontrado no banco.');
    return;
  }

  // 2. Simular lógica do Webhook (Extraída do route.ts)
  const plan = await prisma.plan.findUnique({ where: { stripePriceId } });
  const planId = plan?.id || "default";
  const isHybrid = planId.includes("runner") || planId.includes("performance") || planId.includes("completo");

  let activeProgramId = user.activeProgramId;
  let runningProgramId = user.runningProgramId;

  if (isHybrid) {
    const gymPrograms = await prisma.trainingProgram.findMany({
      where: { category: "GYM" },
      orderBy: { createdAt: 'asc' }
    });
    const runningPrograms = await prisma.trainingProgram.findMany({
      where: { category: "RUNNING", month: 1 },
      orderBy: { createdAt: 'asc' }
    });

    const gymPart = gymPrograms.find(p => goal.toLowerCase().includes(p.goal?.toLowerCase() || "")) || gymPrograms[0];
    const runningPart = runningPrograms.find(p => goal.toLowerCase().includes(p.goal?.toLowerCase() || "")) || runningPrograms[0];

    activeProgramId = gymPart?.id || null;
    runningProgramId = runningPart?.id || null;
  } else {
    const allPrograms = await prisma.trainingProgram.findMany({
      where: { goal },
      orderBy: { createdAt: 'asc' }
    });

    if (allPrograms.length > 0) {
      activeProgramId = allPrograms[0].id;
    }
  }

  // 3. Atualizar Usuário
  await prisma.user.update({
    where: { id: user.id },
    data: {
      status: "active",
      goal,
      activeProgramId,
      runningProgramId,
    },
  });

  console.log(`[TEST] SUCESSO: Usuário atualizado.`);
  console.log(`[TEST] Status: active | Program ID: ${activeProgramId} | Running ID: ${runningProgramId}`);
}

async function main() {
  // Criar um usuário de teste temporário se não houver
  const testClerkId = "user_e2e_test_" + Date.now();
  await prisma.user.upsert({
    where: { clerkId: testClerkId },
    update: {},
    create: {
      clerkId: testClerkId,
      name: "Atleta de Teste E2E",
      email: `test_e2e_${Date.now()}@example.com`,
      status: "inactive",
    }
  });

  // Testar cenário Hipertrofia
  await simulateWebhookCheckout(testClerkId, "Hipertrofia", "price_1SxS0aIdzwQv3GAtYkUlCh1N");

  // Testar cenário Combo (Corrida + Musculação)
  await simulateWebhookCheckout(testClerkId, "Corrida de Rua", "price_1TJDJvIdzwQv3GAtvZ1KGcnT");

  // Limpeza (opcional)
  // await prisma.user.delete({ where: { clerkId: testClerkId } });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
