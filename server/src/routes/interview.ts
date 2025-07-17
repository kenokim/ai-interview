import { Router, Request, Response } from 'express';
import { interviewService } from '../services/InterviewService.js';
import { validateStartInterview, validateMessage, validateSessionId } from '../middleware/validation.js';
import { asyncHandler, createError } from '../middleware/errorHandler.js';
import { 
  StartInterviewRequest, 
  SendMessageRequest, 
  EndInterviewRequest,
  ApiResponse 
} from '../types/api.js';

const router = Router();

/**
 * @swagger
 * /api/interview/start:
 *   post:
 *     summary: Start a new interview session
 *     tags: [Interview]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StartInterviewRequest'
 *     responses:
 *       200:
 *         description: Successfully started interview
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/start', validateStartInterview, asyncHandler(async (req: Request, res: Response) => {
  const request: StartInterviewRequest = req.body;
  const result = await interviewService.startInterview(request);
  
  const response: ApiResponse = {
    success: true,
    data: result
  };
  
  res.json(response);
}));

/**
 * @swagger
 * /api/interview/message:
 *   post:
 *     summary: Process user input and get AI response
 *     tags: [Interview]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendMessageRequest'
 *     responses:
 *       200:
 *         description: Successfully processed message
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/message', validateMessage, asyncHandler(async (req: Request, res: Response) => {
  const request: SendMessageRequest = req.body;
  const result = await interviewService.sendMessage(request);
  
  const response: ApiResponse = {
    success: true,
    data: result
  };
  
  res.json(response);
}));

/**
 * @swagger
 * /api/interview/status/{sessionId}:
 *   get:
 *     summary: Get interview session status
 *     tags: [Interview]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         schema:
 *           type: string
 *         required: true
 *         description: The session ID
 *     responses:
 *       200:
 *         description: Successfully retrieved session status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/status/:sessionId', asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  
  if (!sessionId) {
    throw createError('sessionId is required', 400);
  }
  
  const result = interviewService.getSessionStatus(sessionId);
  
  const response: ApiResponse = {
    success: true,
    data: result
  };
  
  res.json(response);
}));

/**
 * @swagger
 * /api/interview/end:
 *   post:
 *     summary: End interview session
 *     tags: [Interview]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EndInterviewRequest'
 *     responses:
 *       200:
 *         description: Successfully ended interview
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/end', validateSessionId, asyncHandler(async (req: Request, res: Response) => {
  const { sessionId }: EndInterviewRequest = req.body;
  const result = interviewService.endInterview(sessionId);
  
  const response: ApiResponse = {
    success: true,
    data: result
  };
  
  res.json(response);
}));

/**
 * @swagger
 * /api/interview/sessions:
 *   get:
 *     summary: Get all active sessions (for debugging)
 *     tags: [Interview]
 *     responses:
 *       200:
 *         description: Successfully retrieved all sessions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/sessions', asyncHandler(async (req: Request, res: Response) => {
  const result = interviewService.getAllSessions();
  
  const response: ApiResponse = {
    success: true,
    data: result
  };
  
  res.json(response);
}));

export default router; 