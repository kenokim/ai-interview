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

// Start a new interview session
router.post('/start', validateStartInterview, asyncHandler(async (req: Request, res: Response) => {
  const request: StartInterviewRequest = req.body;
  const result = await interviewService.startInterview(request);
  
  const response: ApiResponse = {
    success: true,
    data: result
  };
  
  res.json(response);
}));

// Process user input and get AI response
router.post('/message', validateMessage, asyncHandler(async (req: Request, res: Response) => {
  const request: SendMessageRequest = req.body;
  const result = await interviewService.sendMessage(request);
  
  const response: ApiResponse = {
    success: true,
    data: result
  };
  
  res.json(response);
}));

// Get interview session status
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

// End interview session
router.post('/end', validateSessionId, asyncHandler(async (req: Request, res: Response) => {
  const { sessionId }: EndInterviewRequest = req.body;
  const result = interviewService.endInterview(sessionId);
  
  const response: ApiResponse = {
    success: true,
    data: result
  };
  
  res.json(response);
}));

// Get all active sessions (for debugging)
router.get('/sessions', asyncHandler(async (req: Request, res: Response) => {
  const result = interviewService.getAllSessions();
  
  const response: ApiResponse = {
    success: true,
    data: result
  };
  
  res.json(response);
}));

export default router; 