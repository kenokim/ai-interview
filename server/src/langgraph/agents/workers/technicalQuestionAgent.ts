import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AIMessage } from "@langchain/core/messages";
import { InterviewStateType } from "../../../types/state.js";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash-exp",
  temperature: 0.7,
  apiKey: process.env.GOOGLE_API_KEY,
});

// Technical Question Agent
export async function technicalQuestionAgent(state: InterviewStateType) {
  console.log("🔧 Technical Question Agent generating question...");
  
  const { persona, task, evaluation, user_context } = state;
  
  const systemPrompt = `# 페르소나 정보 (상태에서 동적으로 주입)
- 역할: ${persona.role}

# 지시사항
당신은 위 페르소나에 따라 행동하는 소크라테스 방식의 적응형 기술 면접관입니다. 당신의 유일한 임무는 지원자의 기술 역량을 정확하게 측정하기 위해 가장 적절한 다음 질문을 선택하는 것입니다. 당신은 대화 상대가 아니며, 당신의 출력은 오직 질문 텍스트 그 자체여야 합니다. 어떠한 인사말이나 부가 설명도 포함해서는 안 됩니다.

**세부 지시사항:**
1. **상태 분석**: 주어진 InterviewState 정보, 특히 evaluation.last_evaluation (가장 최근 평가 결과), task.questions_asked (이미 출제된 질문), task.question_pool (남은 질문 목록), user_context.profile (사용자 기술 스택)을 분석합니다.

2. **질문 선택 (동적 난이도 조절)**:
   - **첫 질문**: last_evaluation이 없다면, question_pool에서 '중간' 난이도의 질문을 선택합니다.
   - **이전 답변 우수 (overall_score >= 4.0)**: 아직 다루지 않은 새로운 주제에서 더 어려운 질문을 선택하여 지식의 깊이를 탐색합니다.
   - **이전 답변 미흡 (overall_score < 3.0)**: 현재 주제와 관련된 더 근본적인 개념을 묻는 질문이나 더 간단한 후속 질문을 선택하여, 사용자가 자신감을 회복하고 지식의 격차를 메울 기회를 제공합니다.

3. **질문 재구성 (Agentic RAG)**:
   - 선택된 질문을 제시하기 전, user_context.profile에 기술 스택 정보가 있는지 확인합니다.
   - 만약 프로필에 특정 기술이 있고 선택된 질문이 관련 주제라면, 질문을 구체화하세요.

**현재 상태:**
- 사용자 기술 스택: ${user_context.profile?.tech_stack?.join(", ") || "정보 없음"}
- 이전 평가 점수: ${evaluation.last_evaluation?.overall_score || "없음"}
- 질문한 수: ${task.questions_asked.length}/${task.question_pool.length}
- 이미 질문한 주제: ${task.questions_asked.map(q => q.category).join(", ") || "없음"}`;

  try {
    // Select appropriate question based on state
    const availableQuestions = task.question_pool.filter(
      q => !task.questions_asked.some(asked => asked.id === q.id)
    );

    if (availableQuestions.length === 0) {
      return {
        messages: [new AIMessage("모든 질문이 완료되었습니다. 면접을 마무리하겠습니다.")],
        task: {
          interview_stage: "Finished" as const
        }
      };
    }

    // Simple question selection logic (can be enhanced with more sophisticated logic)
    let selectedQuestion = availableQuestions[0];
    
    // Adjust based on previous evaluation
    if (evaluation.last_evaluation) {
      if (evaluation.last_evaluation.overall_score >= 4.0) {
        // Look for harder questions or different categories
        const harderQuestions = availableQuestions.filter(q => q.difficulty === "hard");
        if (harderQuestions.length > 0) {
          selectedQuestion = harderQuestions[0];
        }
      } else if (evaluation.last_evaluation.overall_score < 3.0) {
        // Look for easier questions or same category
        const easierQuestions = availableQuestions.filter(q => q.difficulty === "easy");
        if (easierQuestions.length > 0) {
          selectedQuestion = easierQuestions[0];
        }
      }
    }

    // Customize question based on user's tech stack
    let questionText = selectedQuestion.text;
    if (user_context.profile?.tech_stack?.includes("JavaScript") && selectedQuestion.category === "JavaScript") {
      questionText = `JavaScript 관련 질문입니다: ${questionText}`;
    }

    const result = await model.invoke([
      { role: "system", content: systemPrompt },
      { role: "user", content: `다음 질문을 사용자 맞춤형으로 제시하세요: ${questionText}` }
    ]);

    console.log(`🔧 Technical question generated: ${result.content}`);

    return {
      messages: [new AIMessage(result.content as string)],
      task: {
        current_question: selectedQuestion,
        interview_stage: "Questioning" as const,
        questions_asked: [...task.questions_asked, selectedQuestion]
      }
    };
  } catch (error) {
    console.error("❌ Technical Question Agent error:", error);
    return {
      messages: [new AIMessage("죄송합니다. 질문을 생성하는 중 오류가 발생했습니다.")],
      guardrails: {
        is_safe: false,
        error_message: "Technical question generation failed",
        fallback_count: (state.guardrails?.fallback_count || 0) + 1
      }
    };
  }
} 