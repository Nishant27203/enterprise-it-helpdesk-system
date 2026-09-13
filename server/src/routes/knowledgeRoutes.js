import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorizeMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import * as knowledgeController from '../controllers/knowledgeController.js';
import {
  createArticleSchema,
  updateArticleSchema,
  listArticlesSchema,
} from '../validators/knowledgeValidators.js';

const router = Router();

router.use(authenticate);

router.get('/', validate(listArticlesSchema), asyncHandler(knowledgeController.list));
router.get('/:id', asyncHandler(knowledgeController.getById));
router.post(
  '/',
  authorize('IT_TECHNICIAN', 'IT_MANAGER', 'ADMIN'),
  validate(createArticleSchema),
  asyncHandler(knowledgeController.create)
);
router.patch(
  '/:id',
  authorize('IT_TECHNICIAN', 'IT_MANAGER', 'ADMIN'),
  validate(updateArticleSchema),
  asyncHandler(knowledgeController.update)
);
router.delete(
  '/:id',
  authorize('ADMIN'),
  asyncHandler(knowledgeController.remove)
);

export default router;
