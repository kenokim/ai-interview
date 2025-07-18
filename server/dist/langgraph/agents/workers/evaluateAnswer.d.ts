import { InterviewState } from "../../../types/state.js";
interface Evaluation {
    score: number;
    reason: string;
}
export declare const evaluateAnswer: (state: InterviewState) => Promise<{
    messages: import("@langchain/core/messages").BaseMessage[];
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
} | {
    last_evaluation: Evaluation;
    interview_stage: string;
    next: string;
}>;
export {};
//# sourceMappingURL=evaluateAnswer.d.ts.map