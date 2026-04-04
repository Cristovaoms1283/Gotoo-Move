const Stripe = require('stripe');
require('dotenv').config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || process.env.STRIPE_API_KEY);

const plans = [
  { id: 'avulso', name: 'Avulso (3 dias)', price: 12.90, type: 'one_time' },
  { id: 'musculacao', name: 'Mensal Musculação', price: 19.90, interval: 'month' },
  { id: 'funcional', name: 'Mensal Funcional', price: 29.90, interval: 'month' },
  { id: 'completo', name: 'Mensal Completo', price: 39.90, interval: 'month' },
];

async function createStripeResources() {
  console.log('🚀 Iniciando criação de novos planos no Stripe...');

  for (const plan of plans) {
    try {
      const product = await stripe.products.create({
        name: plan.name,
        description: `Plano ${plan.name} do FitConnect`,
      });

      const priceData = {
        product: product.id,
        unit_amount: Math.round(plan.price * 100),
        currency: 'brl',
      };

      if (plan.interval) {
        priceData.recurring = {
          interval: plan.interval,
          interval_count: 1,
        };
      }

      const price = await stripe.prices.create(priceData);

      console.log(`✅ ${plan.name}: Product ID: ${product.id}, Price ID: ${price.id}`);
      console.log(`NEXT_PUBLIC_STRIPE_PRICE_${plan.id.toUpperCase()}=${price.id}`);
    } catch (error) {
      console.error(`❌ Erro em ${plan.name}:`, error.message);
    }
  }
}

createStripeResources();
