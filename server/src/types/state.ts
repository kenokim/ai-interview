import { BaseMessage, HumanMessage } from "@langchain/core/messages";
import { END, START, StateGraph, StateGraphArgs } from "@langchain/langgraph";
import { Runnable, RunnableConfig } from "@langchain/core/runnables";

export interface InterviewState {
  messages: BaseMessage[];
  userContext: {
    jobRole: string;
    experience: string;
    interviewType: string;
    resume?: string;
    jobDescription?: string;
    userName?: string;
  };
  interview_stage: "Greeting" | "Questioning" | "Answering" | "Evaluating" | "Follow-up" | "Finished";
  questions_asked: string[];
  current_question?: string;
  last_evaluation?: any;
  next: string;
  // Proactive context
  trigger_context?: {
    event_type: string;
    event_id: string;
    metadata?: Record<string, any>;
  };
}

export const interviewStateGraph: StateGraphArgs<InterviewState> = {
  channels: {
    messages: {
      value: (x, y) => x.concat(y),
      default: () => [],
    },
    userContext: {
      value: (x, y) => ({...x, ...y}),
      default: () => ({
        jobRole: "ai_agent",
        experience: "junior",
        interviewType: "technical",
      }),
    },
    interview_stage: {
      value: (x, y) => y,
      default: () => "Greeting",
    },
    questions_asked: {
      value: (x, y) => x.concat(y),
      default: () => [],
    },
    current_question: {
      value: (x, y) => y,
      default: () => undefined,
    },
    last_evaluation: {
        value: (x, y) => y,
        default: () => undefined,
    },
    next: {
        value: (x, y) => y,
        default: () => "supervisor",
    },
    trigger_context: {
        value: (x, y) => y,
        default: () => undefined,
    }
  },
};

export type InterviewStateType = InterviewState;
export const InterviewStateAnnotation = new StateGraph(interviewStateGraph);

// Simple AgentState for supervisor
export interface AgentState {
  messages: BaseMessage[];
  next: string;
} 