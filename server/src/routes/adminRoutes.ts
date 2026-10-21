import { Router } from 'express';
import {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getAuditLogs,
  exportCsv,
  exportDocx,
  detectDuplicates,
  toggleQuestionReviewed,
  toggleAnswerReviewed,
} from '../controllers/adminController.js';
import { getReports, resolveReport } from '../controllers/reportController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { resolveReportSchema } from '../validators/schemas.js';

const router = Router();

// All routes require authenticated Administrator role
router.use(requireAuth, requireRole('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);
router.get('/reports', getReports);
router.patch('/reports/:id', validateBody(resolveReportSchema), resolveReport);
router.get('/audit-logs', getAuditLogs);
router.get('/export/:entity', exportCsv);
router.get('/export-docx/:entity', exportDocx);
router.get('/duplicates', detectDuplicates);
router.patch('/questions/:id/review', toggleQuestionReviewed);
router.patch('/answers/:id/review', toggleAnswerReviewed);

export default router;
