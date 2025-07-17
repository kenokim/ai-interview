import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { InterviewStateType } from "../types/state.js";
import { createSupervisorChain } from "./chains/supervisorChain.js";

// 모델을 초기화합니다.
const model = new ChatGoogleGenerativeAI({
  modelName: "gemini-pro",
  maxOutputTokens: 2048,
  temperature: 0.7,
});

// 슈퍼바이저 체인을 생성합니다.
const supervisorChain = createSupervisorChain(model);

function getMessages(state: InterviewStateType): BaseMessage[] {
  return state.messages;
}

export async function supervisorAgent(state: InterviewStateType) {
  const lastMessage = state.messages[state.messages.length - 1];
  
  const response = await supervisorChain.invoke({
    chat_history: getMessages(state).map(msg => `${msg._getType()}: ${msg.content}`).join('\n'),
    input: lastMessage.content,
    interview_stage: state.task.interview_stage,
  });

  // 간단한 키워드 기반 라우팅 로직 (개선 필요)
  const responseContent = typeof response.content === 'string' ? response.content.toLowerCase() : '';
  let nextWorker;

  if (responseContent.includes("technical")) {
    nextWorker = "technical_question_agent";
  } else if (responseContent.includes("followup")) {
    nextWorker = "followup_question_agent";
  } else if (responseContent.includes("finish")) {
    nextWorker = "FINISH";
  } else {
    // 기본값 또는 다른 로직
    nextWorker = "technical_question_agent"; 
  }

  return {
    ...state,
    flow_control: {
      ...state.flow_control,
      next_worker: nextWorker
    },
    messages: [
      ...state.messages,
      new AIMessage({
        content: `Routing to ${nextWorker}.`,
        name: "Supervisor"
      })
    ]
  };
} 