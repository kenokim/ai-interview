import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createSupervisorAgent } from "./supervisor/supervisorAgent.js";
const model = new ChatGoogleGenerativeAI({
    modelName: "gemini-2.0-flash",
    maxOutputTokens: 2048,
    temperature: 0.7,
    apiKey: process.env.GOOGLE_API_KEY,
});
/**
 * Creates a supervisor.
 * @param {ChatGoogleGenerativeAI} model - The ChatGoogleGenerativeAI model.
 * @returns {Runnable<any, any>} The supervisor chain.
 */
export const createSupervisor = (model) => {
    const supervisorChain = createSupervisorAgent(model);
    const route = async (state) => {
        const { messages } = state;
        const lastMessage = messages[messages.length - 1];
        const response = await supervisorChain.invoke({
            chat_history: messages.map((msg) => `${msg._getType()}: ${msg.content}`).join('\n'),
            input: lastMessage.content,
            interview_stage: "진행중"
        });
        // response는 문자열이므로 직접 처리
        const responseContent = typeof response.content === 'string' ? response.content.toLowerCase() : '';
        if (responseContent.includes("finish")) {
            return "FINISH";
        }
        else if (responseContent.includes("technical")) {
            return "Question_Generator";
        }
        else if (responseContent.includes("followup")) {
            return "Answer_Evaluator";
        }
        else {
            return "Interviewer";
        }
    };
    return route;
};
//# sourceMappingURL=supervisor.js.map