import { Router } from 'express';
import { updateAnswer, deleteAnswer, toggleVote } from '../controllers/answerController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { updateAnswerSchema } from '../validators/schemas.js';

const router = Router();

router.patch('/:id', requireAuth, validateBody(updateAnswerSchema), updateAnswer);
router.delete('/:id', requireAuth, deleteAnswer);
router.post('/:id/vote', requireAuth, toggleVote);

export default router;
