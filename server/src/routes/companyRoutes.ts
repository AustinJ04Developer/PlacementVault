import { Router } from 'express';
import {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
} from '../controllers/companyController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { createCompanySchema, updateCompanySchema } from '../validators/schemas.js';

const router = Router();

router.get('/', getCompanies);
router.get('/:id', getCompanyById);

// Admin-only endpoints
router.post('/', requireAuth, requireRole('admin'), validateBody(createCompanySchema), createCompany);
router.patch('/:id', requireAuth, requireRole('admin'), validateBody(updateCompanySchema), updateCompany);
router.delete('/:id', requireAuth, requireRole('admin'), deleteCompany);

export default router;
