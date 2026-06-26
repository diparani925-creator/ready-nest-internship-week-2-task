import { Router } from 'express';
import { updateProfile, changePassword } from '../controllers/userController';
import { authenticateJWT } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validationMiddleware';
import { profileSchema } from '../validation/schemas';

const router = Router();

router.use(authenticateJWT as any);

router.put('/profile', validateBody(profileSchema), updateProfile as any);
router.put('/password', changePassword as any);

export default router;
