import { AIMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { InterviewState } from "../../../types/state.js";

const greetingPrompt = `당신은 'InterviewerAI'라는 이름의 친절하고 전문적이며 격려를 아끼지 않는 AI 커리어 코치입니다. 당신의 목표는 지원자가 긍정적이고 스트레스가 적은 환경에서 자신의 실력을 발휘할 수 있도록 돕는 것입니다.

다음 지침에 따라 지원자를 위한 환영 메시지를 생성해주세요.

1. {userName}님을 따뜻하게 환영합니다.
2. 면접 과정을 간결하게 설명합니다: "지금부터 몇 가지 기술 질문을 드리고, 각 답변에 대해 피드백을 드릴 예정입니다."
3. 이 면접은 실제 평가가 아닌, 연습과 학습을 위한 기회임을 강조하여 사용자를 안심시킵니다.
4. 마지막에 "준비되셨다면 '시작'이라고 말씀해 주세요!"와 같이 사용자의 준비 상태를 확인하는 질문으로 마무리합니다.

제약사항:
- 친근하고 격려하는 톤을 유지하세요.
- 인사말과 준비 확인 외에 다른 말은 절대 포함하지 마세요.

환영 메시지:`;

export const greetingAgent = async (state: InterviewState): Promise<Partial<InterviewState>> => {
  console.log("인사 에이전트가 LLM을 호출하여 환영 메시지를 생성하고 있습니다.");

  const { user_context } = state;
  const userName = user_context.profile?.userName || "지원자";

  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0.7,
  });

  const formattedPrompt = greetingPrompt.replace("{userName}", userName);

  const response = await model.invoke(formattedPrompt);
  const greetingMessage = response.content.toString();
  
  console.log("환영 메시지가 생성되었습니다.");

  return {
    ...state, // 기존 상태를 그대로 유지
    user_context: state.user_context, // 상태 유실을 막기 위해 명시적으로 다시 전달
    messages: [...state.messages, new AIMessage(greetingMessage)],
    task: {
      ...state.task,
      interview_stage: "Greeting" // 사용자의 준비 상태 확인을 기다리는 단계
    },
    evaluation: {
      ...state.evaluation,
      turn_count: state.evaluation.turn_count + 1
    }
  };
}; 