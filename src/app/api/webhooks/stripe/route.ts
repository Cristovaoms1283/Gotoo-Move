import { stripe } from "@/lib/stripe";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { resend } from "@/lib/resend";
import { SubscriptionFailedEmail } from "@/components/emails/SubscriptionFailed";

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
    if (finalGoal) {
      const allPrograms = await prisma.trainingProgram.findMany({
        where: { goal: finalGoal },
        orderBy: { createdAt: 'asc' }
      });

      if (allPrograms.length > 0) {
        if (session.mode === "payment") {
          // Pagamento avulso: Programa aleatório do objetivo
          const randomIndex = Math.floor(Math.random() * allPrograms.length);
          activeProgramId = allPrograms[randomIndex].id;
        } else if (session.mode === "subscription") {
          // Nova assinatura: Atribui Mês 1 se o aluno já não estiver na trilha desse objetivo
          const hasProgramForThisGoal = user.activeProgramId 
            ? allPrograms.some(p => p.id === user.activeProgramId)
            : false;
          if (!hasProgramForThisGoal) {
            activeProgramId = allPrograms[0].id; // Mês 1
          }
        }
      }
    }

    // Caso seja Assinatura
    if (session.mode === "subscription") {
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      // Atualiza status do usuário e objetivo e programa ativo
      await prisma.user.update({
        where: { id: user.id },
        data: {
          stripeCustomerId: session.customer as string,
          subscriptionId: subscription.id,
          status: "active",
          goal: finalGoal,
          activeProgramId,
        },
      });

      // Registra ou atualiza a assinatura
      await prisma.subscription.upsert({
        where: { stripeSubscriptionId: subscription.id },
        create: {
          userId: user.id,
          planId: (await prisma.plan.findUnique({ where: { stripePriceId: subscription.items.data[0].price.id } }))?.id || "default",
          status: "active",
          stripeSubscriptionId: subscription.id,
          currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        },
        update: {
          status: "active",
          currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
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
    const invoice = event.data.object as Stripe.Invoice;
    const subscriptionId = (invoice as any).subscription as string;

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
        where: { stripeCustomerId: invoice.customer as string }
      });

      if (user) {
        let activeProgramId = user.activeProgramId;

        // Avanço na periodização (ciclo de renovação a cada 30 dias)
        if (invoice.billing_reason === "subscription_cycle" && user.goal) {
          const allPrograms = await prisma.trainingProgram.findMany({
            where: { goal: user.goal },
            orderBy: { createdAt: 'asc' }
          });

          if (allPrograms.length > 0) {
            const currentIndex = allPrograms.findIndex(p => p.id === activeProgramId);
            if (currentIndex !== -1 && currentIndex < allPrograms.length - 1) {
              activeProgramId = allPrograms[currentIndex + 1].id; // Mês N+1
            } else {
              activeProgramId = allPrograms[0].id; // Retorna para o Mês 1 se algo falhar ou terminar os 12
            }
          }
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { 
            status: "active",
            activeProgramId
          },
        });
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
