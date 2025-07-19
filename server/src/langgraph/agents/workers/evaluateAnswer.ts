import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import {
  InterviewState,
} from "../../../types/state.js";

interface Evaluation {
  score: number;
  reason: string;
}

const evaluationPrompt = `당신은 면접관의 답변 평가 어시스턴트입니다. 다음 질문과 후보자의 답변을 바탕으로, 답변이 얼마나 적절한지 1~5점 척도로 평가하고 그 이유를 간략히 설명해 주세요.

질문: {question}
답변: {answer}

출력 형식은 반드시 다음 JSON 스키마를 따라야 합니다:
{
  "score": "1~5 사이의 정수",
  "reason": "평가 이유를 한국어로 간략히 설명"
}

JSON 출력:`;

export const evaluateAnswerAgent = async (state: InterviewState) => {
  console.log("🧐 Evaluating answer...");
  const { messages, current_question } = state;
  const lastMessage = messages[messages.length - 1];

  if (lastMessage instanceof AIMessage) {
    console.log("🧐 Last message is from AI, no evaluation needed.");
    return { ...state };
  }

  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0.2,
  }).pipe(new JsonOutputParser<Evaluation>());

  const formattedPrompt = evaluationPrompt
    .replace("{question}", current_question || "없음")
    .replace("{answer}", lastMessage.content.toString());

  const response = await model.invoke(formattedPrompt);

  console.log(`🧐 Evaluation result:`, response);

  return {
    last_evaluation: response,
    interview_stage: "Evaluating",
    next: "supervisor",
  };
}; 