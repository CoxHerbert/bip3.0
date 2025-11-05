import { getPool } from '../config/database.js';

function mapRow(row) {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function findAllNotes() {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT id, title, content, created_at, updated_at FROM notes ORDER BY created_at DESC'
  );
  return rows.map(mapRow);
}

export async function createNote(values) {
  const pool = getPool();
  const { title, content } = values;
  const [result] = await pool.query(
    'INSERT INTO notes (title, content) VALUES (:title, :content)',
    { title, content }
  );
  return findNoteById(result.insertId);
}

export async function findNoteById(id) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT id, title, content, created_at, updated_at FROM notes WHERE id = :id',
    { id }
  );
  const [row] = rows;
  return row ? mapRow(row) : null;
}

export async function updateNoteById(id, values) {
  const pool = getPool();
  const updates = {};
  const fields = [];

  if (values.title !== undefined) {
    updates.title = values.title;
    fields.push('title = :title');
  }

  if (values.content !== undefined) {
    updates.content = values.content;
    fields.push('content = :content');
  }

  if (fields.length === 0) {
    return findNoteById(id);
  }

  updates.id = id;

  await pool.query(
    `UPDATE notes SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = :id`,
    updates
  );

  return findNoteById(id);
}

export async function deleteNoteById(id) {
  const pool = getPool();
  const [result] = await pool.query('DELETE FROM notes WHERE id = :id', { id });
  return result.affectedRows > 0;
}