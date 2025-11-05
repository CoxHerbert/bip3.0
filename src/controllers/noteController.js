import {
  findAllNotes,
  createNote as createNoteRecord,
  findNoteById,
  updateNoteById,
  deleteNoteById
} from '../models/note.js';

function parseId(param) {
  const id = Number.parseInt(param, 10);
  if (Number.isNaN(id)) {
    const error = new Error('Invalid note identifier');
    error.status = 400;
    throw error;
  }
  return id;
}

export async function listNotes(_req, res, next) {
  try {
    const notes = await findAllNotes();
    res.json(notes);
  } catch (error) {
    next(error);
  }
}

export async function createNote(req, res, next) {
  try {
    const { title, content } = req.body ?? {};
    if (!title || !content) {
      return res.status(400).json({ message: 'Both title and content are required.' });
    }

    const note = await createNoteRecord({ title, content });
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
}

export async function getNote(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const note = await findNoteById(id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    next(error);
  }
}

export async function updateNote(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const { title, content } = req.body ?? {};

    if (title === undefined && content === undefined) {
      return res.status(400).json({ message: 'Provide at least one field to update.' });
    }

    const note = await updateNoteById(id, { title, content });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    next(error);
  }
}

export async function deleteNote(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const deleted = await deleteNoteById(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}