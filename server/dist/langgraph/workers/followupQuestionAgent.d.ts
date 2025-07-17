import { AIMessage } from "@langchain/core/messages";
import { InterviewStateType } from "../../types/state.js";
export declare function followupQuestionAgent(state: InterviewStateType): Promise<{
    messages: AIMessage[];
    task: {
        interview_stage: "Questioning";
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
//# sourceMappingURL=followupQuestionAgent.d.ts.map