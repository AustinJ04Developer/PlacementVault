import { Router } from 'express';
import { createReport } from '../controllers/reportController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { createReportSchema } from '../validators/schemas.js';

const router = Router();

router.post('/', requireAuth, validateBody(createReportSchema), createReport);

export default router;
