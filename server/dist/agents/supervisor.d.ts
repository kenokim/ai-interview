import { z } from "zod";
import { InterviewStateType } from "../types/state.js";
export declare const WORKER_OPTIONS: z.ZodEnum<["technical_question_agent", "followup_question_agent", "FINISH"]>;
export declare const RouteSchema: z.ZodObject<{
    next: z.ZodEnum<["technical_question_agent", "followup_question_agent", "FINISH"]>;
}, "strip", z.ZodTypeAny, {
    next: "technical_question_agent" | "followup_question_agent" | "FINISH";
}, {
    next: "technical_question_agent" | "followup_question_agent" | "FINISH";
}>;
export declare function supervisorAgent(state: InterviewStateType): Promise<{
    flow_control: {
        next_worker: "technical_question_agent" | "followup_question_agent" | undefined;
    };
    guardrails?: undefined;
} | {
    flow_control: {
        next_worker: undefined;
    };
    guardrails: {
        is_safe: boolean;
        error_message: string;
        fallback_count: number;
    };
}>;
//# sourceMappingURL=supervisor.d.ts.map