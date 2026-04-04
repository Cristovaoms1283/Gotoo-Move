const Stripe = require('stripe');
require('dotenv').config();

const stripe = new Stripe(process.env.STRIPE_API_KEY);

const plans = [
  { id: 'monthly', name: 'Plano Mensal', price: 19, interval: 'month' },
  { id: 'quarterly', name: 'Plano Trimestral', price: 49, interval: 'month', interval_count: 3 },
  { id: 'semiannual', name: 'Plano Semestral', price: 79, interval: 'month', interval_count: 6 },
  { id: 'annual', name: 'Plano Anual', price: 99, interval: 'year' },
];

async function createStripeResources() {
  console.log('🚀 Iniciando criação de recursos no Stripe...');

  for (const plan of plans) {
    try {
      // 1. Create Product
      const product = await stripe.products.create({
        name: plan.name,
        description: `Assinatura ${plan.name} do FitConnect`,
      });

      // 2. Create Price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.price * 100, // em centavos
        currency: 'brl',
        recurring: {
          interval: plan.interval,
          interval_count: plan.interval_count || 1,
        },
      });

      console.log(`✅ ${plan.name}: Product ID: ${product.id}, Price ID: ${price.id}`);
    } catch (error) {
      console.error(`❌ Erro em ${plan.name}:`, error.message);
    }
  }

  console.log('\n⚠️ COPIE OS PRICE IDs ACIMA E ATUALIZE SEU ARQUIVO .env');
}

createStripeResources();
