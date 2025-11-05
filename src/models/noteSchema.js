export const NOTE_TABLE_NAME = 'notes';

export const createNoteTableSql = `
  CREATE TABLE IF NOT EXISTS ${NOTE_TABLE_NAME} (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(120) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

export async function ensureNoteTable(connection) {
  await connection.query(createNoteTableSql);
}
