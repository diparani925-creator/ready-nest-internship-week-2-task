import { Router } from 'express';
import { getTasks, createTask, updateTask, toggleTaskComplete, deleteTask } from '../controllers/taskController';
import { authenticateJWT } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validationMiddleware';
import { taskSchema } from '../validation/schemas';

const router = Router();

router.use(authenticateJWT as any);

router.get('/', getTasks as any);
router.post('/', validateBody(taskSchema), createTask as any);
router.put('/:id', validateBody(taskSchema), updateTask as any);
router.patch('/:id/toggle', toggleTaskComplete as any);
router.delete('/:id', deleteTask as any);

export default router;
