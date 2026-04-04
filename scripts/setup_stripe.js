const fs = require('fs');
const path = require('path');
const Stripe = require('stripe');

const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf-8');

const apiKeyMatch = envContent.match(/STRIPE_API_KEY=(["']?)(.*?)\1(\r?\n|$)/);
if (!apiKeyMatch) {
  console.error("No STRIPE_API_KEY found in .env");
  process.exit(1);
}
const apiKey = apiKeyMatch[2];

const stripe = new Stripe(apiKey);

async function createPlan(name, price, interval, intervalCount) {
  const product = await stripe.products.create({ name });
  const priceObj = await stripe.prices.create({
    product: product.id,
    unit_amount: price * 100,
    currency: 'brl',
    recurring: interval ? { interval, interval_count: intervalCount || 1 } : undefined,
  });
  return priceObj.id;
}

async function main() {
  try {
    console.log("Creating new prices...");
    
    const monthlyPrice = await createPlan("FitConnect - Mensal", 19, "month", 1);
    console.log("Monthly:", monthlyPrice);
    
    const quarterlyPrice = await createPlan("FitConnect - Trimestral", 49, "month", 3);
    console.log("Quarterly:", quarterlyPrice);
    
    const semiannualPrice = await createPlan("FitConnect - Semestral", 79, "month", 6);
    console.log("Semiannual:", semiannualPrice);
    
    const annualPrice = await createPlan("FitConnect - Anual", 99, "year", 1);
    console.log("Annual:", annualPrice);
    
    const oneoffPrice = await createPlan("FitConnect - Treino Avulso", 5, null);
    console.log("OneOff:", oneoffPrice);
    
    let newEnvContent = envContent;
    newEnvContent = newEnvContent.replace(/NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID=["']?.*["']?/, `NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID="${monthlyPrice}"`);
    newEnvContent = newEnvContent.replace(/NEXT_PUBLIC_STRIPE_QUARTERLY_PRICE_ID=["']?.*["']?/, `NEXT_PUBLIC_STRIPE_QUARTERLY_PRICE_ID="${quarterlyPrice}"`);
    newEnvContent = newEnvContent.replace(/NEXT_PUBLIC_STRIPE_SEMIANNUAL_PRICE_ID=["']?.*["']?/, `NEXT_PUBLIC_STRIPE_SEMIANNUAL_PRICE_ID="${semiannualPrice}"`);
    newEnvContent = newEnvContent.replace(/NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID=["']?.*["']?/, `NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID="${annualPrice}"`);
    newEnvContent = newEnvContent.replace(/NEXT_PUBLIC_STRIPE_ONEOFF_PRICE_ID=["']?.*["']?/, `NEXT_PUBLIC_STRIPE_ONEOFF_PRICE_ID="${oneoffPrice}"`);
    
    fs.writeFileSync(envPath, newEnvContent);
    console.log("Successfully updated .env with new price IDs.");
  } catch (error) {
    console.error("Error creating prices:", error);
  }
}

main();
