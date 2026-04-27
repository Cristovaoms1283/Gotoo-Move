const { Client } = require('pg');
const connectionString = "postgresql://postgres.sptoqnfwysvhbhgecilh:Shoryuken1%40@aws-0-us-west-2.pooler.supabase.com:5432/postgres?schema=fitconnect";

async function main() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const res = await client.query(`
    SELECT id, name, rest, description FROM fitconnect."Exercise"
    WHERE (rest ILIKE '%30%' OR description ILIKE '%30%')
      AND (rest ILIKE '%1%' OR description ILIKE '%1%')
  `);
  console.log(`Encontrados com '30' e '1': ${res.rows.length}`);
  res.rows.forEach(r => {
    console.log(`ID: ${r.id} | Name: ${r.name} | Rest: ${r.rest} | Desc: ${r.description}`);
  });
  await client.end();
}
main();
