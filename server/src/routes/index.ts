import { Router } from 'express';
import authRoutes from './authRoutes.js';
import companyRoutes from './companyRoutes.js';
import driveRoutes from './driveRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import questionRoutes from './questionRoutes.js';
import answerRoutes from './answerRoutes.js';
import commentRoutes from './commentRoutes.js';
import bookmarkRoutes from './bookmarkRoutes.js';
import reportRoutes from './reportRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/companies', companyRoutes);
router.use('/drives', driveRoutes);
router.use('/categories', categoryRoutes);
router.use('/questions', questionRoutes);
router.use('/answers', answerRoutes);
router.use('/comments', commentRoutes);
router.use('/bookmarks', bookmarkRoutes);
router.use('/reports', reportRoutes);
router.use('/admin', adminRoutes);

export default router;
