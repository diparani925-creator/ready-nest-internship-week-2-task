import { Router } from 'express';
import { getNotices, getNoticeById, createNotice, deleteNotice } from '../controllers/noticeController';
import { authenticateJWT, requireAdmin } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validationMiddleware';
import { noticeSchema } from '../validation/schemas';

const router = Router();

router.use(authenticateJWT as any);

router.get('/', getNotices as any);
router.get('/:id', getNoticeById as any);
router.post('/', requireAdmin as any, validateBody(noticeSchema), createNotice as any);
router.delete('/:id', requireAdmin as any, deleteNotice as any);

export default router;
