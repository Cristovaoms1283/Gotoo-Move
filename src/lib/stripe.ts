import Stripe from "stripe";

// Apenas inicializa se houver chave (servidor)
export const stripe = process.env.STRIPE_API_KEY 
  ? new Stripe(process.env.STRIPE_API_KEY, {
      apiVersion: "2026-02-25.clover" as Stripe.LatestApiVersion,
      typescript: true,
    })
  : null;
