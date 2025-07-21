import { AIMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  InterviewState,
} from "../../../types/state.js";

const technicalQuestionPrompt = `당신은 기술 면접관입니다. 제공된 면접 컨텍스트를 바탕으로, 후보자에게 할 기술 질문을 생성해 주세요.

면접 컨텍스트:
- 사용자 프로필: {user_profile}
- 현재 난이도: {current_difficulty} (0-100)
- 이전 질문들: {questions_asked}

규칙:
- 이전과 겹치지 않는 새로운 질문을 생성해야 합니다.
- 현재 난이도에 맞는 적절한 수준의 질문을 생성하세요.
- 질문은 하나만 생성합니다.
- 질문 외에 다른 말은 하지 마세요.

질문:`;

export const technicalQuestionAgent = async (state: InterviewState) => {
  console.log("기술 질문 에이전트가 질문을 생성하고 있습니다.");
  const { user_context, task, evaluation } = state;

  // Dynamic Difficulty Adjustment (DDA) 로직
  let newDifficulty = task.current_difficulty;
  
  if (task.agent_outcome?.overall_score) {
    const score = task.agent_outcome.overall_score;
    const adjustment = (score - 3) * 5; // 5점->+10, 4점->+5, 3점->0, 2점->-5, 1점->-10
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

  const formattedPrompt = technicalQuestionPrompt
    .replace("{user_profile}", JSON.stringify(user_context.profile) || "정보 없음")
    .replace("{current_difficulty}", newDifficulty.toString())
    .replace("{questions_asked}", questionsAskedText);

  const response = await model.invoke(formattedPrompt);
  const question = response.content.toString();

  console.log(`기술 질문이 생성되었습니다: ${question}`);
  
  const questionObj = {
    text: question,
    type: "technical",
    difficulty: newDifficulty
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