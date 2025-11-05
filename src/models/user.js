import { getPool } from '../config/database.js';
import { USER_TABLE_NAME } from './userSchema.js';

function mapRow(row) {
  return {
    id: row.id,
    username: row.username,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function createUser({ username, passwordHash }) {
  const pool = getPool();
  const [result] = await pool.query(
    `INSERT INTO ${USER_TABLE_NAME} (username, password_hash) VALUES (:username, :passwordHash)`,
    { username, passwordHash }
  );
  return findUserById(result.insertId);
}

export async function findUserById(id) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT id, username, password_hash, created_at, updated_at FROM ${USER_TABLE_NAME} WHERE id = :id`,
    { id }
  );
  const [row] = rows;
  return row ? mapRow(row) : null;
}

export async function findUserByUsername(username) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT id, username, password_hash, created_at, updated_at FROM ${USER_TABLE_NAME} WHERE username = :username`,
    { username }
  );
  const [row] = rows;
  return row ? mapRow(row) : null;
}

export async function updateUserById(id, values) {
  const pool = getPool();
  const updates = {};
  const fields = [];

  if (values.username !== undefined) {
    updates.username = values.username;
    fields.push('username = :username');
  }

  if (values.passwordHash !== undefined) {
    updates.passwordHash = values.passwordHash;
    fields.push('password_hash = :passwordHash');
  }

  if (fields.length === 0) {
    return findUserById(id);
  }

  updates.id = id;

  await pool.query(
    `UPDATE ${USER_TABLE_NAME} SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = :id`,
    updates
  );

  return findUserById(id);
}

export async function deleteUserById(id) {
  const pool = getPool();
  const [result] = await pool.query(`DELETE FROM ${USER_TABLE_NAME} WHERE id = :id`, { id });
  return result.affectedRows > 0;
}

export async function listUsers() {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT id, username, password_hash, created_at, updated_at FROM ${USER_TABLE_NAME} ORDER BY created_at DESC`
  );
  return rows.map(mapRow);
}
