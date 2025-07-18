import { HumanMessage } from "@langchain/core/messages";
import { InterviewState } from "../../types/state.js";
export declare const interviewerNode: (state: InterviewState) => Promise<{
    messages: HumanMessage[];
    next: string;
}>;
export declare const supervisorNode: (state: InterviewState) => Promise<{
    next: string;
}>;
//# sourceMappingURL=interviewer.d.ts.map