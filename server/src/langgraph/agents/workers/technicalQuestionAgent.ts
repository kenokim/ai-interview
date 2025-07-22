import { AIMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { JsonOutputParser, StringOutputParser } from "@langchain/core/output_parsers";
import { RunnablePassthrough } from "@langchain/core/runnables";
import {
  InterviewState,
} from "../../../types/state.js";

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

export const technicalQuestionAgent = async (state: InterviewState) => {
  console.log("기술 질문 에이전트가 질문을 생성하고 있습니다.");
  const { user_context, task } = state;

  // 이전 평가 결과에 따른 질문 유형 결정
  const isFollowUpNeeded = task.agent_outcome?.is_sufficient === false;
  const questionType = isFollowUpNeeded ? "follow_up" : "new_question";
  
  console.log(`질문 유형: ${questionType} (이전 답변 충족도: ${task.agent_outcome?.is_sufficient})`);

  // Dynamic Difficulty Adjustment (DDA) 로직
  let newDifficulty = task.current_difficulty;
  if (task.agent_outcome?.overall_score) {
    const score = task.agent_outcome.overall_score;
    
    if (questionType === "follow_up") {
      // 꼬리질문이나 쉬운 질문의 경우 난이도를 더 크게 조정
      const adjustment = score < 2 ? -15 : -10; // 점수가 매우 낮으면 크게 낮춤
      newDifficulty = Math.max(0, Math.min(100, task.current_difficulty + adjustment));
      console.log(`꼬리질문/쉬운 질문으로 난이도 조정: ${task.current_difficulty} -> ${newDifficulty}`);
    } else {
      // 일반적인 다음 질문의 경우
      const adjustment = (score - 3) * 5;
      newDifficulty = Math.max(0, Math.min(100, task.current_difficulty + adjustment));
      console.log(`다음 질문으로 난이도 조정: ${task.current_difficulty} -> ${newDifficulty} (평가 점수: ${score})`);
    }
  }

  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0.7,
  });

  const questionsAskedText = task.questions_asked
    .map(q => typeof q === 'string' ? q : q.text || JSON.stringify(q))
    .join(", ") || "없음";

  let question = "";
  let questionTopic = "";

  if (questionType === "follow_up") {
    // 꼬리질문 또는 더 쉬운 질문 생성
    console.log("꼬리질문 또는 더 쉬운 질문을 생성합니다...");
    const parser = new StringOutputParser();
    const chain = model.pipe(parser);
    
    const followUpPrompt = `당신은 전문 기술 면접관입니다. 이전 질문에 대한 사용자의 답변이 불충분했습니다.

**이전 질문:** {previous_question}
**사용자의 답변 평가 점수:** {evaluation_score} (1-5점)
**사용자 프로필:** {user_profile}
**새로운 난이도:** {new_difficulty} (0-100, 낮을수록 쉬움)

**당신의 임무:**
${task.agent_outcome?.overall_score < 2 
  ? `1. 먼저 "네, 그럼 조금 더 쉬운 질문을 드리겠습니다. 이해하기 쉬운 기본적인 개념부터 차근차근 접근해 보겠습니다."라고 피드백을 제공하세요.
2. 그 다음 이전 질문보다 훨씬 쉬운 기본 개념 질문을 생성하세요.`
  : `1. 먼저 "음, 조금 더 구체적으로 설명해 주실 수 있을까요? 혹시 실제 경험이나 예시가 있다면 함께 말씀해 주세요."라고 피드백을 제공하세요.
2. 그 다음 이전 질문과 관련된 꼬리질문이나 구체적인 예시를 요구하는 질문을 생성하세요.`
}

**응답 형식:**
[피드백 메시지]

[새로운 질문]

응답:`;

    const formattedFollowUpPrompt = followUpPrompt
      .replace("{previous_question}", task.current_question?.text || "이전 질문")
      .replace("{evaluation_score}", task.agent_outcome?.overall_score?.toString() || "알 수 없음")
      .replace("{user_profile}", JSON.stringify(user_context.profile) || "정보 없음")
      .replace("{new_difficulty}", newDifficulty.toString());

    question = await chain.invoke(formattedFollowUpPrompt);
    questionTopic = task.agent_outcome?.overall_score < 2 ? "기본 개념 (쉬운 질문)" : "꼬리질문";
    
  } else {
    // 일반적인 새로운 질문 생성 (기존 로직)
    console.log("1단계: 질문 주제 및 이유 추론 중...");
    const reasoningParser = new JsonOutputParser<{ reasoning: string, question_topic: string }>();
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

    question = await generationChain.invoke(generationFormattedPrompt);
    questionTopic = reasoningResult.question_topic;
  }

  console.log(`기술 질문이 생성되었습니다: ${question}`);
  
  const questionObj = {
    text: question,
    type: questionType === "follow_up" ? "follow_up" : "technical",
    difficulty: newDifficulty,
    topic: questionTopic
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