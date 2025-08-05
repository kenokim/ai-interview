import { Router } from 'express';
import interviewRoutes from './interview.js';
import voiceRouter from './voice.js';
const router = Router();
// Interview API routes
router.use('/api/interview', interviewRoutes);
// Voice API routes
router.use('/api/voice', voiceRouter);
export default router;
//# sourceMappingURL=index.js.map