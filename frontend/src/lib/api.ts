import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inject Authorization token from localStorage on every request
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response error handler: auto logout on 401/403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (typeof window !== 'undefined') {
        const isAuthRoute = window.location.pathname.includes('/login') || window.location.pathname.includes('/register');
        if (!isAuthRoute) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login?expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Model interfaces
export interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  avatar: string;
  createdAt?: string;
}

export interface TimetableItem {
  _id: string;
  studentId: string;
  subject: string;
  room: string;
  teacher: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  color: string;
  createdAt?: string;
}

export interface Attachment {
  name: string;
  content: string; // base64
}

export interface TaskItem {
  _id: string;
  studentId: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  attachments: Attachment[];
  createdAt?: string;
}

export interface AttendanceLog {
  _id: string;
  studentId: string;
  subject: string;
  status: 'present' | 'absent' | 'cancelled';
  date: string;
  note: string;
  createdAt?: string;
}

export interface SubjectStats {
  subject: string;
  present: number;
  absent: number;
  cancelled: number;
  total: number;
  percentage: number;
}

export interface AttendanceStats {
  overallPercentage: number;
  totalAttended: number;
  totalClasses: number;
  summary: SubjectStats[];
  logs: AttendanceLog[];
}

export interface NoticeItem {
  _id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  targetDepartment: string;
  pinned: boolean;
  createdAt: string;
}

export interface NoteItem {
  _id: string;
  studentId: string;
  title: string;
  content: string;
  tags: string[];
  color: string;
  createdAt?: string;
  updatedAt?: string;
}
