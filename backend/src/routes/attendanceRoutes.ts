import { Router } from 'express';
import { getAttendanceLogs, getAttendanceStats, markAttendance, deleteAttendanceLog } from '../controllers/attendanceController';
import { authenticateJWT } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validationMiddleware';
import { attendanceSchema } from '../validation/schemas';

const router = Router();

router.use(authenticateJWT as any);

router.get('/logs', getAttendanceLogs as any);
router.get('/stats', getAttendanceStats as any);
router.post('/', validateBody(attendanceSchema), markAttendance as any);
router.delete('/:id', deleteAttendanceLog as any);

export default router;
