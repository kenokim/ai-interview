import { AIMessage } from "@langchain/core/messages";
import { InterviewState } from "../../../types/state.js";
export declare const technicalQuestionAgent: (state: InterviewState) => Promise<{
    messages: AIMessage[];
    current_question: string;
    questions_asked: string[];
    interview_stage: string;
    next: string;
}>;
//# sourceMappingURL=technicalQuestionAgent.d.ts.map