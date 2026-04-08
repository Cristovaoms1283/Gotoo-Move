"use server";

import { stripe } from "@/lib/stripe";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function createCheckoutSession(priceId: string, goal: string) {
  console.log(`[STRIPE_ACTION] Iniciando createCheckoutSession - PriceID: ${priceId} | Goal: ${goal}`);
  try {
    const { userId } = await auth();
    const user = await currentUser();
    console.log(`[STRIPE_ACTION] Subscription - User: ${user?.id || 'DESLOGADO'}`);

    if (!userId || !user) {
      return { error: "AUTH_REQUIRED", url: "/sign-in" };
    }

    if (!stripe) {
      return { error: "STRIPE_CONFIG_ERROR", message: "Stripe não configurado no servidor." };
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/#pricing`,
      customer_email: user.emailAddresses[0].emailAddress,
      metadata: { clerkId: userId, goal },
    });

    console.log(`[STRIPE_ACTION] Sessão criada: ${session.id}`);
    return { url: session.url };
  } catch (error: any) {
    console.error("[STRIPE_ACTION] Erro:", error.message);
    return { error: "STRIPE_ERROR", message: error.message };
  }
}

export async function createOneOffCheckoutSession(goal: string, priceId?: string) {
  console.log(`[STRIPE_ACTION] Iniciando createOneOffCheckoutSession - Goal: ${goal} | PriceID: ${priceId}`);
  try {
    const { userId } = await auth();
    const user = await currentUser();
    console.log(`[STRIPE_ACTION] OneOff - User: ${user?.id || 'DESLOGADO'}`);

    if (!userId || !user) {
      return { error: "AUTH_REQUIRED", url: "/sign-in" };
    }

    if (!stripe) {
      return { error: "STRIPE_CONFIG_ERROR", message: "Stripe não configurado no servidor." };
    }

    const PRICE_ID = priceId || process.env.NEXT_PUBLIC_STRIPE_ONEOFF_PRICE_ID || "price_1TD2RpIdzwQv3GAtF25dwfy2";

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/#pricing`,
      customer_email: user.emailAddresses[0].emailAddress,
      metadata: { clerkId: userId, goal, type: "one_time_workout", priceId: PRICE_ID },
    });

    return { url: session.url };
  } catch (error: any) {
    console.error("[STRIPE_ACTION] Erro OneOff:", error.message);
    return { error: "STRIPE_ERROR", message: error.message };
  }
}
