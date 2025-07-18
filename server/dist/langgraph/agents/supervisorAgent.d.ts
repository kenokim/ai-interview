import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
export declare function createSupervisorAgent(model: ChatGoogleGenerativeAI): import("@langchain/core/runnables").Runnable<{
    interview_stage: any;
    chat_history: any;
    input: any;
}, import("@langchain/core/messages").AIMessageChunk, import("@langchain/core/runnables").RunnableConfig<Record<string, any>>>;
//# sourceMappingURL=supervisorAgent.d.ts.map