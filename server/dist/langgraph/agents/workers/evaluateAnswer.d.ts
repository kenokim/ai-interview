import { InterviewState } from "../../../types/state.js";
interface Evaluation {
    overall_score: number;
    score: number;
    reason: string;
}
export declare const evaluateAnswerAgent: (state: InterviewState) => Promise<InterviewState | {
    user_context: import("../../../types/state.js").UserContext;
    task: {
        interview_stage: string;
        agent_outcome: Evaluation;
        question_pool: Record<string, any>[];
        questions_asked: Record<string, any>[];
        current_question?: Record<string, any>;
        current_answer?: string;
        current_difficulty: number;
        previous_difficulty?: number;
        tool_outputs?: Record<string, any>[];
    };
    evaluation: {
        turn_count: number;
        last_user_feedback?: "positive" | "negative";
        task_successful?: boolean;
        final_evaluation_summary?: string;
    };
    messages: import("@langchain/core/messages").BaseMessage[];
    persona: import("../../../types/state.js").PersonaState;
    guardrails?: import("../../../types/state.js").GuardrailState;
    proactive?: import("../../../types/state.js").ProactiveContext;
    flow_control: import("../../../types/state.js").FlowControlState;
}>;
export {};
//# sourceMappingURL=evaluateAnswer.d.ts.map