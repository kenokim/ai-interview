import { AIMessage } from "@langchain/core/messages";
import { InterviewState } from "../../../types/state.js";

export const farewellAgent = async (state: InterviewState): Promise<Partial<InterviewState>> => {
  console.log("작별 인사 에이전트가 마무리 메시지를 생성하고 있습니다.");
  
  const { user_context } = state;
  const userName = user_context.profile?.userName || "지원자";
  
  const farewellMessage = `${userName}님, 오늘 소중한 시간을 내어 면접에 참여해 주셔서 진심으로 감사합니다.

모든 면접 절차가 성공적으로 완료되었습니다. 질문에 성실하게 답변해 주시는 모습이 인상적이었습니다.

앞으로의 구직 활동과 커리어에 좋은 결과가 있기를 진심으로 응원하겠습니다. 

다시 한 번 감사드리며, 좋은 하루 보내세요!`;

  console.log("작별 인사 메시지가 생성되었습니다.");

  return {
    ...state,
    user_context: state.user_context, // 상태 유실 방지
    messages: [...state.messages, new AIMessage(farewellMessage)],
    task: { ...state.task, interview_stage: "Finished" },
    evaluation: {
      ...state.evaluation,
      turn_count: state.evaluation.turn_count + 1,
      task_successful: true
    }
  };
}; 