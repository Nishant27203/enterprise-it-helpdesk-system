import { Router } from 'express';
import authRoutes from './authRoutes.js';
import ticketRoutes from './ticketRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import knowledgeRoutes from './knowledgeRoutes.js';
import userRoutes from './userRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import categoryRoutes from './categoryRoutes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'Help Desk API is running' });
});

router.use('/auth', authRoutes);
router.use('/tickets', ticketRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/knowledge-base', knowledgeRoutes);
router.use('/users', userRoutes);
router.use('/notifications', notificationRoutes);
router.use('/', categoryRoutes);

export default router;
