import { BaseMessage } from "@langchain/core/messages";
export interface UserContext {
    user_id: string;
    profile?: {
        name?: string;
        experience_level?: string;
        tech_stack?: string[];
        preferred_language?: string;
    };
}
export interface PersonaState {
    name: string;
    role: string;
    backstory: string;
    style_guidelines: string[];
    current_mood?: string;
}
export interface GuardrailState {
    is_safe: boolean;
    user_intent?: "interview_related" | "out_of_scope" | "clarification_needed";
    parsed_entities?: Record<string, any>;
    error_message?: string;
    fallback_count: number;
}
export interface ProactiveContext {
    trigger_event_type: string;
    trigger_event_id: string;
    metadata: Record<string, any>;
}
export interface FlowControlState {
    next_worker?: string;
    human_in_loop_payload?: Record<string, any>;
}
export interface TaskState {
    interview_stage: "Greeting" | "Questioning" | "Feedback" | "Farewell" | "Finished";
    question_pool: Record<string, any>[];
    questions_asked: Record<string, any>[];
    current_question?: Record<string, any>;
    current_answer?: string;
    agent_outcome?: any;
    tool_outputs?: Record<string, any>[];
}
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
export interface InterviewState {
    user_context: UserContext;
    messages: BaseMessage[];
    persona: PersonaState;
    guardrails?: GuardrailState;
    proactive?: ProactiveContext;
    flow_control: FlowControlState;
    task: TaskState;
    evaluation: EvaluationState;
}
export declare const InterviewStateAnnotation: import("@langchain/langgraph").AnnotationRoot<{
    user_context: import("@langchain/langgraph").BinaryOperatorAggregate<UserContext, UserContext>;
    messages: import("@langchain/langgraph").BinaryOperatorAggregate<BaseMessage[], BaseMessage[]>;
    persona: import("@langchain/langgraph").BinaryOperatorAggregate<PersonaState, PersonaState>;
    guardrails: import("@langchain/langgraph").BinaryOperatorAggregate<GuardrailState, GuardrailState>;
    proactive: import("@langchain/langgraph").BinaryOperatorAggregate<ProactiveContext, ProactiveContext>;
    flow_control: import("@langchain/langgraph").BinaryOperatorAggregate<FlowControlState, FlowControlState>;
    task: import("@langchain/langgraph").BinaryOperatorAggregate<TaskState, TaskState>;
    evaluation: import("@langchain/langgraph").BinaryOperatorAggregate<EvaluationState, EvaluationState>;
}>;
export type InterviewStateType = typeof InterviewStateAnnotation.State;
//# sourceMappingURL=state.d.ts.map