import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createInterviewGraph, startInterview, processUserInput } from './graph/interviewer.js';
import { InterviewStateType } from './types/state.js';

// Input validation schemas
const VALID_EXPERIENCE_LEVELS = ['junior', 'mid-level', 'senior', 'lead'];
const VALID_INTERVIEW_TYPES = ['technical', 'behavioral', 'mixed'];
const MAX_MESSAGE_LENGTH = 5000;
const MAX_RESUME_LENGTH = 10000;
const MAX_JOB_DESCRIPTION_LENGTH = 10000;

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.GOOGLE_API_KEY) {
  console.error("❌ Error: GOOGLE_API_KEY is required in .env file");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Input validation functions
function validateStartInterviewInput(body: any) {
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

function validateMessageInput(body: any) {
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

// In-memory storage for interview sessions (in production, use Redis or database)
const interviewSessions = new Map<string, InterviewStateType>();
const interviewGraphs = new Map<string, any>();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start a new interview session
app.post('/api/interview/start', async (req, res) => {
  try {
    // Validate input
    const validationErrors = validateStartInterviewInput(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationErrors
      });
    }

    const { 
      jobRole, 
      experience, 
      interviewType, 
      resume, 
      jobDescription,
      userName 
    } = req.body;

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create interview graph
    const graph = createInterviewGraph();
    interviewGraphs.set(sessionId, graph);
    
    // Start the interview with user context
    const initialState = {
      user_context: {
        user_id: sessionId,
        profile: {
          name: userName || "Anonymous",
          experience_level: experience,
          tech_stack: [jobRole],
          preferred_language: "JavaScript"
        }
      }
    };
    
    const state = await startInterview(graph, initialState);
    interviewSessions.set(sessionId, state);
    
    // Get the initial AI message
    const lastMessage = state.messages[state.messages.length - 1];
    
    res.json({
      success: true,
      sessionId,
      message: lastMessage.content,
      stage: state.task.interview_stage,
      turnCount: state.evaluation.turn_count,
      userContext: {
        jobRole,
        experience,
        interviewType,
        resume: resume || null,
        jobDescription: jobDescription || null,
        userName: userName || null
      }
    });
    
  } catch (error) {
    console.error('Error starting interview:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({
      success: false,
      error: 'Failed to start interview session',
      timestamp: new Date().toISOString()
    });
  }
});

// Process user input and get AI response
app.post('/api/interview/message', async (req, res) => {
  try {
    // Validate input
    const validationErrors = validateMessageInput(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationErrors
      });
    }

    const { sessionId, message } = req.body;
    
    // Get session data
    const currentState = interviewSessions.get(sessionId);
    const graph = interviewGraphs.get(sessionId);
    
    if (!currentState || !graph) {
      return res.status(404).json({
        success: false,
        error: 'Interview session not found'
      });
    }
    
    // Process user input
    const updatedState = await processUserInput(graph, currentState, message);
    interviewSessions.set(sessionId, updatedState);
    
    // Get AI response
    const aiResponse = updatedState.messages[updatedState.messages.length - 1];
    
    res.json({
      success: true,
      message: aiResponse.content,
      stage: updatedState.task.interview_stage,
      turnCount: updatedState.evaluation.turn_count,
      messageCount: updatedState.messages.length,
      currentQuestion: updatedState.task.current_question,
      questionsAsked: updatedState.task.questions_asked.length,
      lastEvaluation: updatedState.evaluation.last_evaluation ? {
        score: updatedState.evaluation.last_evaluation.overall_score,
        evaluations: updatedState.evaluation.last_evaluation.evaluations,
        is_sufficient: updatedState.evaluation.last_evaluation.is_sufficient
      } : null,
      interviewProgress: {
        stage: updatedState.task.interview_stage,
        totalQuestions: updatedState.task.question_pool.length,
        questionsAsked: updatedState.task.questions_asked.length,
        isComplete: updatedState.task.interview_stage === "Finished"
      }
    });
    
  } catch (error) {
    console.error('Error processing message:', {
      sessionId: req.body.sessionId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({
      success: false,
      error: 'Failed to process message',
      timestamp: new Date().toISOString()
    });
  }
});

// Get interview session status
app.get('/api/interview/status/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const state = interviewSessions.get(sessionId);
    
    if (!state) {
      return res.status(404).json({
        success: false,
        error: 'Interview session not found'
      });
    }
    
    res.json({
      success: true,
      stage: state.task.interview_stage,
      turnCount: state.evaluation.turn_count,
      messageCount: state.messages.length,
      lastEvaluation: state.evaluation.last_evaluation ? {
        score: state.evaluation.last_evaluation.overall_score,
        evaluations: state.evaluation.last_evaluation.evaluations,
        is_sufficient: state.evaluation.last_evaluation.is_sufficient
      } : null
    });
    
  } catch (error) {
    console.error('Error getting session status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get session status'
    });
  }
});

// End interview session
app.post('/api/interview/end', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'sessionId is required'
      });
    }
    
    const state = interviewSessions.get(sessionId);
    if (!state) {
      return res.status(404).json({
        success: false,
        error: 'Interview session not found'
      });
    }
    
    // Clean up session data
    interviewSessions.delete(sessionId);
    interviewGraphs.delete(sessionId);
    
    res.json({
      success: true,
      message: 'Interview session ended successfully',
      sessionSummary: {
        sessionId,
        totalTurns: state.evaluation.turn_count,
        totalMessages: state.messages.length,
        questionsAsked: state.task.questions_asked.length,
        stage: state.task.interview_stage,
        duration: Date.now() - parseInt(sessionId.split('_')[1]) // Approximate duration in ms
      },
      finalEvaluation: state.evaluation.last_evaluation ? {
        score: state.evaluation.last_evaluation.overall_score,
        evaluations: state.evaluation.last_evaluation.evaluations,
        is_sufficient: state.evaluation.last_evaluation.is_sufficient
      } : null,
      interviewResults: {
        questionsAsked: state.task.questions_asked,
        finalSummary: state.evaluation.final_evaluation_summary,
        taskSuccessful: state.evaluation.task_successful,
        recommendations: state.evaluation.last_evaluation?.evaluations?.map(evaluation => ({
          area: evaluation.criterion,
          score: evaluation.score,
          feedback: evaluation.reasoning
        })) || []
      }
    });
    
  } catch (error) {
    console.error('Error ending interview:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to end interview session'
    });
  }
});

// Get all active sessions (for debugging)
app.get('/api/interview/sessions', (req, res) => {
  const sessions = Array.from(interviewSessions.keys()).map(sessionId => {
    const state = interviewSessions.get(sessionId);
    return {
      sessionId,
      stage: state?.task.interview_stage,
      turnCount: state?.evaluation.turn_count,
      messageCount: state?.messages.length
    };
  });
  
  res.json({
    success: true,
    sessions,
    totalSessions: sessions.length
  });
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 AI Interview Server is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 API endpoints:`);
  console.log(`   POST /api/interview/start - Start new interview`);
  console.log(`   POST /api/interview/message - Send message`);
  console.log(`   GET  /api/interview/status/:sessionId - Get session status`);
  console.log(`   POST /api/interview/end - End interview`);
  console.log(`   GET  /api/interview/sessions - List all sessions`);
});

export default app;