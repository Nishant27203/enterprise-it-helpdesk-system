import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorizeMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import * as categoryController from '../controllers/categoryController.js';
import { updateSlaSchema } from '../validators/slaValidators.js';

const router = Router();

router.get('/categories', authenticate, asyncHandler(categoryController.listCategories));
router.get('/departments', authenticate, asyncHandler(categoryController.listDepartments));
router.patch(
  '/categories/:id',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(categoryController.updateCategory)
);
router.get(
  '/sla-policies',
  authenticate,
  authorize('ADMIN'),
  asyncHandler(categoryController.listSlaPolicies)
);
router.patch(
  '/sla-policies/:id',
  authenticate,
  authorize('ADMIN'),
  validate(updateSlaSchema),
  asyncHandler(categoryController.updateSlaPolicy)
);

export default router;
