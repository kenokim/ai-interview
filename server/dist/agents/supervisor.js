"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteSchema = exports.WORKER_OPTIONS = void 0;
exports.supervisorAgent = supervisorAgent;
const google_genai_1 = require("@langchain/google-genai");
const zod_1 = require("zod");
// Define the routing options for the 3-agent architecture
exports.WORKER_OPTIONS = zod_1.z.enum([
    "technical_question_agent",
    "followup_question_agent",
    "FINISH",
]);
exports.RouteSchema = zod_1.z.object({
    next: exports.WORKER_OPTIONS.describe("다음에 작업을 위임할 Worker의 이름 또는 워크플로우를 종료하기 위한 'FINISH'를 지정합니다."),
});
const model = new google_genai_1.ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0,
    apiKey: process.env.GOOGLE_API_KEY,
}).withStructuredOutput(exports.RouteSchema);
async function supervisorAgent(state) {
    console.log("🎯 Supervisor analyzing state and routing...");
    const systemPrompt = `당신은 AI 기술 면접 워크플로우를 관리하는 '상태 기반 워크플로우 오케스트레이터'입니다. 당신의 유일한 임무는 사용자의 최신 메시지와 현재 InterviewState를 종합적으로 분석하여, 다음에 작업을 수행할 Worker를 결정하는 것입니다. 당신은 절대 사용자와 직접 대화하지 않습니다.

당신의 결정은 반드시 structured output으로만 이루어져야 합니다.

**라우팅 규칙:**
주어진 InterviewState의 task.interview_stage와 messages 기록을 바탕으로 다음 결정 매트릭스를 엄격하게 따르십시오.

1. **면접 시작 단계**: 
   - interview_stage가 "Greeting"이고 사용자가 면접 시작을 요청했다면 → technical_question_agent

2. **기술 질문 단계**:
   - 사용자가 기술 질문에 답변했고, 답변이 충분하지 않거나 더 깊이 있는 탐색이 필요하다면 → followup_question_agent
   - 사용자가 기술 질문에 답변했고, 답변이 충분하며 다음 기술 영역으로 넘어가야 한다면 → technical_question_agent
   - 모든 질문이 완료되었다면 → FINISH

3. **꼬리질문 단계**:
   - 사용자가 꼬리질문에 답변했고, 추가 탐색이 필요하다면 → followup_question_agent
   - 사용자가 꼬리질문에 답변했고, 현재 주제가 충분히 탐색되었다면 → technical_question_agent

**현재 상태 분석:**
- 면접 단계: ${state.task.interview_stage}
- 전체 질문 수: ${state.task.question_pool.length}
- 질문한 수: ${state.task.questions_asked.length}
- 현재 질문: ${state.task.current_question?.text || "없음"}
- 현재 답변: ${state.task.current_answer || "없음"}
- 마지막 평가: ${state.evaluation.last_evaluation ? `점수 ${state.evaluation.last_evaluation.overall_score}` : "없음"}

**오류 처리:**
만약 guardrails.error_message 필드에 내용이 있다면, 모든 라우팅 규칙을 무시하고 FINISH를 반환하여 안전하게 종료합니다.`;
    const lastMessage = state.messages[state.messages.length - 1];
    const lastMessageContent = lastMessage ? lastMessage.content : "No messages yet";
    try {
        const result = await model.invoke([
            { role: "system", content: systemPrompt },
            { role: "user", content: `마지막 메시지: ${lastMessageContent}` }
        ]);
        console.log(`🎯 Supervisor decision: ${result.next}`);
        return {
            flow_control: {
                next_worker: result.next === "FINISH" ? undefined : result.next
            }
        };
    }
    catch (error) {
        console.error("❌ Supervisor error:", error);
        return {
            flow_control: {
                next_worker: undefined
            },
            guardrails: {
                is_safe: false,
                error_message: "Supervisor routing failed",
                fallback_count: (state.guardrails?.fallback_count || 0) + 1
            }
        };
    }
}
//# sourceMappingURL=supervisor.js.map