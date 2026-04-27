const { Client } = require('pg');
const connectionString = "postgresql://postgres.sptoqnfwysvhbhgecilh:Shoryuken1%40@aws-0-us-west-2.pooler.supabase.com:5432/postgres?schema=fitconnect";

async function main() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  
  console.log("Buscando em Workouts...");
  const resW = await client.query(`SELECT id, title, description FROM fitconnect."Workout" WHERE description ILIKE '%1:30%' OR description ILIKE '%1.5%' OR description ILIKE '%1 minuto e 30%'`);
  console.log(`Workouts: ${resW.rows.length}`);
  resW.rows.forEach(r => console.log(`W ID: ${r.id} | Title: ${r.title} | Desc: ${r.description}`));

  console.log("Buscando em TrainingPrograms...");
  const resP = await client.query(`SELECT id, title, description FROM fitconnect."TrainingProgram" WHERE description ILIKE '%1:30%' OR description ILIKE '%1.5%' OR description ILIKE '%1 minuto e 30%'`);
  console.log(`Programs: ${resP.rows.length}`);
  resP.rows.forEach(r => console.log(`P ID: ${r.id} | Title: ${r.title} | Desc: ${r.description}`));

  await client.end();
}
main();
