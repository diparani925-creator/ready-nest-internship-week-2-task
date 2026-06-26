import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';
import { mapId, mapIds } from '../utils/mapId';

export const getAttendanceLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const logs = await prisma.attendance.findMany({
      where: { studentId: req.user.id },
      orderBy: { date: 'desc' },
    });

    res.status(200).json(mapIds(logs));
  } catch (error: any) {
    console.error('getAttendanceLogs error:', error);
    res.status(500).json({ message: 'Error retrieving attendance logs', error: error.message });
  }
};

export const markAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { subject, status, date, note } = req.body;

    if (!subject || !status) {
      res.status(400).json({ message: 'Subject and status are required' });
      return;
    }

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    let record = await prisma.attendance.findFirst({
      where: {
        studentId: req.user.id,
        subject,
        date: {
          gte: targetDate,
          lt: nextDay,
        },
      },
    });

    if (record) {
      record = await prisma.attendance.update({
        where: { id: record.id },
        data: {
          status,
          note: note !== undefined ? note : record.note,
        },
      });
    } else {
      record = await prisma.attendance.create({
        data: {
          studentId: req.user.id,
          subject,
          status,
          date: targetDate,
          note: note || '',
        },
      });
    }

    res.status(200).json(mapId(record));
  } catch (error: any) {
    console.error('markAttendance error:', error);
    res.status(500).json({ message: 'Error marking attendance', error: error.message });
  }
};

export const getAttendanceStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const logs = await prisma.attendance.findMany({
      where: { studentId: req.user.id },
      orderBy: { date: 'desc' },
    });

    const subjectStats: { [subject: string]: { present: number; absent: number; cancelled: number } } = {};

    logs.forEach((log) => {
      if (!subjectStats[log.subject]) {
        subjectStats[log.subject] = { present: 0, absent: 0, cancelled: 0 };
      }
      if (log.status === 'present') subjectStats[log.subject].present++;
      else if (log.status === 'absent') subjectStats[log.subject].absent++;
      else if (log.status === 'cancelled') subjectStats[log.subject].cancelled++;
    });

    let totalAttended = 0;
    let totalClasses = 0;

    const summary = Object.keys(subjectStats).map((subject) => {
      const stats = subjectStats[subject];
      const activeClasses = stats.present + stats.absent;
      const percentage = activeClasses > 0 ? Math.round((stats.present / activeClasses) * 100) : 100;

      totalAttended += stats.present;
      totalClasses += activeClasses;

      return {
        subject,
        present: stats.present,
        absent: stats.absent,
        cancelled: stats.cancelled,
        total: activeClasses,
        percentage,
      };
    });

    const overallPercentage = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 100;

    const mappedLogs = mapIds(logs.slice(0, 50));

    res.status(200).json({
      overallPercentage,
      totalAttended,
      totalClasses,
      summary,
      logs: mappedLogs,
    });
  } catch (error: any) {
    console.error('getAttendanceStats error:', error);
    res.status(500).json({ message: 'Error compiling attendance statistics', error: error.message });
  }
};

export const deleteAttendanceLog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const log = await prisma.attendance.findFirst({
      where: { id, studentId: req.user.id },
    });

    if (!log) {
      res.status(404).json({ message: 'Attendance record not found or unauthorized' });
      return;
    }

    await prisma.attendance.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Attendance record deleted', id });
  } catch (error: any) {
    console.error('deleteAttendanceLog error:', error);
    res.status(500).json({ message: 'Error deleting attendance record', error: error.message });
  }
};
