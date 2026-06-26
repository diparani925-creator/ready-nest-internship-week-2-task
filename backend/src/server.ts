import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';

// Import routes
import authRoutes from './routes/authRoutes';
import timetableRoutes from './routes/timetableRoutes';
import taskRoutes from './routes/taskRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import noticeRoutes from './routes/noticeRoutes';
import noteRoutes from './routes/noteRoutes';
import userRoutes from './routes/userRoutes';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Connect Database
connectDB();

// Middlewares
app.use(cors({
  origin: '*', // For development, allow any origin. In production this should be configured.
  credentials: true,
}));
app.use(express.json({ limit: '10mb' })); // Support base64 attachments

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Smart Campus API is running smoothly' });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/users', userRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    message: 'Internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.listen(port, () => {
  console.log(`Smart Campus Server listening on port ${port}`);
});
