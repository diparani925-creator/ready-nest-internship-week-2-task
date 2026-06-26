import { Router } from 'express';
import { getSchedules, createSchedule, updateSchedule, deleteSchedule } from '../controllers/timetableController';
import { authenticateJWT } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validationMiddleware';
import { timetableSchema } from '../validation/schemas';

const router = Router();

router.use(authenticateJWT as any);

router.get('/', getSchedules as any);
router.post('/', validateBody(timetableSchema), createSchedule as any);
router.put('/:id', validateBody(timetableSchema), updateSchedule as any);
router.delete('/:id', deleteSchedule as any);

export default router;
