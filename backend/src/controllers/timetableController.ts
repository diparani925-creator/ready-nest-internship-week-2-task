import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';
import { mapId, mapIds } from '../utils/mapId';

export const getSchedules = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const schedules = await prisma.timetable.findMany({
      where: { studentId: req.user.id },
      orderBy: { startTime: 'asc' },
    });

    res.status(200).json(mapIds(schedules));
  } catch (error: any) {
    console.error('getSchedules error:', error);
    res.status(500).json({ message: 'Error retrieving schedules', error: error.message });
  }
};

export const createSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { subject, room, teacher, dayOfWeek, startTime, endTime, color } = req.body;

    if (!subject || !dayOfWeek || !startTime || !endTime) {
      res.status(400).json({ message: 'Subject, day of week, start time, and end time are required' });
      return;
    }

    const newSchedule = await prisma.timetable.create({
      data: {
        studentId: req.user.id,
        subject,
        room: room || '',
        teacher: teacher || '',
        dayOfWeek,
        startTime,
        endTime,
        color: color || '#0d9488',
      },
    });

    res.status(201).json(mapId(newSchedule));
  } catch (error: any) {
    console.error('createSchedule error:', error);
    res.status(500).json({ message: 'Error creating schedule', error: error.message });
  }
};

export const updateSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { subject, room, teacher, dayOfWeek, startTime, endTime, color } = req.body;

    const schedule = await prisma.timetable.findFirst({
      where: { id, studentId: req.user.id },
    });

    if (!schedule) {
      res.status(404).json({ message: 'Schedule entry not found or unauthorized' });
      return;
    }

    const updated = await prisma.timetable.update({
      where: { id },
      data: {
        subject: subject !== undefined ? subject : schedule.subject,
        room: room !== undefined ? room : schedule.room,
        teacher: teacher !== undefined ? teacher : schedule.teacher,
        dayOfWeek: dayOfWeek !== undefined ? dayOfWeek : schedule.dayOfWeek,
        startTime: startTime !== undefined ? startTime : schedule.startTime,
        endTime: endTime !== undefined ? endTime : schedule.endTime,
        color: color !== undefined ? color : schedule.color,
      },
    });

    res.status(200).json(mapId(updated));
  } catch (error: any) {
    console.error('updateSchedule error:', error);
    res.status(500).json({ message: 'Error updating schedule', error: error.message });
  }
};

export const deleteSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const schedule = await prisma.timetable.findFirst({
      where: { id, studentId: req.user.id },
    });

    if (!schedule) {
      res.status(404).json({ message: 'Schedule entry not found or unauthorized' });
      return;
    }

    await prisma.timetable.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Schedule deleted successfully', id });
  } catch (error: any) {
    console.error('deleteSchedule error:', error);
    res.status(500).json({ message: 'Error deleting schedule', error: error.message });
  }
};
