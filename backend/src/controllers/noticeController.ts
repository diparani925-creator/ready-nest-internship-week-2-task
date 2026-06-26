import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';
import { mapId, mapIds } from '../utils/mapId';

export const getNotices = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notices = await prisma.notice.findMany({
      orderBy: [
        { pinned: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    res.status(200).json(mapIds(notices));
  } catch (error: any) {
    console.error('getNotices error:', error);
    res.status(500).json({ message: 'Error retrieving notices', error: error.message });
  }
};

export const getNoticeById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const notice = await prisma.notice.findUnique({
      where: { id },
    });

    if (!notice) {
      res.status(404).json({ message: 'Notice not found' });
      return;
    }

    res.status(200).json(mapId(notice));
  } catch (error: any) {
    console.error('getNoticeById error:', error);
    res.status(500).json({ message: 'Error loading notice details', error: error.message });
  }
};

export const createNotice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { title, content, targetDepartment, pinned } = req.body;

    if (!title || !content) {
      res.status(400).json({ message: 'Notice title and content are required' });
      return;
    }

    const author = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!author) {
      res.status(404).json({ message: 'Author user details not found' });
      return;
    }

    const newNotice = await prisma.notice.create({
      data: {
        authorId: req.user.id,
        authorName: author.name,
        title,
        content,
        targetDepartment: targetDepartment || 'All',
        pinned: pinned || false,
      },
    });

    res.status(201).json(mapId(newNotice));
  } catch (error: any) {
    console.error('createNotice error:', error);
    res.status(500).json({ message: 'Error creating notice', error: error.message });
  }
};

export const deleteNotice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const notice = await prisma.notice.findUnique({
      where: { id },
    });

    if (!notice) {
      res.status(404).json({ message: 'Notice not found' });
      return;
    }

    await prisma.notice.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Notice deleted successfully', id });
  } catch (error: any) {
    console.error('deleteNotice error:', error);
    res.status(500).json({ message: 'Error deleting notice', error: error.message });
  }
};
