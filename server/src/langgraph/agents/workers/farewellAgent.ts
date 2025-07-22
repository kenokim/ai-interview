import { AIMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { InterviewState } from "../../../types/state.js";

const farewellPrompt = `당신은 AI 기술 면접관입니다. 면접의 모든 절차가 끝났습니다. 지원자에게 따뜻하고 전문적인 작별 인사를 건네세요.

**포함할 내용:**
- 지원자의 이름: {userName}
- 면접에 참여해준 것에 대한 감사 표현
- 긍정적이고 격려하는 메시지 (예: "성실하게 답변해 주시는 모습이 인상적이었습니다.")
- 향후 커리어에 대한 행운을 빌어주는 말

**응답 스타일:**
- 친절하고 따뜻한 어조
- 간결하고 명확하게

작별 인사 메시지:`;

export const farewellAgent = async (state: InterviewState): Promise<Partial<InterviewState>> => {
  console.log("작별 인사 에이전트가 LLM을 통해 마무리 메시지를 생성하고 있습니다.");
  
  const { user_context } = state;
  const userName = user_context.profile?.userName || "지원자";
  
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0.7,
  });
  const parser = new StringOutputParser();
  const chain = model.pipe(parser);

  const formattedPrompt = farewellPrompt.replace("{userName}", userName);

  const farewellMessage = await chain.invoke(formattedPrompt);

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