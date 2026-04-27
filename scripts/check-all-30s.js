const { Client } = require('pg');
const connectionString = "postgresql://postgres.sptoqnfwysvhbhgecilh:Shoryuken1%40@aws-0-us-west-2.pooler.supabase.com:5432/postgres?schema=fitconnect";

async function main() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  
  const res = await client.query(`SELECT id, name, rest FROM fitconnect."Exercise" WHERE rest LIKE '%30%'`);
  console.log(`Encontrados ${res.rows.length} registros com '30' no descanso:`);
  res.rows.forEach(r => console.log(`ID: ${r.id} | Name: ${r.name} | Rest: ${r.rest}`));

  await client.end();
}
main().catch(console.error);
