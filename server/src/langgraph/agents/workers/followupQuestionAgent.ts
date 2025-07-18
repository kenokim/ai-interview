import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AIMessage } from "@langchain/core/messages";
import { InterviewStateType } from "../../../types/state.js";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash-exp",
  temperature: 0.7,
  apiKey: process.env.GOOGLE_API_KEY,
});

// Follow-up Question Agent
export async function followupQuestionAgent(state: InterviewStateType) {
  console.log("🔍 Follow-up Question Agent generating follow-up...");
  
  const { persona, task, evaluation } = state;
  
  const systemPrompt = `# 페르소나 정보 (상태에서 동적으로 주입)
- 역할: ${persona.role}

# 지시사항
당신은 위 페르소나에 따라 행동하는 꼬리질문 전문가입니다. 당신의 유일한 임무는 사용자의 답변을 분석하여 더 깊이 있는 이해를 위한 꼬리질문을 생성하는 것입니다. 답변의 모호한 부분을 명확히 하거나, 실제 경험과 이론적 지식을 구분하는 질문, 또는 답변의 한계를 탐색하는 질문을 만드세요.

**핵심 기능:**
- 답변 분석 및 약점 식별
- 이론과 실무 경험 구분 질문
- 모호한 답변 명확화 요청
- 답변의 한계 및 예외 상황 탐색

**현재 상황:**
- 현재 질문: ${task.current_question?.text || "없음"}
- 사용자 답변: ${task.current_answer || "없음"}
- 이전 평가: ${evaluation.last_evaluation ? `점수 ${evaluation.last_evaluation.overall_score}, 부족한 부분: ${evaluation.last_evaluation.evaluations.find(e => e.score < 3)?.criterion || "없음"}` : "없음"}

당신의 출력은 오직 꼬리질문 텍스트 그 자체여야 합니다. 어떠한 인사말이나 부가 설명도 포함해서는 안 됩니다.`;

  try {
    const result = await model.invoke([
      { role: "system", content: systemPrompt },
      { role: "user", content: `사용자의 답변을 분석하여 적절한 꼬리질문을 생성하세요.` }
    ]);

    console.log(`🔍 Follow-up question generated: ${result.content}`);

    return {
      messages: [new AIMessage(result.content as string)],
      task: {
        interview_stage: "Questioning" as const
      }
    };
  } catch (error) {
    console.error("❌ Follow-up Question Agent error:", error);
    return {
      messages: [new AIMessage("죄송합니다. 꼬리질문을 생성하는 중 오류가 발생했습니다.")],
      guardrails: {
        is_safe: false,
        error_message: "Follow-up question generation failed",
        fallback_count: (state.guardrails?.fallback_count || 0) + 1
      }
    };
  }
} 