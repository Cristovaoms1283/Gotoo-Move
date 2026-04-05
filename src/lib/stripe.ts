import Stripe from "stripe";

// Apenas inicializa se houver chave (servidor)
export const stripe = process.env.STRIPE_API_KEY 
  ? new Stripe(process.env.STRIPE_API_KEY, {
      apiVersion: "2026-02-25.clover" as Stripe.LatestApiVersion,
      typescript: true,
    })
  : null;

export const PLANS = [
  {
    id: "avulso",
    name: "Avulso (3 Dias)",
    price: "12,90",
    description: "Acesso por 3 dias, sem renovação",
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_AVULSO,
    type: "one_time"
  },
  {
    id: "musculacao",
    name: "Mensal Musculação",
    price: "19,90",
    description: "Foco total na Academiauração",
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MUSCULACAO,
    type: "subscription"
  },
  {
    id: "funcional",
    name: "Mensal Funcional em Casa",
    price: "29,90",
    description: "Treine em casa sem equipamentos",
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_FUNCIONAL,
    type: "subscription"
  },
  {
    id: "completo",
    name: "Mensal Completo",
    price: "39,90",
    description: "Musculação + Funcional",
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_COMPLETO,
    type: "subscription"
  },
  {
    id: "combo-runner",
    name: "Combo Runner",
    price: "39,90",
    description: "Corrida + Fortalecimento Híbrido",
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_RUNNER,
    type: "subscription",
    goalGroup: "Corrida"
  },
  {
    id: "combo-performance",
    name: "Combo Performance",
    price: "59,90",
    description: "Corrida + Fortalecimento + Funcional",
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PERFORMANCE,
    type: "subscription",
    goalGroup: "Corrida"
  },
];
