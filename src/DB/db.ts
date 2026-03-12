import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 50,
  connectTimeout: 10000,
  timezone: 'Z',
});

export async function testConnection() {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
      console.log('Conexão com o banco de dados estabelecida com sucesso.');
  } catch (error) {
      console.error('Erro ao conectar no banco de dados:', error);
  }finally{
    conn.release();
  }
}

export default pool;
