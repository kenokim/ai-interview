// Request types
export interface StartInterviewRequest {
  jobRole: string;
  experience: 'junior' | 'mid-level' | 'senior' | 'lead';
  interviewType: 'technical' | 'behavioral' | 'mixed';
  resume?: string;
  jobDescription?: string;
  userName?: string;
}

export interface TriggerInterviewRequest {
  event_type: "USER_APPLIED" | "INTERVIEW_SCHEDULED";
  event_id: string;
  user_id: string;
  session_id: string;
  metadata?: Record<string, any>;
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

export interface TriggerInterviewResponse {
  status: "triggered";
  sessionId: string;
  message: string;
}

export interface StartInterviewResponse {
  sessionId: string;
  message: string;
  stage: string;
  messageCount: number;
  userContext: {
    jobRole: string;
    experience: string;
    interviewType: string;
    resume?: string;
    jobDescription?: string;
    userName?: string;
  };
}

export interface SendMessageResponse {
  sessionId: string;
  message: string;
  stage: string;
  messageCount: number;
  lastEvaluation?: any;
  questionsAsked: number;
}

export interface SessionStatusResponse {
  sessionId: string;
  stage: string;
  messageCount: number;
  lastEvaluation?: any;
}

export interface EndInterviewResponse {
  sessionId: string;
  message: string;
  stage: string;
}

export interface SessionsListResponse {
  sessions: Array<{
    sessionId: string;
  }>;
  totalSessions: number;
} 