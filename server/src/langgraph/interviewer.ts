import { StateGraph, END, START } from "@langchain/langgraph";
import { InterviewStateAnnotation, InterviewStateType } from "../types/state.js";
import { createSupervisor } from "./supervisor.js";
import { technicalQuestionAgent } from "./workers/technicalQuestionAgent.js";
import { followupQuestionAgent } from "./workers/followupQuestionAgent.js";
import { evaluateAnswer } from "./workers/evaluateAnswer.js";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const model = new ChatGoogleGenerativeAI({
  modelName: "gemini-2.0-flash",
  maxOutputTokens: 2048,
  temperature: 0.7,
  apiKey: process.env.GOOGLE_API_KEY,
});

const supervisorAgent = createSupervisor(model);

// 메인 인터뷰 그래프를 생성합니다.
export function createInterviewGraph() {
  const graph = new StateGraph(InterviewStateAnnotation)
    .addNode("supervisor", supervisorAgent)
    .addNode("technical_question_agent", technicalQuestionAgent)
    .addNode("followup_question_agent", followupQuestionAgent)
    .addNode("evaluate_answer", evaluateAnswer);

  // 엣지를 추가합니다.
  graph.addEdge(START, "supervisor");
  
  // 슈퍼바이저로부터의 조건부 라우팅
  graph.addConditionalEdges(
    "supervisor",
    (state: InterviewStateType) => {
      const nextWorker = state.flow_control.next_worker;
      
      // 오류 케이스를 처리합니다.
      if (state.guardrails?.error_message) {
        return END;
      }
      
      // 슈퍼바이저의 결정에 따라 라우팅합니다.
      if (nextWorker === "technical_question_agent") {
        return "technical_question_agent";
      } else if (nextWorker === "followup_question_agent") {
        return "followup_question_agent";
      } else {
        return END;
      }
    },
    {
      technical_question_agent: "technical_question_agent",
      followup_question_agent: "followup_question_agent",
      [END]: END
    }
  );

  // 기술 질문 후, 사용자가 답변을 제공했는지 평가합니다.
  graph.addConditionalEdges(
    "technical_question_agent",
    (state: InterviewStateType) => {
      // 사용자가 답변을 제공한 경우, 먼저 평가합니다.
      if (state.task.current_answer) {
        return "evaluate_answer";
      }
      // 그렇지 않으면, 사용자 입력을 기다립니다 (슈퍼바이저로 돌아감).
      return "supervisor";
    },
    {
      evaluate_answer: "evaluate_answer",
      supervisor: "supervisor"
    }
  );

  // 후속 질문 후, 사용자가 답변을 제공했는지 평가합니다.
  graph.addConditionalEdges(
    "followup_question_agent",
    (state: InterviewStateType) => {
      // 사용자가 답변을 제공한 경우, 먼저 평가합니다.
      if (state.task.current_answer) {
        return "evaluate_answer";
      }
      // 그렇지 않으면, 사용자 입력을 기다립니다 (슈퍼바이저로 돌아감).
      return "supervisor";
    },
    {
      evaluate_answer: "evaluate_answer",
      supervisor: "supervisor"
    }
  );

  // 평가 후에는 항상 다음 결정을 위해 슈퍼바이저로 돌아갑니다.
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
    ...initialState
  };

  // 인터뷰를 시작합니다.
  const result = await graph.invoke(state);
  
  console.log("✅ Interview started successfully");
  return result;
} 