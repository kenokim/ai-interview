import { Router } from 'express';
import interviewRoutes from './interview.js';

const router = Router();

// Interview API routes
router.use('/api/interview', interviewRoutes);

export default router; 