import { Router } from 'express';
import { updateComment, deleteComment } from '../controllers/commentController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.patch('/:id', requireAuth, updateComment);
router.delete('/:id', requireAuth, deleteComment);

export default router;
