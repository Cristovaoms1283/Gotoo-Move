
require('dotenv').config();
const { Client } = require('pg');

async function testConn() {
  const connectionString = process.env.DATABASE_DIRECT_URL || process.env.DATABASE_URL;
  console.log('Testando conexão com:', connectionString.split('@')[1]); // mostra host sem senha
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conexão com PG bem-sucedida!');
    const res = await client.query('SELECT NOW()');
    console.log('Hora no DB:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('❌ Falha na conexão:', err.message);
    console.error(err);
  }
}

testConn();
