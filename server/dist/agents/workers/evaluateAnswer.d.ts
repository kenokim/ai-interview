import { z } from "zod";
import { InterviewStateType } from "../../types/state.js";
export declare const EvaluationResultSchema: z.ZodObject<{
    overall_score: z.ZodNumber;
    evaluations: z.ZodArray<z.ZodObject<{
        criterion: z.ZodString;
        score: z.ZodNumber;
        reasoning: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        criterion: string;
        score: number;
        reasoning: string;
    }, {
        criterion: string;
        score: number;
        reasoning: string;
    }>, "many">;
    is_sufficient: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    overall_score: number;
    evaluations: {
        criterion: string;
        score: number;
        reasoning: string;
    }[];
    is_sufficient: boolean;
}, {
    overall_score: number;
    evaluations: {
        criterion: string;
        score: number;
        reasoning: string;
    }[];
    is_sufficient: boolean;
}>;
export declare function evaluateAnswer(state: InterviewStateType): Promise<{
    evaluation: {
        last_evaluation: {
            overall_score: number;
            evaluations: {
                criterion: string;
                score: number;
                reasoning: string;
            }[];
            is_sufficient: boolean;
        };
        turn_count: number;
    };
    guardrails?: undefined;
} | {
    guardrails: {
        is_safe: boolean;
        error_message: string;
        fallback_count: number;
    };
    evaluation?: undefined;
}>;
//# sourceMappingURL=evaluateAnswer.d.ts.map