import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import {
  InterviewState,
} from "../../../types/state.js";

interface Evaluation {
  overall_score: number;
  score: number;
  reason: string;
}

const evaluationPrompt = `당신은 면접관의 답변 평가 어시스턴트입니다. 다음 질문과 후보자의 답변을 바탕으로, 답변이 얼마나 적절한지 1~5점 척도로 평가하고 그 이유를 간략히 설명해 주세요.

질문: {question}
답변: {answer}

출력 형식은 반드시 다음 JSON 스키마를 따라야 합니다:
{
  "overall_score": "1~5 사이의 정수",
  "score": "1~5 사이의 정수", 
  "reason": "평가 이유를 한국어로 간략히 설명"
}

JSON 출력:`;

export const evaluateAnswerAgent = async (state: InterviewState) => {
  console.log("답변 평가를 시작합니다.");
  const { messages, task } = state;
  const lastMessage = messages[messages.length - 1];

  // AI 메시지인 경우 평가하지 않음
  if (lastMessage instanceof AIMessage) {
    console.log("마지막 메시지가 AI의 메시지이므로 평가를 건너뛰고 상태를 유지합니다.");
    return state; // 상태를 변경하지 않고 그대로 반환
  }

  // 사용자 메시지가 아닌 경우도 체크
  if (!(lastMessage instanceof HumanMessage)) {
    console.log("평가할 수 있는 사용자 답변이 없습니다.");
    return state;
  }

  console.log(`사용자 답변을 평가합니다: ${lastMessage.content.toString().substring(0, 50)}...`);

  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0.2,
  }).pipe(new JsonOutputParser<Evaluation>());

  const formattedPrompt = evaluationPrompt
    .replace("{question}", task.current_question?.text || task.current_question || "없음")
    .replace("{answer}", lastMessage.content.toString());

  try {
    const response = await model.invoke(formattedPrompt);
    console.log("평가 결과:", response);

    return {
      ...state,
      task: {
        ...state.task,
        interview_stage: "Evaluating", // 평가 중 상태로 변경
        agent_outcome: response
      },
      evaluation: {
        ...state.evaluation,
        turn_count: state.evaluation.turn_count + 1
      }
    };
  } catch (error) {
    console.error("평가 중 오류 발생:", error);
    return {
      ...state,
      task: {
        ...state.task,
        interview_stage: "Evaluating",
        agent_outcome: {
          overall_score: 3,
          score: 3,
          reason: "평가 중 오류가 발생했습니다."
        }
      }
    };
  }
}; 