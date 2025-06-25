// db.js (MODIFICADO para usar variáveis de ambiente)
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST, // Lê da variável de ambiente
  user: process.env.DB_USER, // Lê da variável de ambiente
  password: process.env.DB_PASSWORD, // Lê da variável de ambiente
  database: process.env.DB_NAME, // Lê da variável de ambiente
  waitForConnections: true,
  connectionLimit: 10,  
  queueLimit: 0
});

module.exports = pool;