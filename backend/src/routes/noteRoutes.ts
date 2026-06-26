import { Router } from 'express';
import { getNotes, createNote, updateNote, deleteNote } from '../controllers/noteController';
import { authenticateJWT } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validationMiddleware';
import { noteSchema } from '../validation/schemas';

const router = Router();

router.use(authenticateJWT as any);

router.get('/', getNotes as any);
router.post('/', validateBody(noteSchema), createNote as any);
router.put('/:id', validateBody(noteSchema), updateNote as any);
router.delete('/:id', deleteNote as any);

export default router;
