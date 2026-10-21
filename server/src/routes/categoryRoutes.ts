import { Router } from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { createCategorySchema } from '../validators/schemas.js';

const router = Router();

router.get('/', getCategories);
router.post('/', requireAuth, requireRole('admin'), validateBody(createCategorySchema), createCategory);
router.patch('/:id', requireAuth, requireRole('admin'), updateCategory);
router.delete('/:id', requireAuth, requireRole('admin'), deleteCategory);

export default router;
