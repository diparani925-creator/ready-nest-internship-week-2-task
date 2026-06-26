import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';
import { mapId, mapIds } from '../utils/mapId';

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const tasks = await prisma.task.findMany({
      where: { studentId: req.user.id },
      orderBy: { dueDate: 'asc' },
    });

    res.status(200).json(mapIds(tasks));
  } catch (error: any) {
    console.error('getTasks error:', error);
    res.status(500).json({ message: 'Error retrieving tasks', error: error.message });
  }
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { title, description, dueDate, completed, priority, attachments } = req.body;

    if (!title || !dueDate) {
      res.status(400).json({ message: 'Task title and due date are required' });
      return;
    }

    const newTask = await prisma.task.create({
      data: {
        studentId: req.user.id,
        title,
        description: description || '',
        dueDate: new Date(dueDate),
        completed: completed || false,
        priority: priority || 'medium',
        attachments: attachments || [],
      },
    });

    res.status(201).json(mapId(newTask));
  } catch (error: any) {
    console.error('createTask error:', error);
    res.status(500).json({ message: 'Error creating task', error: error.message });
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { title, description, dueDate, completed, priority, attachments } = req.body;

    const task = await prisma.task.findFirst({
      where: { id, studentId: req.user.id },
    });

    if (!task) {
      res.status(404).json({ message: 'Task not found or unauthorized' });
      return;
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        title: title !== undefined ? title : task.title,
        description: description !== undefined ? description : task.description,
        dueDate: dueDate !== undefined ? new Date(dueDate) : task.dueDate,
        completed: completed !== undefined ? completed : task.completed,
        priority: priority !== undefined ? priority : task.priority,
        attachments: attachments !== undefined ? attachments : task.attachments,
      },
    });

    res.status(200).json(mapId(updated));
  } catch (error: any) {
    console.error('updateTask error:', error);
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
};

export const toggleTaskComplete = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const task = await prisma.task.findFirst({
      where: { id, studentId: req.user.id },
    });

    if (!task) {
      res.status(404).json({ message: 'Task not found or unauthorized' });
      return;
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        completed: !task.completed,
      },
    });

    res.status(200).json(mapId(updated));
  } catch (error: any) {
    console.error('toggleTaskComplete error:', error);
    res.status(500).json({ message: 'Error toggling task status', error: error.message });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const task = await prisma.task.findFirst({
      where: { id, studentId: req.user.id },
    });

    if (!task) {
      res.status(404).json({ message: 'Task not found or unauthorized' });
      return;
    }

    await prisma.task.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Task deleted successfully', id });
  } catch (error: any) {
    console.error('deleteTask error:', error);
    res.status(500).json({ message: 'Error deleting task', error: error.message });
  }
};
