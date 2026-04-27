const { Client } = require('pg');
const connectionString = "postgresql://postgres.sptoqnfwysvhbhgecilh:Shoryuken1%40@aws-0-us-west-2.pooler.supabase.com:5432/postgres?schema=fitconnect";

async function main() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  
  console.log("Iniciando atualização global de tempos de descanso...");

  // Padrões para 1:30
  const targets = ["1:30", "1.5 min", "1,5 min", "1.5min", "1,5min", "90s", "90 s", "1 minuto e 30", "1 min e 30"];
  
  for (const target of targets) {
    const res = await client.query(`UPDATE fitconnect."Exercise" SET rest = '1 min' WHERE rest ILIKE $1`, [`%${target}%`]);
    if (res.rowCount > 0) {
      console.log(`Atualizados ${res.rowCount} registros para o padrão: ${target}`);
    }
  }

  // Também verificar descrições que possam ter o tempo hardcoded (opcional, mas bom garantir)
  const resDesc = await client.query(`UPDATE fitconnect."Exercise" SET description = REPLACE(description, '1:30', '1:00') WHERE description ILIKE '%1:30%'`);
  if (resDesc.rowCount > 0) console.log(`Atualizadas ${resDesc.rowCount} descrições em Exercise (1:30 -> 1:00)`);

  const resDesc2 = await client.query(`UPDATE fitconnect."Exercise" SET description = REPLACE(description, '1 minuto e 30 segundos', '1 minuto') WHERE description ILIKE '%1 minuto e 30 segundos%'`);
  if (resDesc2.rowCount > 0) console.log(`Atualizadas ${resDesc2.rowCount} descrições em Exercise (1 min 30s -> 1 min)`);

  await client.end();
  console.log("Atualização concluída!");
}
main().catch(console.error);
