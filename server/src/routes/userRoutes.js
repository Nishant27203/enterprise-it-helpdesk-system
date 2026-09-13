import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorizeMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import * as userController from '../controllers/userController.js';
import {
  createUserSchema,
  updateUserSchema,
  listUsersSchema,
} from '../validators/userValidators.js';

const router = Router();

router.use(authenticate);

router.get(
  '/technicians',
  authorize('IT_TECHNICIAN', 'IT_MANAGER', 'ADMIN'),
  asyncHandler(userController.technicians)
);

router.get(
  '/',
  authorize('ADMIN'),
  validate(listUsersSchema),
  asyncHandler(userController.list)
);
router.post(
  '/',
  authorize('ADMIN'),
  validate(createUserSchema),
  asyncHandler(userController.create)
);
router.get(
  '/:id',
  authorize('ADMIN'),
  asyncHandler(userController.getById)
);
router.patch(
  '/:id',
  authorize('ADMIN'),
  validate(updateUserSchema),
  asyncHandler(userController.update)
);

export default router;
