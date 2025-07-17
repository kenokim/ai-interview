import { AIMessage } from "@langchain/core/messages";
import { InterviewStateType } from "../../types/state.js";
export declare function technicalQuestionAgent(state: InterviewStateType): Promise<{
    messages: AIMessage[];
    task: {
        interview_stage: "Finished";
        current_question?: undefined;
        questions_asked?: undefined;
    };
    guardrails?: undefined;
} | {
    messages: AIMessage[];
    task: {
        current_question: Record<string, any>;
        interview_stage: "Questioning";
        questions_asked: Record<string, any>[];
    };
    guardrails?: undefined;
} | {
    messages: AIMessage[];
    guardrails: {
        is_safe: boolean;
        error_message: string;
        fallback_count: number;
    };
    task?: undefined;
}>;
//# sourceMappingURL=technicalQuestionAgent.d.ts.map