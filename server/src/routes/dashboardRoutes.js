import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorizeMiddleware.js';
import * as dashboardController from '../controllers/dashboardController.js';

const router = Router();

router.use(authenticate);
router.use(authorize('IT_MANAGER', 'ADMIN'));

router.get('/stats', asyncHandler(dashboardController.stats));
router.get('/charts/status', asyncHandler(dashboardController.chartStatus));
router.get('/charts/priority', asyncHandler(dashboardController.chartPriority));
router.get('/charts/category', asyncHandler(dashboardController.chartCategory));
router.get('/charts/department', asyncHandler(dashboardController.chartDepartment));
router.get('/charts/technician', asyncHandler(dashboardController.chartTechnician));
router.get('/reports', asyncHandler(dashboardController.reports));

export default router;
