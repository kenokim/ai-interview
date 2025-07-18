import { BaseMessage } from "@langchain/core/messages";
import { StateGraph, StateGraphArgs } from "@langchain/langgraph";
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
    trigger_context?: {
        event_type: string;
        event_id: string;
        metadata?: Record<string, any>;
    };
}
export declare const interviewStateGraph: StateGraphArgs<InterviewState>;
export type InterviewStateType = InterviewState;
export declare const InterviewStateAnnotation: StateGraph<StateGraphArgs<InterviewState>, InterviewState, Partial<InterviewState>, "__start__", import("@langchain/langgraph").StateDefinition, import("@langchain/langgraph").StateDefinition, import("@langchain/langgraph").StateDefinition>;
export interface AgentState {
    messages: BaseMessage[];
    next: string;
}
//# sourceMappingURL=state.d.ts.map