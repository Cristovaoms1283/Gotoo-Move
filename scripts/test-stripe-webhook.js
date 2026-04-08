const crypto = require('crypto');
const dotenv = require('dotenv');
const path = require('path');

// Carrega variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const WEBHOOK_URL = 'http://localhost:3000/api/webhooks/stripe';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

if (!STRIPE_WEBHOOK_SECRET) {
  console.error('❌ STRIPE_WEBHOOK_SECRET não encontrado no .env');
  process.exit(1);
}

async function simulateWebhook(type, object) {
  const payload = JSON.stringify({
    id: `evt_test_${Math.random().toString(36).substring(7)}`,
    type: type,
    data: {
      object: object
    },
    created: Math.floor(Date.now() / 1000),
  });

  const timestamp = Math.floor(Date.now() / 1000);
  const signaturePayload = `${timestamp}.${payload}`;
  const hmac = crypto
    .createHmac('sha256', STRIPE_WEBHOOK_SECRET)
    .update(signaturePayload)
    .digest('hex');

  const stripeSignature = `t=${timestamp},v1=${hmac}`;

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: payload,
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': stripeSignature,
      },
    });

    if (response.ok) {
      console.log(`✅ Webhook [${type}] enviado com sucesso! Status: ${response.status}`);
    } else {
      const text = await response.text();
      console.error(`❌ Erro ao enviar webhook [${type}]: Status ${response.status}`, text);
    }
  } catch (error) {
    console.error(`❌ Erro de conexão ao enviar webhook [${type}]:`, error.message);
  }
}

const eventType = process.argv[2] || 'checkout.session.completed';
const clerkId = process.argv[3];
const mode = process.argv[4] || 'subscription';
const goal = process.argv[5] || 'Hipertrofia + Corrida 5km';
const priceId = process.argv[6] || process.env.NEXT_PUBLIC_STRIPE_PRICE_RUNNER || 'price_1TJDJvIdzwQv3GAtvZ1KGcnT';

if (!clerkId) {
  console.log('\nUso: node scripts/test-stripe-webhook.js <EVENT_TYPE> <CLERK_USER_ID> [MODE] [GOAL] [PRICE_ID]');
  console.log('Exemplos:');
  console.log('  node scripts/test-stripe-webhook.js checkout.session.completed user_2n... subscription "Combo Runner" price_...');
  console.log('  node scripts/test-stripe-webhook.js checkout.session.completed user_2n... payment "Hipertrofia"');
  process.exit(0);
}

let mockObject;

if (eventType === 'checkout.session.completed') {
  mockObject = {
    id: 'cs_test_123',
    customer: `cus_test_${Math.random().toString(36).substring(7)}`,
    subscription: mode === 'subscription' ? `sub_test_${Math.random().toString(36).substring(7)}` : null,
    mode: mode,
    amount_total: 3990, // R$ 39,90
    metadata: {
      clerkId: clerkId,
      goal: goal,
      priceId: priceId,
      type: mode === 'payment' ? 'one_time_workout' : 'subscription'
    }
  };
} else if (eventType === 'customer.subscription.deleted') {
  mockObject = {
    id: 'sub_1T8iqbIdzwQv3GAt5wJq1Lkz',
    customer: 'cus_U6wkGuikm2h6f1',
    status: 'canceled'
  };
} else if (eventType === 'invoice.payment_succeeded') {
  mockObject = {
    id: 'in_test_123',
    customer: 'cus_U6wkGuikm2h6f1',
    subscription: 'sub_1T8iqbIdzwQv3GAt5wJq1Lkz',
    status: 'paid',
    billing_reason: 'subscription_cycle'
  };
} else {
  console.error(`❌ Tipo de evento não suportado no mock: ${eventType}`);
  process.exit(1);
}

console.log(`🚀 Simulando evento [${eventType}] (modo: ${mode}, goal: ${goal}) para o usuário ${clerkId}...`);
simulateWebhook(eventType, mockObject);
