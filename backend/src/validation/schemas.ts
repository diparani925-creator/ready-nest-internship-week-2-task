import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'admin']).optional().default('student'),
  avatar: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const timetableSchema = z.object({
  subject: z.string().min(1, 'Subject name is required'),
  room: z.string().optional().default(''),
  teacher: z.string().optional().default(''),
  dayOfWeek: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format'),
  color: z.string().optional().default('#0d9488'),
});

export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().default(''),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid due date format',
  }),
  completed: z.boolean().optional().default(false),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  attachments: z.array(z.object({
    name: z.string(),
    content: z.string(),
  })).optional(),
});

export const attendanceSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  status: z.enum(['present', 'absent', 'cancelled']),
  date: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  note: z.string().optional().default(''),
});

export const noticeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  targetDepartment: z.string().optional().default('All'),
  pinned: z.boolean().optional().default(false),
});

export const noteSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().optional().default(''),
  tags: z.array(z.string()).optional().default([]),
  color: z.string().optional().default('#fef08a'),
});

export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'New password must be at least 6 characters').optional(),
  avatar: z.string().optional(),
});
