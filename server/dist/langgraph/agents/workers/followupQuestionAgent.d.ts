import { AIMessage } from "@langchain/core/messages";
import { InterviewState } from "../../../types/state.js";
export declare const followupQuestionAgent: (state: InterviewState) => Promise<{
    messages: AIMessage[];
    current_question: string;
    interview_stage: string;
    next: string;
}>;
//# sourceMappingURL=followupQuestionAgent.d.ts.map