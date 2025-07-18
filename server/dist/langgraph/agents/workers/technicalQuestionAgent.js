import { AIMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
const technicalQuestionPrompt = `당신은 기술 면접관입니다. 제공된 면접 컨텍스트를 바탕으로, 후보자에게 할 기술 질문을 생성해 주세요.

면접 컨텍스트:
- 직무: {jobRole}
- 경력: {experience}
- 기술 스택: {interviewType}
- 이전 질문들: {questions_asked}

규칙:
- 이전과 겹치지 않는 새로운 질문을 생성해야 합니다.
- 질문은 하나만 생성합니다.
- 질문 외에 다른 말은 하지 마세요.

질문:`;
export const technicalQuestionAgent = async (state) => {
    console.log("🔧 Technical Question Agent generating question...");
    const { userContext, questions_asked } = state;
    const model = new ChatGoogleGenerativeAI({
        model: "gemini-2.0-flash",
        temperature: 0.7,
    });
    const formattedPrompt = technicalQuestionPrompt
        .replace("{jobRole}", userContext.jobRole)
        .replace("{experience}", userContext.experience)
        .replace("{interviewType}", userContext.interviewType)
        .replace("{questions_asked}", questions_asked.join(", ") || "없음");
    const response = await model.invoke(formattedPrompt);
    const question = response.content.toString();
    console.log(`🔧 Technical question generated: ${question}`);
    return {
        messages: [new AIMessage(question)],
        current_question: question,
        questions_asked: [...questions_asked, question],
        interview_stage: "Questioning",
        next: "supervisor",
    };
};
//# sourceMappingURL=technicalQuestionAgent.js.map