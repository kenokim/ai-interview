import { InterviewState } from "../../../types/state.js";
export declare const technicalQuestionAgent: (state: InterviewState) => Promise<{
    messages: import("@langchain/core/messages").BaseMessage[];
    task: {
        current_question: {
            text: string;
            type: string;
            difficulty: number;
            topic: string;
        };
        questions_asked: (Record<string, any> | {
            text: string;
            type: string;
            difficulty: number;
            topic: string;
        })[];
        previous_difficulty: number;
        current_difficulty: number;
        interview_stage: string;
        question_pool: Record<string, any>[];
        current_answer?: string;
        agent_outcome?: any;
        tool_outputs?: Record<string, any>[];
    };
    user_context: import("../../../types/state.js").UserContext;
    persona: import("../../../types/state.js").PersonaState;
    guardrails?: import("../../../types/state.js").GuardrailState;
    proactive?: import("../../../types/state.js").ProactiveContext;
    flow_control: import("../../../types/state.js").FlowControlState;
    evaluation: import("../../../types/state.js").EvaluationState;
}>;
//# sourceMappingURL=technicalQuestionAgent.d.ts.map