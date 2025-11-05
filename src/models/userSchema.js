export const USER_TABLE_NAME = 'users';

export const createUserTableSql = `
  CREATE TABLE IF NOT EXISTS ${USER_TABLE_NAME} (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(60) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

export async function ensureUserTable(connection) {
  await connection.query(createUserTableSql);
}
