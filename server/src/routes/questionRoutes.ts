import { Router } from 'express';
import {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  toggleBookmark,
  exportQuestionDocx,
} from '../controllers/questionController.js';
import {
  getAnswersForQuestion,
  createAnswer,
} from '../controllers/answerController.js';
import {
  getComments,
  createComment,
} from '../controllers/commentController.js';
import { createReport } from '../controllers/reportController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import {
  createQuestionSchema,
  updateQuestionSchema,
  createAnswerSchema,
  createCommentSchema,
  createReportSchema,
} from '../validators/schemas.js';

const router = Router();

// Question listing & details
router.get('/', optionalAuth, getQuestions);
router.get('/:id', optionalAuth, getQuestionById);
router.get('/:id/export-docx', optionalAuth, exportQuestionDocx);
router.post('/', requireAuth, validateBody(createQuestionSchema), createQuestion);
router.patch('/:id', requireAuth, validateBody(updateQuestionSchema), updateQuestion);
router.delete('/:id', requireAuth, deleteQuestion);

// Bookmark toggle
router.post('/:id/bookmark', requireAuth, toggleBookmark);

// Report question directly
router.post('/:id/report', requireAuth, validateBody(createReportSchema), createReport);

// Nested Answers
router.get('/:questionId/answers', optionalAuth, getAnswersForQuestion);
router.post('/:questionId/answers', requireAuth, validateBody(createAnswerSchema), createAnswer);

// Nested Comments
router.get('/:questionId/comments', getComments);
router.post('/:questionId/comments', requireAuth, validateBody(createCommentSchema), createComment);

export default router;
