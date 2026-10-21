import { Router } from 'express';
import {
  getDrives,
  getDriveById,
  createDrive,
  updateDrive,
  deleteDrive,
} from '../controllers/driveController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { createDriveSchema, updateDriveSchema } from '../validators/schemas.js';

const router = Router();

router.get('/', getDrives);
router.get('/:id', getDriveById);

// Admin-only endpoints
router.post('/', requireAuth, requireRole('admin'), validateBody(createDriveSchema), createDrive);
router.patch('/:id', requireAuth, requireRole('admin'), validateBody(updateDriveSchema), updateDrive);
router.delete('/:id', requireAuth, requireRole('admin'), deleteDrive);

export default router;
