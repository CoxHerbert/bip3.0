import mysql from 'mysql2/promise';

let pool;

function parseIntEnv(value, fallback) {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

export async function connectToDatabase() {
  if (pool) {
    return pool;
  }

  const {
    MYSQL_HOST = 'localhost',
    MYSQL_PORT = '3306',
    MYSQL_USER = 'root',
    MYSQL_PASSWORD = '',
    MYSQL_DATABASE = 'bip3',
    MYSQL_CONNECTION_LIMIT = '10'
  } = process.env;

  pool = mysql.createPool({
    host: MYSQL_HOST,
    port: parseIntEnv(MYSQL_PORT, 3306),
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: parseIntEnv(MYSQL_CONNECTION_LIMIT, 10),
    namedPlaceholders: true
  });

  await ensureSchema();

  return pool;
}

async function ensureSchema() {
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS notes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(120) NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  const connection = await pool.getConnection();
  try {
    await connection.query(createTableSql);
  } finally {
    connection.release();
  }
}

export function getPool() {
  if (!pool) {
    throw new Error('Database connection has not been established. Call connectToDatabase() first.');
  }
  return pool;
}

export async function disconnectFromDatabase() {
  if (!pool) {
    return;
  }

  await pool.end();
  pool = undefined;
}