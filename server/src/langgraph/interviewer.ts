import { StateGraph, END, START } from "@langchain/langgraph";
import { InterviewStateAnnotation, InterviewStateType } from "../types/state.js";
import { technicalQuestionAgent } from "./workers/technicalQuestionAgent.js";
import { followupQuestionAgent } from "./workers/followupQuestionAgent.js";
import { evaluateAnswer } from "./workers/evaluateAnswer.js";
import { HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { RunnableLambda } from "@langchain/core/runnables";
import { createSupervisorAgent } from "./supervisor/supervisorAgent.js";


const model = new ChatGoogleGenerativeAI({
  modelName: "gemini-2.0-flash",
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
    
    const lowercasedContent = responseContent.toLowerCase();
    
    if (lowercasedContent.includes("finish")) {
      return { next: "FINISH" };
    } else if (lowercasedContent.includes("technical")) {
      return { next: "technical_question_agent" };
    } else if (lowercasedContent.includes("followup")) {
      return { next: "followup_question_agent" };
    } else {
      return { next: "Interviewer" };
    }
  };

  return new RunnableLambda({ func: route });
};


const supervisorAgent = createSupervisorRunnable(model);

// Supervisor 노드는 다음에 어떤 워커를 실행할지 결정하고 상태를 업데이트합니다.
const supervisorNode = async (state: InterviewStateType): Promise<Pick<InterviewStateType, 'next'>> => {
  const supervisorResult = await supervisorAgent.invoke(state);
  return {
    next: supervisorResult.next,
  };
};

// Interviewer 노드는 일반적인 대화 흐름을 담당합니다.
const interviewerNode = async (state: InterviewStateType) => {
  // 이 노드는 현재 AI의 응답을 상태에 추가하는 역할을 할 수 있습니다.
  // 지금은 다음 질문을 유도하는 메시지를 추가합니다.
  return { messages: [new AIMessage("다음 질문에 답변해주세요.")] };
};

// 메인 인터뷰 그래프를 생성합니다.
export function createInterviewGraph() {
  const graph = new StateGraph(InterviewStateAnnotation)
    .addNode("supervisor", supervisorNode)
    .addNode("Interviewer", interviewerNode)
    .addNode("technical_question_agent", technicalQuestionAgent)
    .addNode("followup_question_agent", followupQuestionAgent)
    .addNode("evaluate_answer", evaluateAnswer);

  // 그래프의 시작점을 supervisor로 설정합니다.
  graph.addEdge(START, "supervisor");

  // supervisor의 결정에 따라 다음 노드로 분기합니다.
  graph.addConditionalEdges(
    "supervisor",
    (state: InterviewStateType) => state.next,
    {
      Interviewer: "Interviewer",
      technical_question_agent: "technical_question_agent",
      followup_question_agent: "followup_question_agent",
      evaluate_answer: "evaluate_answer",
      FINISH: END,
    }
  );

  // 각 워커 노드가 실행된 후에는 다시 supervisor로 돌아가 다음 행동을 결정합니다.
  graph.addEdge("Interviewer", "supervisor");
  graph.addEdge("technical_question_agent", "supervisor");
  graph.addEdge("followup_question_agent", "supervisor");
  graph.addEdge("evaluate_answer", "supervisor");

  return graph.compile();
}

// 사용자 입력을 처리하는 헬퍼 함수
export async function processUserInput(
  graph: ReturnType<typeof createInterviewGraph>,
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
  graph: ReturnType<typeof createInterviewGraph>,
  initialState?: Partial<InterviewStateType>
): Promise<InterviewStateType> {
  console.log("🚀 Starting interview...");
  
  // 초기 상태를 생성합니다.
  const state: InterviewStateType = {
    user_context: initialState?.user_context || {
      user_id: "default_user",
      profile: {
        name: "Test User",
        experience_level: "mid-level",
        tech_stack: ["JavaScript", "React", "Node.js"],
        preferred_language: "JavaScript"
      }
    },
    messages: [new HumanMessage("안녕하세요, 면접을 시작하겠습니다.")],
    persona: initialState?.persona || {
      name: "Dr. Sarah Chen",
      role: "Senior Technical Interviewer",
      backstory: "A seasoned software engineer with 15+ years of experience in full-stack development and technical leadership.",
      style_guidelines: [
        "Ask follow-up questions to understand depth of knowledge",
        "Provide constructive feedback", 
        "Maintain professional yet approachable tone",
        "Focus on problem-solving approach over memorized answers"
      ],
      current_mood: "professional"
    },
    guardrails: {
      is_safe: true,
      fallback_count: 0
    },
    proactive: {
      trigger_event_type: "interview_start",
      trigger_event_id: "default",
      metadata: {}
    },
    flow_control: {
      next_worker: undefined
    },
    task: {
      interview_stage: "Greeting",
      question_pool: [
        {
          id: "js_closures",
          text: "Can you explain what closures are in JavaScript and provide an example?",
          category: "JavaScript",
          difficulty: "medium",
          expected_topics: ["lexical scoping", "function scope", "practical examples"]
        },
        {
          id: "react_hooks",
          text: "What are React Hooks and how do they differ from class components?",
          category: "React", 
          difficulty: "medium",
          expected_topics: ["useState", "useEffect", "lifecycle methods"]
        },
        {
          id: "async_js",
          text: "Explain the difference between Promises and async/await in JavaScript.",
          category: "JavaScript",
          difficulty: "medium",
          expected_topics: ["asynchronous programming", "error handling", "syntax differences"]
        }
      ],
      questions_asked: [],
      current_question: undefined,
      current_answer: undefined,
      agent_outcome: undefined,
      tool_outputs: undefined
    },
    evaluation: {
      turn_count: 0,
      last_user_feedback: undefined,
      task_successful: undefined,
      final_evaluation_summary: undefined,
      last_evaluation: undefined
    },
    next: 'supervisor', // Set the initial next node
    ...initialState
  };

  // 인터뷰를 시작합니다.
  const result = await graph.invoke(state);
  
  console.log("✅ Interview started successfully");
  return result;
} 