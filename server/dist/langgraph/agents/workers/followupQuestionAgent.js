import { AIMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
const followupQuestionPrompt = `당신은 기술 면접관입니다. 후보자의 이전 답변을 바탕으로, 더 깊이 있는 이해를 확인하기 위한 후속 질문을 하나 생성해 주세요.

이전 질문: {current_question}
후보자 답변: {last_message}

규칙:
- 이전 답변과 관련된 질문이어야 합니다.
- 질문은 하나만 생성합니다.
- 질문 외에 다른 말은 하지 마세요.

후속 질문:`;
export const followupQuestionAgent = async (state) => {
    console.log("🔍 Follow-up Question Agent generating follow-up...");
    const { messages, current_question } = state;
    const lastMessage = messages[messages.length - 1]?.content.toString() || "";
    const model = new ChatGoogleGenerativeAI({
        model: "gemini-2.0-flash",
        temperature: 0.7,
    });
    const formattedPrompt = followupQuestionPrompt
        .replace("{current_question}", current_question || "없음")
        .replace("{last_message}", lastMessage);
    const response = await model.invoke(formattedPrompt);
    const question = response.content.toString();
    console.log(`🔍 Follow-up question generated: ${question}`);
    return {
        messages: [new AIMessage(question)],
        current_question: question,
        interview_stage: "Follow-up",
        next: "supervisor",
    };
};
//# sourceMappingURL=followupQuestionAgent.js.map