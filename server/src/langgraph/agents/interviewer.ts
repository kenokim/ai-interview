import { InterviewStateType } from "../../types/state.js";
import { HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { RunnableLambda } from "@langchain/core/runnables";
import { createSupervisorAgent } from "./supervisorAgent.js";
import { InitialStateBuilder } from '../state/InitialStateBuilder.js';
import { InterviewDataService } from '../../services/InterviewDataService.js';


const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash-exp",
  maxOutputTokens: 2048,
  temperature: 0.7,
  apiKey: process.env.GOOGLE_API_KEY,
});

/**
 * 슈퍼바이저 역할을 하는 Runnable을 생성합니다.
 * LLM을 사용하여 다음 행동을 결정합니다.
 * @param model 사용할 ChatGoogleGenerativeAI 모델
 * @returns 슈퍼바이저 Runnable
 */
const createSupervisorRunnable = (model: ChatGoogleGenerativeAI) => {
  const supervisorChain = createSupervisorAgent(model);

  const route = async (state: InterviewStateType): Promise<{ next: string }> => {
    const { messages } = state;
    const lastMessage = messages[messages.length - 1] as HumanMessage;

    console.log("🤖 Supervisor agent 호출 중...");
    console.log("🤖 Input:", lastMessage.content);

    const response = await supervisorChain.invoke({
      chat_history: messages.map((msg: BaseMessage) => `${msg._getType()}: ${msg.content}`).join('\n'),
      input: lastMessage.content,
      interview_stage: state.task.interview_stage
    });

    // Handle complex response content from Gemini
    const responseContent = (
      Array.isArray(response.content)
        ? response.content.map(part => (part as any).text || '').join('')
        : response.content
    ) as string;
    
    console.log("🤖 Supervisor 원본 응답:", responseContent);
    
    const lowercasedContent = responseContent.toLowerCase().trim();
    console.log("🤖 정규화된 응답:", lowercasedContent);
    
    let nextNode = "Interviewer"; // 기본값
    
    if (lowercasedContent.includes("finish")) {
      nextNode = "FINISH";
    } else if (lowercasedContent.includes("technical")) {
      nextNode = "technical_question_agent";
    } else if (lowercasedContent.includes("followup")) {
      nextNode = "followup_question_agent";
    } else if (lowercasedContent.includes("evaluate")) {
      nextNode = "evaluate_answer";
    } else {
      nextNode = "Interviewer";
    }
    
    console.log("🤖 최종 결정:", nextNode);
    
    return { next: nextNode };
  };

  return new RunnableLambda({ func: route });
};


const supervisorAgent = createSupervisorRunnable(model);

// Supervisor 노드는 다음에 어떤 워커를 실행할지 결정하고 상태를 업데이트합니다.
export const supervisorNode = async (state: InterviewStateType): Promise<Pick<InterviewStateType, 'next'>> => {
  console.log("🎯 Supervisor node 실행 중...");
  console.log("🎯 현재 상태:", {
    interview_stage: state.task.interview_stage,
    messages_count: state.messages.length,
    last_message: state.messages[state.messages.length - 1]?.content
  });
  
  const supervisorResult = await supervisorAgent.invoke(state);
  console.log("🎯 Supervisor 결정:", supervisorResult);
  
  return {
    next: supervisorResult.next,
  };
};

// Interviewer 노드는 일반적인 대화 흐름을 담당합니다.
export const interviewerNode = async (state: InterviewStateType) => {
  // 이 노드는 현재 AI의 응답을 상태에 추가하는 역할을 할 수 있습니다.
  // 지금은 다음 질문을 유도하는 메시지를 추가합니다.
  return { messages: [new AIMessage("다음 질문에 답변해주세요.")] };
};


// 사용자 입력을 처리하는 헬퍼 함수
export async function processUserInput(
  graph: any, // ReturnType<InterviewGraph['compile']>,
  state: InterviewStateType,
  userInput: string
): Promise<InterviewStateType> {
  console.log("🔄 Processing user input:", userInput);
  
  // 사용자 메시지를 상태에 추가합니다.
  const updatedState = {
    ...state,
    messages: [...state.messages, new HumanMessage(userInput)],
    task: {
      ...state.task,
      current_answer: userInput
    },
    evaluation: {
      ...state.evaluation,
      turn_count: state.evaluation.turn_count + 1
    }
  };

  // 업데이트된 상태로 그래프를 실행합니다.
  const result = await graph.invoke(updatedState);
  
  console.log("✅ Graph execution completed");
  return result;
}

// 인터뷰를 시작하는 헬퍼 함수
export async function startInterview(
  graph: any, // ReturnType<InterviewGraph['compile']>,
  initialState?: Partial<InterviewStateType>
): Promise<InterviewStateType> {
  console.log("🚀 Starting interview...");
  
  // 의존성을 생성하고 주입합니다.
  const dataService = new InterviewDataService();
  const stateBuilder = new InitialStateBuilder(dataService);
  const state = await stateBuilder.build(initialState);

  // 인터뷰를 시작합니다.
  const result = await graph.invoke(state);
  
  console.log("✅ Interview started successfully");
  return result;
} 