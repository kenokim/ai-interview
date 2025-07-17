import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AgentState } from "../types/state.js";
/**
 * Creates a supervisor.
 * @param {ChatGoogleGenerativeAI} model - The ChatGoogleGenerativeAI model.
 * @returns {Runnable<any, any>} The supervisor chain.
 */
export declare const createSupervisor: (model: ChatGoogleGenerativeAI) => (state: AgentState) => Promise<"FINISH" | "Question_Generator" | "Answer_Evaluator" | "Interviewer">;
//# sourceMappingURL=supervisor.d.ts.map