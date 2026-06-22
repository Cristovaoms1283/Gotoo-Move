"use server";

import { stripe } from "@/lib/stripe";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function createCheckoutSession() {
  console.log(`[STRIPE_ACTION] Iniciando createCheckoutSession do Plano Único VIP`);
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return { error: "AUTH_REQUIRED", url: "/sign-in" };
    }

    if (!stripe) {
      return { error: "STRIPE_CONFIG_ERROR", message: "Stripe não configurado no servidor." };
    }

    // Criamos a sessão dinamicamente com price_data (Plano + Taxa de Adesão)
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.emailAddresses[0].emailAddress,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/#pricing`,
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: "Plano FitConnect - Acesso Total",
              description: "Acesso completo a todas as modalidades.",
            },
            unit_amount: 1900, // R$ 19,00
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: "brl",
            product_data: { name: "Primeiro Mês de Teste" },
            unit_amount: 299, // R$ 2,99
          },
          quantity: 1,
        }
      ],
      subscription_data: {
        trial_period_days: 30, // Nos primeiros 30 dias a assinatura de 19 não cobra
        metadata: { clerkId: userId, plan: "VIP_TRIAL" },
      },
      metadata: { clerkId: userId, plan: "VIP_TRIAL" },
      custom_text: {
        submit: {
          message: "A cobrança de R$ 2,99 libera o uso integral por 30 dias. Após o período de teste, o valor passará para R$ 19,00 mensais com renovação automática, podendo ser cancelado a qualquer hora."
        }
      }
    });

    console.log(`[STRIPE_ACTION] Sessão Trial criada: ${session.id}`);
    return { url: session.url };
  } catch (error: any) {
    console.error("[STRIPE_ACTION] Erro:", error.message);
    return { error: "STRIPE_ERROR", message: error.message };
  }
}
