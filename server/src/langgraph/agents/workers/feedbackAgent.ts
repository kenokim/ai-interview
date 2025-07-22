import { AIMessage } from "@langchain/core/messages";
import { InterviewState } from "../../../types/state.js";

export const feedbackAgent = async (state: InterviewState): Promise<Partial<InterviewState>> => {
  console.log("피드백 에이전트가 평가 결과에 따른 피드백을 생성하고 있습니다.");
  
  const { task } = state;
  const evaluationResult = task.agent_outcome;
  
  if (!evaluationResult) {
    console.log("평가 결과가 없습니다. 기본 피드백을 제공합니다.");
    const defaultFeedback = "답변해 주셔서 감사합니다. 다음 질문으로 넘어가겠습니다.";
    
    return {
      messages: [...state.messages, new AIMessage(defaultFeedback)],
      task: {
        ...state.task,
        interview_stage: "Feedback",
        agent_outcome: { ...evaluationResult, is_sufficient: true } // 기본값으로 충분하다고 설정
      }
    };
  }
  
  let feedbackMessage = "";
  let isSufficient = true; // 답변이 충분한지 여부
  
  // 평가 점수에 따른 피드백 생성
  if (evaluationResult.overall_score >= 4) {
    // 충분한 답변 - 다음 질문으로 넘어감
    feedbackMessage = "네, 좋습니다! 정확하고 구체적인 답변이었습니다. 다음 질문을 드리겠습니다.";
    isSufficient = true;
    console.log("답변이 충분합니다. 다음 질문으로 진행합니다.");
  } else if (evaluationResult.overall_score >= 3) {
    // 보통 답변 - 다음 질문으로 넘어감
    feedbackMessage = "네, 기본적인 이해는 잘 되어 있는 것 같습니다. 다음 질문을 드리겠습니다.";
    isSufficient = true;
    console.log("답변이 보통 수준입니다. 다음 질문으로 진행합니다.");
  } else if (evaluationResult.overall_score >= 2) {
    // 부족한 답변 - 꼬리질문 또는 더 쉬운 질문
    feedbackMessage = "음, 조금 더 구체적으로 설명해 주실 수 있을까요? 혹시 실제 경험이나 예시가 있다면 함께 말씀해 주세요.";
    isSufficient = false;
    console.log("답변이 부족합니다. 꼬리질문을 진행합니다.");
  } else {
    // 매우 부족한 답변 - 더 쉬운 질문으로 변경
    feedbackMessage = "네, 그럼 조금 더 쉬운 질문을 드리겠습니다. 이해하기 쉬운 기본적인 개념부터 차근차근 접근해 보겠습니다.";
    isSufficient = false;
    console.log("답변이 매우 부족합니다. 더 쉬운 질문으로 변경합니다.");
  }
  
  console.log(`피드백 생성 완료: ${isSufficient ? '충분' : '불충분'}`);

  return {
    ...state,
    user_context: state.user_context, // 상태 유실 방지
    messages: [...state.messages, new AIMessage(feedbackMessage)],
    task: {
      ...state.task,
      interview_stage: "Feedback",
      agent_outcome: { 
        ...evaluationResult, 
        is_sufficient: isSufficient // 답변 충족도를 agent_outcome에 저장
      }
    },
    evaluation: {
      ...state.evaluation,
      turn_count: state.evaluation.turn_count + 1
    }
  };
}; 