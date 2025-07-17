import { Router } from 'express';
import interviewRoutes from './interview.js';
import healthRoutes from './health.js';

const router = Router();

// Health check routes
router.use('/health', healthRoutes);

// Interview API routes
router.use('/api/interview', interviewRoutes);

export default router; 