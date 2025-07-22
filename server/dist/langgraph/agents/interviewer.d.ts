import { BaseMessage, HumanMessage } from "@langchain/core/messages";
import { InterviewState } from "../../types/state.js";
export declare const interviewerNode: (state: InterviewState) => Promise<{
    messages: (BaseMessage | HumanMessage)[];
    flow_control: {
        next_worker: string;
        human_in_loop_payload?: Record<string, any>;
    };
    user_context: import("../../types/state.js").UserContext;
    persona: import("../../types/state.js").PersonaState;
    guardrails?: import("../../types/state.js").GuardrailState;
    proactive?: import("../../types/state.js").ProactiveContext;
    task: import("../../types/state.js").TaskState;
    evaluation: import("../../types/state.js").EvaluationState;
}>;
export declare const supervisorNode: (state: InterviewState) => Promise<{
    flow_control: {
        next_worker: string;
        human_in_loop_payload?: Record<string, any>;
    };
    messages: BaseMessage[];
    user_context: import("../../types/state.js").UserContext;
    persona: import("../../types/state.js").PersonaState;
    guardrails?: import("../../types/state.js").GuardrailState;
    proactive?: import("../../types/state.js").ProactiveContext;
    task: import("../../types/state.js").TaskState;
    evaluation: import("../../types/state.js").EvaluationState;
}>;
//# sourceMappingURL=interviewer.d.ts.map