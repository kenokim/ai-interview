import { AIMessage } from "@langchain/core/messages";
import { InterviewState } from "../../../types/state.js";

export const greetingAgent = async (state: InterviewState): Promise<Partial<InterviewState>> => {
  console.log("인사 에이전트가 환영 메시지를 생성하고 있습니다.");
  
  const { user_context } = state;
  const userName = user_context.profile?.userName || "지원자";
  
  const greetingMessage = `안녕하세요, ${userName}님! 저는 InterviewerAI입니다. 오늘 기술 면접에 참여해 주셔서 감사합니다.

이번 면접은 다음과 같이 진행됩니다:
- 일련의 기술 질문을 드리고, 답변을 들은 후 평가와 피드백을 제공합니다
- 이는 실제 평가가 아닌, 연습과 학습을 위한 기회입니다
- 편안한 마음으로 자신의 지식과 경험을 자유롭게 표현해 주세요

준비가 되셨다면 면접을 시작하겠습니다. 화이팅!`;

  console.log("환영 메시지가 생성되었습니다.");

  return {
    messages: [...state.messages, new AIMessage(greetingMessage)],
    task: {
      ...state.task,
      interview_stage: "Questioning" // 인사 후 바로 질문 단계로 이동
    },
    evaluation: {
      ...state.evaluation,
      turn_count: state.evaluation.turn_count + 1
    }
  };
}; 