// Request types
export interface StartInterviewRequest {
  jobRole: string;
  experience: 'junior' | 'mid-level' | 'senior' | 'lead';
  interviewType: 'technical' | 'behavioral' | 'mixed';
  resume?: string;
  jobDescription?: string;
  userName?: string;
}

export interface SendMessageRequest {
  sessionId: string;
  message: string;
}

export interface EndInterviewRequest {
  sessionId: string;
}

// Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string[];
  timestamp?: string;
}

export interface StartInterviewResponse {
  sessionId: string;
  message: string;
  stage: string;
  turnCount: number;
  userContext: {
    jobRole: string;
    experience: string;
    interviewType: string;
    resume: string | null;
    jobDescription: string | null;
    userName: string | null;
  };
}

export interface SendMessageResponse {
  message: string;
  stage: string;
  turnCount: number;
  messageCount: number;
  currentQuestion?: any;
  questionsAsked: number;
  lastEvaluation?: {
    score: number;
    evaluations: any[];
    is_sufficient: boolean;
  };
  interviewProgress: {
    stage: string;
    totalQuestions: number;
    questionsAsked: number;
    isComplete: boolean;
  };
}

export interface SessionStatusResponse {
  stage: string;
  turnCount: number;
  messageCount: number;
  lastEvaluation?: {
    score: number;
    evaluations: any[];
    is_sufficient: boolean;
  };
}

export interface EndInterviewResponse {
  message: string;
  sessionSummary: {
    sessionId: string;
    totalTurns: number;
    totalMessages: number;
    questionsAsked: number;
    stage: string;
    duration: number;
  };
  finalEvaluation?: {
    score: number;
    evaluations: any[];
    is_sufficient: boolean;
  };
  interviewResults: {
    questionsAsked: any[];
    finalSummary?: string;
    taskSuccessful?: boolean;
    recommendations: Array<{
      area: string;
      score: number;
      feedback: string;
    }>;
  };
}

export interface SessionsListResponse {
  sessions: Array<{
    sessionId: string;
    stage: string;
    turnCount: number;
    messageCount: number;
  }>;
  totalSessions: number;
} 