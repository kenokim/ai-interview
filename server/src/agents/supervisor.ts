import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { InterviewStateType } from "../types/state";

// Define the possible worker options
export const WORKER_OPTIONS = z.enum([
  "greeting_agent",
  "questioning_agent", 
  "evaluation_agent",
  "feedback_agent",
  "farewell_agent",
  "FINISH",
]);

export const RouteSchema = z.object({
  next: WORKER_OPTIONS.describe(
    "다음에 작업을 위임할 Worker의 이름 또는 워크플로우를 종료하기 위한 'FINISH'를 지정합니다."
  ),
});

export type RouteDecision = z.infer<typeof RouteSchema>;

export async function supervisorAgent(
  state: InterviewStateType
): Promise<{ flow_control: { next_worker_to_call: string } }> {
  
  const systemPrompt = `당신은 AI 기술 면접 워크플로우를 관리하는 '상태 기반 워크플로우 오케스트레이터'입니다. 당신의 유일한 임무는 사용자의 최신 메시지와 현재 InterviewState를 종합적으로 분석하여, 다음에 작업을 수행할 Worker를 결정하는 것입니다. 당신은 절대 사용자와 직접 대화하지 않습니다.

**라우팅 규칙:**
주어진 InterviewState의 task.interview_stage와 messages 기록을 바탕으로 다음 결정 매트릭스를 엄격하게 따르십시오.

| 현재 task.interview_stage | 마지막 메시지 작성자 | task.current_answer 상태 | task.questions_asked vs question_pool | 결정 (호출할 Tool) |
|:--- |:--- |:--- |:--- |:--- |
| greeting | user | undefined | 아직 남음 | greeting_agent |
| greeting | ai (greeting_agent) | undefined | 아직 남음 | questioning_agent |
| questioning | user | 채워짐 | 아직 남음 | evaluation_agent |
| evaluating | ai (evaluation_agent) | 채워짐 | 아직 남음 | feedback_agent |
| feedback | ai (feedback_agent) | 채워짐 | 아직 남음 | questioning_agent |
| feedback | ai (feedback_agent) | 채워짐 | 모두 소진 | farewell_agent |
| farewell | ai (farewell_agent) | 무관 | 모두 소진 | FINISH |

**오류 처리:**
만약 guardrails.error_message 필드에 내용이 있다면, 모든 라우팅 규칙을 무시하고 사용자에게 문제를 알리는 등 대체 경로를 수행해야 합니다.`;

  const model = new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0,
  }).withStructuredOutput(RouteSchema);

  // Analyze current state to determine next worker
  const currentStage = state.flow_control.interview_stage;
  const lastMessage = state.messages[state.messages.length - 1];
  const hasCurrentAnswer = !!state.task.current_answer;
  const questionsRemaining = state.task.question_pool.length > state.task.questions_asked.length;

  // Apply routing logic
  let nextWorker: string;

  if (state.guardrails?.error_message) {
    nextWorker = "FINISH"; // Handle error case
  } else if (currentStage === "greeting" && !lastMessage) {
    nextWorker = "greeting_agent";
  } else if (currentStage === "greeting" && lastMessage?.additional_kwargs?.function_call) {
    nextWorker = "questioning_agent";
  } else if (currentStage === "questioning" && hasCurrentAnswer) {
    nextWorker = "evaluation_agent";
  } else if (currentStage === "evaluating") {
    nextWorker = "feedback_agent";
  } else if (currentStage === "feedback" && questionsRemaining) {
    nextWorker = "questioning_agent";
  } else if (currentStage === "feedback" && !questionsRemaining) {
    nextWorker = "farewell_agent";
  } else if (currentStage === "farewell") {
    nextWorker = "FINISH";
  } else {
    nextWorker = "greeting_agent"; // Default fallback
  }

  return {
    flow_control: {
      next_worker_to_call: nextWorker
    }
  };
} 