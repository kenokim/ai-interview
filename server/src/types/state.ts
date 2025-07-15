import { BaseMessage } from "@langchain/core/messages";
import { Annotation } from "@langchain/langgraph";

// User Context State
export interface UserContext {
  profile: {
    name?: string;
    experience_level?: string;
    tech_stack?: string[];
    preferred_language?: string;
  };
  session_id: string;
  timestamp: string;
}

// Persona State
export interface PersonaState {
  name: string;
  role: string;
  backstory: string;
  style_guidelines: string[];
  current_mood: string;
}

// Guardrail State
export interface GuardrailState {
  error_message?: string;
  violation_count: number;
  last_violation_type?: string;
}

// Proactive Context
export interface ProactiveContext {
  silence_duration?: number;
  last_user_engagement?: string;
  should_prompt: boolean;
}

// Flow Control State
export interface FlowControlState {
  next_worker_to_call?: string;
  interview_stage: string;
  loop_count: number;
}

// Task State
export interface TaskState {
  question_pool: Array<{
    id: string;
    text: string;
    category: string;
    difficulty: string;
    expected_answer?: string;
  }>;
  questions_asked: string[];
  current_question?: string;
  current_answer?: string;
  last_evaluation?: {
    overall_score: number;
    evaluations: Array<{
      criterion: string;
      score: number;
      reasoning: string;
    }>;
    is_sufficient: boolean;
  };
}

// Evaluation State
export interface EvaluationState {
  total_score: number;
  individual_scores: Array<{
    question_id: string;
    score: number;
    feedback: string;
  }>;
  completion_percentage: number;
}

// Main Interview State
export interface InterviewState {
  // Core conversation state
  user_context: UserContext;
  messages: BaseMessage[];
  
  // Persona state
  persona: PersonaState;
  
  // Guardrail and safety state
  guardrails?: GuardrailState;
  
  // Proactive conversation state
  proactive?: ProactiveContext;
  
  // Control flow state
  flow_control: FlowControlState;
  
  // Interview task state
  task: TaskState;
  
  // Evaluation and metadata state
  evaluation: EvaluationState;
}

// LangGraph State Annotation
export const InterviewStateAnnotation = Annotation.Root({
  user_context: Annotation<UserContext>({
    reducer: (prev, next) => ({ ...prev, ...next }),
    default: () => ({
      profile: {},
      session_id: "",
      timestamp: new Date().toISOString()
    })
  }),
  
  messages: Annotation<BaseMessage[]>({
    reducer: (prev, next) => prev.concat(next),
    default: () => []
  }),
  
  persona: Annotation<PersonaState>({
    reducer: (prev, next) => ({ ...prev, ...next }),
    default: () => ({
      name: "Dr. Sarah Chen",
      role: "Senior Technical Interviewer",
      backstory: "A seasoned software engineer with 15+ years of experience in full-stack development and technical leadership.",
      style_guidelines: [
        "Ask follow-up questions to understand depth of knowledge",
        "Provide constructive feedback",
        "Maintain professional yet approachable tone",
        "Focus on problem-solving approach over memorized answers"
      ],
      current_mood: "professional"
    })
  }),
  
  guardrails: Annotation<GuardrailState>({
    reducer: (prev, next) => ({ ...prev, ...next }),
    default: () => ({
      violation_count: 0
    })
  }),
  
  proactive: Annotation<ProactiveContext>({
    reducer: (prev, next) => ({ ...prev, ...next }),
    default: () => ({
      should_prompt: false
    })
  }),
  
  flow_control: Annotation<FlowControlState>({
    reducer: (prev, next) => ({ ...prev, ...next }),
    default: () => ({
      interview_stage: "greeting",
      loop_count: 0
    })
  }),
  
  task: Annotation<TaskState>({
    reducer: (prev, next) => ({ ...prev, ...next }),
    default: () => ({
      question_pool: [],
      questions_asked: [],
      current_question: undefined,
      current_answer: undefined,
      last_evaluation: undefined
    })
  }),
  
  evaluation: Annotation<EvaluationState>({
    reducer: (prev, next) => ({ ...prev, ...next }),
    default: () => ({
      total_score: 0,
      individual_scores: [],
      completion_percentage: 0
    })
  })
});

export type InterviewStateType = typeof InterviewStateAnnotation.State; 