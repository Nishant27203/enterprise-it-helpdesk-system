import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import * as ticketController from '../controllers/ticketController.js';
import {
  createTicketSchema,
  listTicketsSchema,
  updateTicketSchema,
  assignTicketSchema,
  statusSchema,
  commentSchema,
  escalateSchema,
  resolveSchema,
  feedbackSchema,
} from '../validators/ticketValidators.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(createTicketSchema), asyncHandler(ticketController.create));
router.get('/', validate(listTicketsSchema), asyncHandler(ticketController.list));
router.get('/:id', asyncHandler(ticketController.getById));
router.patch('/:id', validate(updateTicketSchema), asyncHandler(ticketController.update));
router.post('/:id/accept', asyncHandler(ticketController.accept));
router.post('/:id/assign', validate(assignTicketSchema), asyncHandler(ticketController.assign));
router.post('/:id/status', validate(statusSchema), asyncHandler(ticketController.changeStatus));
router.post('/:id/comments', validate(commentSchema), asyncHandler(ticketController.addComment));
router.get('/:id/comments', asyncHandler(ticketController.getComments));
router.post('/:id/escalate', validate(escalateSchema), asyncHandler(ticketController.escalate));
router.post('/:id/resolve', validate(resolveSchema), asyncHandler(ticketController.resolve));
router.post('/:id/close', asyncHandler(ticketController.close));
router.post('/:id/feedback', validate(feedbackSchema), asyncHandler(ticketController.feedback));
router.get('/:id/history', asyncHandler(ticketController.history));

export default router;
