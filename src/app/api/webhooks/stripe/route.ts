import { stripe } from "@/lib/stripe";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { resend } from "@/lib/resend";
import { SubscriptionFailedEmail } from "@/components/emails/SubscriptionFailed";
import { rotateUserProgram } from "@/app/actions/programs";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  if (!stripe) {
    return new NextResponse("Stripe is not configured", { status: 500 });
  }

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error(`[STRIPE_WEBHOOK_ERROR] ${error.message}`);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as any;

  // 1. Checkout Finalizado (Nova Assinatura ou Pagamento Avulso)
  if (event.type === "checkout.session.completed") {
    const clerkId = session?.metadata?.clerkId;
    const goal = session?.metadata?.goal;

    if (!clerkId) {
      return new NextResponse("User id is required", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const finalGoal = goal || user.goal;
    
    // Find matching program based on goal and periodization logic
    let activeProgramId = user.activeProgramId;
    let runningProgramId = user.runningProgramId;

    const stripePriceId = session.mode === "subscription" 
      ? (session.metadata?.priceId || (await stripe.subscriptions.retrieve(session.subscription as string).catch(() => null))?.items.data[0].price.id)
      : (session.metadata?.priceId || session.metadata?.price_id);

    const plan = stripePriceId 
      ? await prisma.plan.findUnique({ where: { stripePriceId } }) 
      : null;
    
    const planId = plan?.id || "default";

    const isHybrid = planId.includes("runner") || planId.includes("performance") || planId.includes("completo");

    if (finalGoal) {
      if (isHybrid) {
        // Lógica Híbrida: Tentar separar Musculação e Corrida
        const gymPrograms = await prisma.trainingProgram.findMany({
          where: { category: "GYM" },
          orderBy: { createdAt: 'asc' }
        });
        const runningPrograms = await prisma.trainingProgram.findMany({
          where: { category: "RUNNING", month: 1 },
          orderBy: { createdAt: 'asc' }
        });

        // Tenta achar musculação por objetivo (ex: Hipertrofia)
        const gymPart = gymPrograms.find(p => finalGoal.toLowerCase().includes(p.goal?.toLowerCase() || "")) || gymPrograms[0];
        // Tenta achar corrida por objetivo (ex: 5km)
        const runningPart = runningPrograms.find(p => finalGoal.toLowerCase().includes(p.goal?.toLowerCase() || "")) || runningPrograms[0];

        activeProgramId = gymPart?.id || null;
        runningProgramId = runningPart?.id || null;
      } else {
        // Lógica Simples (Original)
        const allPrograms = await prisma.trainingProgram.findMany({
          where: { goal: finalGoal },
          orderBy: { createdAt: 'asc' }
        });

        if (allPrograms.length > 0) {
          if (session.mode === "payment") {
            const randomIndex = Math.floor(Math.random() * allPrograms.length);
            activeProgramId = allPrograms[randomIndex].id;
          } else {
            activeProgramId = allPrograms[0].id;
          }
        }
      }
    }

    // Caso seja Assinatura
    if (session.mode === "subscription") {
      let subId = session.subscription as string;
      let currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default 30 dias

      if (subId) {
        const subscription = await stripe.subscriptions.retrieve(subId).catch(() => null);
        if (subscription) {
          currentPeriodEnd = new Date((subscription as any).current_period_end * 1000);
        }
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          stripeCustomerId: session.customer as string,
          subscriptionId: subId,
          status: "active",
          goal: finalGoal,
          activeProgramId,
          runningProgramId,
        },
      });

      // Registra ou atualiza a assinatura
      await prisma.subscription.upsert({
        where: { stripeSubscriptionId: subId || "test_sub" },
        create: {
          userId: user.id,
          planId: planId,
          status: "active",
          stripeSubscriptionId: subId || "test_sub",
          currentPeriodEnd: currentPeriodEnd,
        },
        update: {
          status: "active",
          currentPeriodEnd: currentPeriodEnd,
        },
      });
    } 
    
    // Caso seja Pagamento Avulso (PIX, Cartão, etc)
    else if (session.mode === "payment") {
      await prisma.oneOffPurchase.create({
        data: {
          userId: user.id,
          amount: session.amount_total / 100,
          status: "completed",
        }
      });

      // Ativa o status do usuário temporariamente e salva o objetivo e programa
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          status: "active",
          goal: finalGoal,
          activeProgramId,
        }
      });
    }
  }

  // 2. Pagamento de Fatura Bem Sucedido (Renovação)
  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as any;
    const subscriptionId = invoice.subscription as string;

    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      await prisma.subscription.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          status: "active",
          currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        },
      });

      const user = await prisma.user.findUnique({
        where: { stripeCustomerId: invoice.customer as string },
        include: { activeProgram: true }
      });

      if (user) {
        let activeProgramId = user.activeProgramId;
        let runningProgramId = user.runningProgramId;
        let currentMonth = user.current_training_month;

        // Avanço na periodização (ciclo de renovação a cada 30 dias)
        if (invoice.billing_reason === "subscription_cycle") {
          const nextMonth = currentMonth >= 12 ? 1 : currentMonth + 1;
          console.log(`[STRIPE_WEBHOOK] Avançando mês de treinamento para o usuário ${user.id} (${user.email}) para o mês ${nextMonth}`);
          await rotateUserProgram(user.id, nextMonth);
        } else {
          // Apenas garante que o status esteja ativo se não for renovação de ciclo (ex: primeiro pagamento)
          await prisma.user.update({
            where: { id: user.id },
            data: { status: "active" },
          });
        }
      }
    }
  }

  // 3. Pagamento de Fatura Falhou
  if (event.type === "invoice.payment_failed") {
    const customer = await stripe.customers.retrieve(session.customer as string) as Stripe.Customer;

    await prisma.user.updateMany({
      where: { stripeCustomerId: session.customer as string },
      data: { status: "past_due" },
    });

    // Enviar e-mail de falha na cobrança
    if (customer.email) {
      await resend.emails.send({
        from: 'Gotoo Move <onboarding@resend.dev>',
        to: customer.email,
        subject: 'Houve um problema com seu pagamento do Fit Connect 💳',
        react: SubscriptionFailedEmail({
          userName: customer.name || 'Atleta',
          planName: 'Sua assinatura Fit Connect'
        }) as never,
      });
    }
  }

  // 4. Assinatura Deletada ou Cancelada
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;

    await prisma.subscription.update({
      where: { stripeSubscriptionId: subscription.id },
      data: { status: "canceled" },
    });

    await prisma.user.updateMany({
      where: { stripeCustomerId: subscription.customer as string },
      data: { status: "inactive" },
    });
  }

  // 5. Assinatura Atualizada (Upgrade, Downgrade, etc)
  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;

    await prisma.subscription.update({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: subscription.status === "active" ? "active" : "inactive",
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      },
    });
    
    // Sincroniza status do usuário se necessário
    if (subscription.status !== "active") {
        await prisma.user.updateMany({
            where: { stripeCustomerId: subscription.customer as string },
            data: { status: subscription.status === "past_due" ? "past_due" : "inactive" },
        });
    }
  }

  return new NextResponse(null, { status: 200 });
}
