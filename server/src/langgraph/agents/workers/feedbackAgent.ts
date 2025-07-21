import { AIMessage } from "@langchain/core/messages";
import { InterviewState } from "../../../types/state.js";

export const feedbackAgent = async (state: InterviewState): Promise<Partial<InterviewState>> => {
  console.log("피드백 에이전트가 피드백을 생성하고 있습니다.");
  
  const { task } = state;
  const evaluationResult = task.agent_outcome;
  
  if (!evaluationResult) {
    console.log("평가 결과가 없습니다. 기본 피드백을 제공합니다.");
    const defaultFeedback = "답변해 주셔서 감사합니다. 다음 질문으로 넘어가겠습니다.";
    
    return {
      messages: [...state.messages, new AIMessage(defaultFeedback)],
      task: {
        ...state.task,
        interview_stage: "Feedback"
      }
    };
  }
  
  // 강점 먼저 강조하는 피드백 생성
  let feedbackMessage = "답변해 주셔서 감사합니다! ";
  
  // 점수가 4 이상이면 강점 강조
  if (evaluationResult.overall_score >= 4) {
    feedbackMessage += `특히 답변의 구체성과 설명력이 매우 좋았습니다. `;
  } else if (evaluationResult.overall_score >= 3) {
    feedbackMessage += `전반적인 접근 방식은 올바른 방향이었습니다. `;
  }
  
  // 개선점 제안 (점수가 3 미만인 경우)
  if (evaluationResult.overall_score < 3) {
    feedbackMessage += `다음 번에는 조금 더 구체적인 예시나 실제 경험을 포함하여 답변해 주시면 더욱 좋겠습니다. `;
  }
  
  // 격려로 마무리
  feedbackMessage += "계속해서 좋은 답변 부탁드립니다!";
  
  console.log("피드백이 생성되었습니다.");

  // 질문 수를 확인하여 다음 단계 결정
  const totalQuestions = 3; // 기본 질문 수
  const hasMoreQuestions = state.task.questions_asked.length < totalQuestions;
  
  return {
    messages: [...state.messages, new AIMessage(feedbackMessage)],
    task: {
      ...state.task,
      interview_stage: hasMoreQuestions ? "Feedback" : "Farewell" // 더 질문이 있으면 Feedback, 없으면 Farewell로 설정
    },
    evaluation: {
      ...state.evaluation,
      turn_count: state.evaluation.turn_count + 1
    }
  };
}; 