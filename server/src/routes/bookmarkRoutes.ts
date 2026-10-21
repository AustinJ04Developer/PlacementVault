import { Router } from 'express';
import { getBookmarks } from '../controllers/bookmarkController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, getBookmarks);

export default router;
