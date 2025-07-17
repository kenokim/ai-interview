import { Request, Response, NextFunction } from 'express';
import { StartInterviewRequest, SendMessageRequest } from '../types/api.js';

// Input validation constants
const VALID_EXPERIENCE_LEVELS = ['junior', 'mid-level', 'senior', 'lead'];
const VALID_INTERVIEW_TYPES = ['technical', 'behavioral', 'mixed'];
const MAX_MESSAGE_LENGTH = 5000;
const MAX_RESUME_LENGTH = 10000;
const MAX_JOB_DESCRIPTION_LENGTH = 10000;

// Validation functions
function validateStartInterviewInput(body: any): string[] {
  const { jobRole, experience, interviewType, resume, jobDescription, userName } = body;
  
  const errors: string[] = [];
  
  if (!jobRole || typeof jobRole !== 'string' || jobRole.trim().length === 0) {
    errors.push('jobRole is required and must be a non-empty string');
  }
  
  if (!experience || !VALID_EXPERIENCE_LEVELS.includes(experience)) {
    errors.push(`experience must be one of: ${VALID_EXPERIENCE_LEVELS.join(', ')}`);
  }
  
  if (!interviewType || !VALID_INTERVIEW_TYPES.includes(interviewType)) {
    errors.push(`interviewType must be one of: ${VALID_INTERVIEW_TYPES.join(', ')}`);
  }
  
  if (resume && (typeof resume !== 'string' || resume.length > MAX_RESUME_LENGTH)) {
    errors.push(`resume must be a string with max length ${MAX_RESUME_LENGTH}`);
  }
  
  if (jobDescription && (typeof jobDescription !== 'string' || jobDescription.length > MAX_JOB_DESCRIPTION_LENGTH)) {
    errors.push(`jobDescription must be a string with max length ${MAX_JOB_DESCRIPTION_LENGTH}`);
  }
  
  if (userName && (typeof userName !== 'string' || userName.trim().length === 0)) {
    errors.push('userName must be a non-empty string if provided');
  }
  
  return errors;
}

function validateMessageInput(body: any): string[] {
  const { sessionId, message } = body;
  
  const errors: string[] = [];
  
  if (!sessionId || typeof sessionId !== 'string' || sessionId.trim().length === 0) {
    errors.push('sessionId is required and must be a non-empty string');
  }
  
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    errors.push('message is required and must be a non-empty string');
  }
  
  if (message && message.length > MAX_MESSAGE_LENGTH) {
    errors.push(`message must be less than ${MAX_MESSAGE_LENGTH} characters`);
  }
  
  return errors;
}

function validateSessionIdInput(body: any): string[] {
  const { sessionId } = body;
  
  const errors: string[] = [];
  
  if (!sessionId || typeof sessionId !== 'string' || sessionId.trim().length === 0) {
    errors.push('sessionId is required and must be a non-empty string');
  }
  
  return errors;
}

// Middleware functions
export const validateStartInterview = (req: Request, res: Response, next: NextFunction) => {
  const validationErrors = validateStartInterviewInput(req.body);
  
  if (validationErrors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: validationErrors,
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

export const validateMessage = (req: Request, res: Response, next: NextFunction) => {
  const validationErrors = validateMessageInput(req.body);
  
  if (validationErrors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: validationErrors,
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};

export const validateSessionId = (req: Request, res: Response, next: NextFunction) => {
  const validationErrors = validateSessionIdInput(req.body);
  
  if (validationErrors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: validationErrors,
      timestamp: new Date().toISOString()
    });
  }
  
  next();
}; 