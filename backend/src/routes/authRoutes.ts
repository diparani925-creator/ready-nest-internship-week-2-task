import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController';
import { authenticateJWT } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validationMiddleware';
import { registerSchema, loginSchema } from '../validation/schemas';

const router = Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.get('/me', authenticateJWT as any, getMe as any);

export default router;
