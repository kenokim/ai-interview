import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";
// Evaluation Schema for structured output
const CriterionEvaluationSchema = z.object({
    criterion: z.string().describe("평가 기준의 이름 (예: '정확성 및 기술적 깊이')"),
    score: z.number().min(1).max(5).describe("해당 기준에 대한 1(미흡)에서 5(우수) 사이의 점수"),
    reasoning: z.string().describe("점수에 대한 간결한 근거. 답변 내용에서 직접적인 증거를 인용해야 함."),
});
export const EvaluationResultSchema = z.object({
    overall_score: z.number().describe("모든 기준의 가중 평균 점수."),
    evaluations: z.array(CriterionEvaluationSchema).describe("각 기준별 평가 결과 목록."),
    is_sufficient: z.boolean().describe("답변이 최소 요구 수준(예: 전체 점수 3.0 이상)을 충족했는지 여부."),
});
const evaluationModel = new ChatGoogleGenerativeAI({
    modelName: "gemini-2.0-flash",
    temperature: 0,
    apiKey: process.env.GOOGLE_API_KEY,
}).withStructuredOutput(EvaluationResultSchema);
// Helper function to evaluate user answers (used internally)
export async function evaluateAnswer(state) {
    console.log("📊 Evaluating user answer...");
    const { persona, task } = state;
    const systemPrompt = `# 페르소나 정보 (상태에서 동적으로 주입)
- 역할: ${persona.role}

# 지시사항
당신은 위 페르소나에 명시된, 극도로 엄격하고 객관적인 평가 엔진입니다. 당신은 의견을 가지지 않으며, 오직 제공된 평가 기준표(Rubric)를 기계적인 정밀함으로 따릅니다. 당신의 유일한 기능은 주어진 [사용자 답변]을 [현재 질문]의 의도와 아래 [평가 기준표]에 명시된 기준에 따라 분석하여, 구조화된 JSON 객체를 생성하는 것입니다.

**[평가 기준표 (Evaluation Rubric)]**

| 기준 (Criterion) | 1: 미흡 (Poor) | 3: 보통 (Average) | 5: 우수 (Excellent) |
|:--- |:--- |:--- |:--- |
| **문제 이해도** | 질문의 핵심을 오해했거나 다른 문제에 대해 답변함. | 질문의 주된 목표는 이해했으나, 핵심 제약 조건이나 엣지 케이스를 놓침. | 질문에 담긴 명시적, 암묵적 요구사항과 엣지 케이스까지 깊고 미묘하게 이해했음을 보여줌. |
| **정확성 및 기술적 깊이** | 제안된 해결책에 근본적인 결함이 있거나, 작동하지 않음. 피상적인 답변을 제공함. | 전반적인 접근 방식은 맞지만, 중요한 버그나 논리적 오류, 부정확한 내용이 포함됨. | 기술적으로 정확하고 견고하며 엣지 케이스를 적절히 처리함. 시간/공간 복잡도를 분석하고 대안과 비교함. |
| **명확성 및 의사소통** | 설명이 혼란스럽고 따라가기 어려우며, 부정확한 용어를 사용하거나 구조가 없음. | 설명은 이해 가능하지만, 체계적이지 않거나 장황하고 정밀함이 부족할 수 있음. | 설명이 명확하고, 간결하며, 잘 구조화되어 있고, 정확한 기술 용어를 효과적으로 사용함. |
| **구체적인 근거 및 예시** | 주장을 뒷받침할 근거가 전혀 없거나 관련 없는 예시를 사용함. | 일반적인 수준의 근거를 제시하지만, 주장을 완전히 뒷받침하기에는 불충분함. | 자신의 주장을 뒷받침하기 위해 구체적이고 적절한 코드 예시나 실제 사례를 들어 설득력 있게 설명함. |

**현재 평가 대상:**
- 질문: ${task.current_question?.text || "없음"}
- 사용자 답변: ${task.current_answer || "없음"}`;
    try {
        const result = await evaluationModel.invoke([
            { role: "system", content: systemPrompt },
            { role: "user", content: "위 답변을 평가 기준표에 따라 분석하고 JSON 형태로 결과를 제공하세요." }
        ]);
        console.log(`📊 Evaluation completed: ${result.overall_score}`);
        return {
            evaluation: {
                last_evaluation: result,
                turn_count: state.evaluation.turn_count + 1
            }
        };
    }
    catch (error) {
        console.error("❌ Evaluation error:", error);
        return {
            guardrails: {
                is_safe: false,
                error_message: "Answer evaluation failed",
                fallback_count: (state.guardrails?.fallback_count || 0) + 1
            }
        };
    }
}
//# sourceMappingURL=evaluateAnswer.js.map