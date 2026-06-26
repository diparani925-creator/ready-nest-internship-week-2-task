import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';
import { mapId, mapIds } from '../utils/mapId';

export const getNotes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const notes = await prisma.note.findMany({
      where: { studentId: req.user.id },
      orderBy: { updatedAt: 'desc' },
    });

    res.status(200).json(mapIds(notes));
  } catch (error: any) {
    console.error('getNotes error:', error);
    res.status(500).json({ message: 'Error retrieving notes', error: error.message });
  }
};

export const createNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { title, content, tags, color } = req.body;

    if (!title) {
      res.status(400).json({ message: 'Note title is required' });
      return;
    }

    const newNote = await prisma.note.create({
      data: {
        studentId: req.user.id,
        title,
        content: content || '',
        tags: tags || [],
        color: color || '#fef08a',
      },
    });

    res.status(201).json(mapId(newNote));
  } catch (error: any) {
    console.error('createNote error:', error);
    res.status(500).json({ message: 'Error creating note', error: error.message });
  }
};

export const updateNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { title, content, tags, color } = req.body;

    const note = await prisma.note.findFirst({
      where: { id, studentId: req.user.id },
    });

    if (!note) {
      res.status(404).json({ message: 'Note not found or unauthorized' });
      return;
    }

    const updated = await prisma.note.update({
      where: { id },
      data: {
        title: title !== undefined ? title : note.title,
        content: content !== undefined ? content : note.content,
        tags: tags !== undefined ? tags : note.tags,
        color: color !== undefined ? color : note.color,
      },
    });

    res.status(200).json(mapId(updated));
  } catch (error: any) {
    console.error('updateNote error:', error);
    res.status(500).json({ message: 'Error updating note', error: error.message });
  }
};

export const deleteNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const note = await prisma.note.findFirst({
      where: { id, studentId: req.user.id },
    });

    if (!note) {
      res.status(404).json({ message: 'Note not found or unauthorized' });
      return;
    }

    await prisma.note.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Note deleted successfully', id });
  } catch (error: any) {
    console.error('deleteNote error:', error);
    res.status(500).json({ message: 'Error deleting note', error: error.message });
  }
};
