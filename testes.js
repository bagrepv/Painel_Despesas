const db = require('./db');

(async () => {
  try {
    // 1. Teste de conexão
    const [testResult] = await db.query('SELECT 1 + 1 AS test');
    console.log('✅ Conexão OK. Teste:', testResult[0].test);

    // 2. Lista tabelas disponíveis (para depuração)
    const [tables] = await db.query('SHOW TABLES');
    console.log('📋 Tabelas no banco:', tables.map(t => t[Object.keys(t)[0]]));

    await db.query(`
        INSERT INTO usuarios (
          nome
        )
        VALUES (
          "paulao"
        )
    `)

    // 3. Consulta principal
    const [users] = await db.query('SELECT nome, email FROM usuarios');
    console.log('📊 Usuários encontrados:', users.length);
    console.log(users.slice(0, 3));
    
  } catch (err) {
    console.error('❌ Erro:', err.message);
    console.log('🔍 Dicas:');
    console.log('- Verifique db.js (host/user/senha)');
    console.log('- Tabela "usuarios" existe? Execute SHOW TABLES');
    console.log('- IP liberado no KingHost?');
  } finally {
    if (db.end) {
      await db.end();
      console.log('🔌 Conexão encerrada.');
    }
  }
})();