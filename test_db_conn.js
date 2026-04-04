
require('dotenv').config();
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

async function testConnection() {
  console.log('Testando conexão com:', connectionString.split('@')[1]); // Log sem a senha
  
  // Teste 1: Sem SSL (Porta 5432)
  console.log('\nTentativa 1: Sem SSL (Porta 5432)...');
  const pool1 = new Pool({ connectionString, connectionTimeoutMillis: 5000 });
  try {
    const start = Date.now();
    await pool1.query('SELECT NOW()');
    console.log('Sucesso sem SSL! Tempo:', Date.now() - start, 'ms');
  } catch (err) {
    console.log('Falha sem SSL:', err.message);
  } finally {
    await pool1.end();
  }

  // Teste 2: Com SSL (Porta 5432)
  console.log('\nTentativa 2: Com SSL (Porta 5432)...');
  const pool2 = new Pool({ 
    connectionString, 
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000 
  });
  try {
    const start = Date.now();
    await pool2.query('SELECT NOW()');
    console.log('Sucesso com SSL! Tempo:', Date.now() - start, 'ms');
  } catch (err) {
    console.log('Falha com SSL:', err.message);
  } finally {
    await pool2.end();
  }

  // Teste 3: Porta 6543 (Pooler Host Antigo)
  console.log('\nTentativa 3: Porta 6543 (Pooler Host Antigo)...');
  const poolerUrlOld = connectionString.replace(':5432/', ':6543/');
  const pool3 = new Pool({ 
    connectionString: poolerUrlOld, 
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000 
  });
  try {
    const start = Date.now();
    await pool3.query('SELECT NOW()');
    console.log('Sucesso na Porta 6543! Tempo:', Date.now() - start, 'ms');
  } catch (err) {
    console.log('Falha na Porta 6543:', err.message);
  } finally {
    await pool3.end();
  }

  // Teste 5: Host do Pooler com usuário formatado (postgres.[ref])
  console.log('\nTentativa 5: Host do Pooler com usuário postgres.sptoqnfwysvhbhgecilh...');
  const projectRef = 'sptoqnfwysvhbhgecilh';
  const poolerHostCorrect = 'aws-0-us-west-2.pooler.supabase.com';
  // Formato: postgresql://postgres.[ref]:password@host:5432/postgres...
  let poolerConnStringCorrect = connectionString.replace('db.sptoqnfwysvhbhgecilh.supabase.co', poolerHostCorrect);
  poolerConnStringCorrect = poolerConnStringCorrect.replace('postgresql://postgres:', `postgresql://postgres.${projectRef}:`);
  
  const pool5 = new Pool({ 
    connectionString: poolerConnStringCorrect, 
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000 
  });
  try {
    const start = Date.now();
    await pool5.query('SELECT NOW()');
    console.log('SUCESSO ABSOLUTO com o Pooler IPv4! Tempo:', Date.now() - start, 'ms');
  } catch (err) {
    console.log('Falha no Teste 5:', err.message);
  } finally {
    await pool5.end();
  }
}

testConnection();
