const mysql = require('mysql2/promise');

async function wipe() {
  console.log('Connecting to Aiven DB...');
  const conn = await mysql.createConnection({
    host: 'inovatech-enzocorcetti4-0c7b.f.aivencloud.com',
    port: 19255,
    user: 'avnadmin',
    password: 'AVNS_GM1BQwVVD1TzLXvs1gY',
    database: 'defaultdb',
    ssl: { rejectUnauthorized: false }
  });

  console.log('Connected! Wiping tables...');
  await conn.query('SET FOREIGN_KEY_CHECKS = 0;');
  await conn.query('TRUNCATE TABLE orcamento_item;');
  await conn.query('TRUNCATE TABLE movimentacao_estoque;');
  await conn.query('TRUNCATE TABLE orcamento;');
  await conn.query('TRUNCATE TABLE peca;');
  await conn.query('TRUNCATE TABLE clientes;');
  await conn.query('TRUNCATE TABLE transacoes;');
  await conn.query('SET FOREIGN_KEY_CHECKS = 1;');

  console.log('Done! All tables truncated.');
  conn.end();
}

wipe().catch(console.error);
