import { BaseMessage } from "@langchain/core/messages";
import { Annotation } from "@langchain/langgraph";

// User Context State
export interface UserContext {
  user_id: string;
  profile?: {
    name?: string;
    experience_level?: string;
    tech_stack?: string[];
    preferred_language?: string;
  };
}

// Persona State
export interface PersonaState {
  name: string;
  role: string;
  backstory: string;
  style_guidelines: string[];
  current_mood?: string;
}

// Guardrail State
export interface GuardrailState {
  is_safe: boolean;
  user_intent?: "interview_related" | "out_of_scope" | "clarification_needed";
  parsed_entities?: Record<string, any>;
  error_message?: string;
  fallback_count: number;
}

// Proactive Context
export interface ProactiveContext {
  trigger_event_type: string;
  trigger_event_id: string;
  metadata: Record<string, any>;
}

// Flow Control State
export interface FlowControlState {
  next_worker?: string;
  human_in_loop_payload?: Record<string, any>;
}

// Task State
export interface TaskState {
  interview_stage: "Greeting" | "Questioning" | "Feedback" | "Farewell" | "Finished";
  question_pool: Record<string, any>[];
  questions_asked: Record<string, any>[];
  current_question?: Record<string, any>;
  current_answer?: string;
  agent_outcome?: any;
  tool_outputs?: Record<string, any>[];
}

// Evaluation State
export interface EvaluationState {
  turn_count: number;
  last_user_feedback?: "positive" | "negative";
  task_successful?: boolean;
  final_evaluation_summary?: string;
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
      user_id: "default_user",
      profile: {
        name: "Test User",
        experience_level: "mid-level",
        tech_stack: ["JavaScript", "React", "Node.js"],
        preferred_language: "JavaScript"
      }
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
      is_safe: true,
      fallback_count: 0
    })
  }),
  
  proactive: Annotation<ProactiveContext>({
    reducer: (prev, next) => ({ ...prev, ...next }),
    default: () => ({
      trigger_event_type: "interview_start",
      trigger_event_id: "default",
      metadata: {}
    })
  }),
  
  flow_control: Annotation<FlowControlState>({
    reducer: (prev, next) => ({ ...prev, ...next }),
    default: () => ({
      next_worker: undefined
    })
  }),
  
  task: Annotation<TaskState>({
    reducer: (prev, next) => ({ ...prev, ...next }),
    default: () => ({
      interview_stage: "Greeting",
      question_pool: [
        {
          id: "js_closures",
          text: "Can you explain what closures are in JavaScript and provide an example?",
          category: "JavaScript",
          difficulty: "medium",
          expected_topics: ["lexical scoping", "function scope", "practical examples"]
        },
        {
          id: "react_hooks",
          text: "What are React Hooks and how do they differ from class components?",
          category: "React",
          difficulty: "medium",
          expected_topics: ["useState", "useEffect", "lifecycle methods"]
        },
        {
          id: "async_js",
          text: "Explain the difference between Promises and async/await in JavaScript.",
          category: "JavaScript",
          difficulty: "medium",
          expected_topics: ["asynchronous programming", "error handling", "syntax differences"]
        }
      ],
      questions_asked: [],
      current_question: undefined,
      current_answer: undefined,
      agent_outcome: undefined,
      tool_outputs: undefined
    })
  }),
  
  evaluation: Annotation<EvaluationState>({
    reducer: (prev, next) => ({ ...prev, ...next }),
    default: () => ({
      turn_count: 0,
      last_user_feedback: undefined,
      task_successful: undefined,
      final_evaluation_summary: undefined,
      last_evaluation: undefined
    })
  }),

  next: Annotation<string>({
    reducer: (prev, next) => next ?? prev,
    default: () => "supervisor",
  }),
});

export type InterviewStateType = typeof InterviewStateAnnotation.State;

// Simple AgentState for supervisor
export interface AgentState {
  messages: BaseMessage[];
  next: string;
} 