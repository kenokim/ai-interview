import { AIMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { JsonOutputParser, StringOutputParser } from "@langchain/core/output_parsers";
const reasoningPrompt = `당신은 다음 질문을 계획하는 선임 기술 면접관입니다. 당신의 목표는 관련성이 높고, 적절한 난이도이며, 이전 주제와 겹치지 않는 질문 *주제*를 도출하는 것입니다.

**면접 컨텍스트:**
- **사용자 프로필:** {user_profile}
- **현재 난이도:** {current_difficulty} (0-100, 0이 가장 쉬움, 100이 가장 어려움)
- **이전 질문 주제:** {questions_asked}

**당신의 임무:**
1.  **사용자 프로필 분석:** 'jobRole'은 무엇입니까? 이 역할의 핵심 기술은 무엇입니까?
2.  **이전 질문 검토:** 이미 다룬 주제는 무엇입니까? 아직 탐색하지 않은 관련 주제는 무엇입니까?
3.  **난이도 고려:** '현재 난이도'를 바탕으로 다음 질문에 적합한 깊이는 어느 정도입니까?
4.  **질문 주제 제안:** 분석을 바탕으로 다음 질문에 대한 *구체적인 주제*를 결정하세요.
5.  **선택 이유 설명:** 이 주제를 선택한 *이유*를 간략하게 설명하세요.

출력은 반드시 다음 구조를 따르는 유효한 JSON 객체여야 합니다:
{
  "reasoning": "당신의 사고 과정에 대한 간략한 설명.",
  "question_topic": "다음 질문에 대한 구체적인 주제."
}`;
const generationPrompt = `당신은 전문 기술 면접관입니다. 당신은 이미 사고 과정을 통해 다음 질문의 주제를 결정했습니다. 당신의 임무는 실제 질문을 만드는 것입니다.

**당신의 사고 과정 및 주제:**
- **추론:** {reasoning}
- **선택된 주제:** {question_topic}

**당신의 임무:**
- 추론 과정과 선택된 주제를 바탕으로, 단 하나의 명확하고 간결한 기술 면접 질문을 한국어로 생성하세요.
- 질문은 직접적으로 답변할 수 있어야 합니다.
- 추가적인 텍스트, 인사, 설명은 절대 추가하지 마세요. 오직 질문 자체만 생성하세요.

**질문:**`;
export const technicalQuestionAgent = async (state) => {
    console.log("기술 질문 에이전트가 질문을 생성하고 있습니다.");
    const { user_context, task } = state;
    // Dynamic Difficulty Adjustment (DDA) 로직
    let newDifficulty = task.current_difficulty;
    if (task.agent_outcome?.overall_score) {
        const score = task.agent_outcome.overall_score;
        const adjustment = (score - 3) * 5;
        newDifficulty = Math.max(0, Math.min(100, task.current_difficulty + adjustment));
        console.log(`난이도 조정: ${task.current_difficulty} -> ${newDifficulty} (평가 점수: ${score})`);
    }
    const model = new ChatGoogleGenerativeAI({
        model: "gemini-2.0-flash",
        temperature: 0.7,
    });
    const questionsAskedText = task.questions_asked
        .map(q => typeof q === 'string' ? q : q.text || JSON.stringify(q))
        .join(", ") || "없음";
    // 1. Chain of Thought - Reasoning Step
    console.log("1단계: 질문 주제 및 이유 추론 중...");
    const reasoningParser = new JsonOutputParser();
    const reasoningChain = model.pipe(reasoningParser);
    const reasoningFormattedPrompt = reasoningPrompt
        .replace("{user_profile}", JSON.stringify(user_context.profile) || "정보 없음")
        .replace("{current_difficulty}", newDifficulty.toString())
        .replace("{questions_asked}", questionsAskedText);
    const reasoningResult = await reasoningChain.invoke(reasoningFormattedPrompt);
    console.log("추론 결과:", reasoningResult);
    // 2. Chain of Thought - Generation Step
    console.log("2단계: 최종 질문 생성 중...");
    const generationParser = new StringOutputParser();
    const generationChain = model.pipe(generationParser);
    const generationFormattedPrompt = generationPrompt
        .replace("{reasoning}", reasoningResult.reasoning)
        .replace("{question_topic}", reasoningResult.question_topic);
    const question = await generationChain.invoke(generationFormattedPrompt);
    console.log(`기술 질문이 생성되었습니다: ${question}`);
    const questionObj = {
        text: question,
        type: "technical",
        difficulty: newDifficulty,
        topic: reasoningResult.question_topic
    };
    return {
        ...state,
        messages: [...state.messages, new AIMessage(question)],
        task: {
            ...state.task,
            current_question: questionObj,
            questions_asked: [...state.task.questions_asked, questionObj],
            previous_difficulty: task.current_difficulty,
            current_difficulty: newDifficulty,
            interview_stage: "Questioning"
        }
    };
};
//# sourceMappingURL=technicalQuestionAgent.js.map