import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

import { InterviewState } from "../../../types/state.js";

/**
 * conversationAgent
 * greeting 이후 사용자의 모든 입력을 처리한다.
 * - 사용자가 "평가" 같은 메타 명령을 주지 않는 한, 새 기술 질문을 생성한다.
 * - 이전 evaluation 결과에 따라 난이도를 조정(DDA)하는 로직은 technicalQuestionAgent 에서 가져왔다.
 */

const singlePrompt = `당신은 사용자의 긴장을 풀어주면서도 전문성을 잃지 않는 베테랑 기술 면접관입니다. 당신의 목표는 딱딱한 질의응답이 아닌, 자연스러운 대화를 통해 지원자의 진짜 실력을 파악하는 것입니다.

[면접 컨텍스트]
- 이전 대화: {last_message}
- 사용자 프로필: {user_profile}
- 현재 난이도: {current_difficulty} (0-100, 0이 가장 쉬움, 100이 가장 어려움)
- 이미 다룬 주제: {questions_asked}

[당신의 임무]
위 컨텍스트를 종합적으로 분석하여, 다음 3가지 행동 중 현재 상황에 가장 적절한 것을 *하나만* 선택하여 응답하세요.

1.  **[대화]**: 기술적인 내용과 무관한 가벼운 대화로 긴장을 풀어주거나, 이전 답변에 대한 긍정적 반응을 보여주세요. (예: "방금 답변에서 보여주신 열정이 인상 깊네요.", "잠시 쉬어가도 좋습니다. 편하게 생각하세요.")
2.  **[격려]**: 지원자가 자신감을 잃거나 답변을 어려워하는 기색이 보일 때, 할 수 있다는 용기를 북돋아 주세요. (예: "괜찮습니다. 모르는 부분이 있을 수 있죠. 함께 고민해볼까요?", "어려운 질문이었는데, 차분하게 접근하시는 모습이 좋습니다.")
3.  **[질문]**: 기술 역량을 평가하기 위한 새로운 질문을 던지세요.
    - 이전 주제와 겹치지 않게 출제하세요.
    - 사용자 프로필과 난이도를 고려하여 질문의 깊이를 조절하세요.
    - 불필요한 인사나 설명 없이 간결한 질문 문장만 생성하세요.

[출력 형식]
반드시 아래 형식 중 하나로 응답해야 합니다.
- [대화] 안녕하세요, 면접관입니다.
- [격려] 힘내세요!
- [질문] React의 상태 관리에 대해 설명해주세요.

[응답]`;

export const conversationAgent = async (state: InterviewState): Promise<Partial<InterviewState>> => {
  console.log("💬 [conversationAgent] 실행");

  const { user_context, task, messages } = state;
  const last = messages[messages.length - 1];

  // Human 입력이 아니면 그대로 반환
  if (!(last instanceof HumanMessage)) return state;

  // 메타 명령: "평가" 요청이 들어오면 단순 ACK
  if (last.content.toString().includes("평가")) {
    const ack = new AIMessage("평가 기능은 현재 단일 에이전트 모드에서 제공되지 않습니다. 다음 질문으로 넘어가겠습니다.");
    return { ...state, messages: [...messages, ack] };
  }

  // 난이도 조정 (아주 단순)
  const currentDifficulty = task.current_difficulty ?? 50;
  const questionsAskedText = task.questions_asked?.map(q => typeof q === "string" ? q : q.text).join(", ") || "없음";

  // 하나의 프롬프트로 질문을 생성 (stream)
    const finalPrompt = singlePrompt
    .replace("{last_message}", last.content.toString())
    .replace("{user_profile}", JSON.stringify(user_context.profile))
    .replace("{current_difficulty}", currentDifficulty.toString())
    .replace("{questions_asked}", questionsAskedText);

  const streamModel = new ChatGoogleGenerativeAI({ 
    model: "gemini-2.0-flash", 
    temperature: 0.7, 
    streaming: true 
  });
  
  let question = "";
  for await (const chunk of (streamModel.stream(finalPrompt) as any)) {
    question += chunk.content;
  }
  console.log("✅ 질문 생성 완료:", question);

  const aiMsg = new AIMessage(question);
  const questionObj = { text: question, type: "technical", difficulty: currentDifficulty, topic: "auto" };

  return {
    ...state,
    messages: [...messages, aiMsg],
    task: {
      ...task,
      current_question: questionObj,
      questions_asked: [...(task.questions_asked || []), questionObj],
      interview_stage: "Questioning",
      current_difficulty: currentDifficulty,
    },
  };
};
