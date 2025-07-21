import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  InterviewState,
} from "../../types/state.js";

const supervisorPrompt = `당신은 AI 면접관 팀을 관리하는 슈퍼바이저입니다. 전체 대화 흐름과 현재 상태를 보고, 다음에 어떤 에이전트를 호출해야 할지 결정해야 합니다.

사용 가능한 에이전트:
- greeting_agent: 면접 시작 인사 및 안내
- questioning_agent: 기술 질문 생성 (DDA 로직 포함)
- evaluation_agent: 사용자 답변 평가
- feedback_agent: 평가 결과 기반 피드백 제공
- farewell_agent: 면접 종료 인사
- FINISH: 워크플로우를 종료하고 사용자에게 응답을 반환

현재 상황:
- 면접 단계: {interview_stage}
- 마지막 메시지 타입: {last_message_type}
- 마지막 메시지 내용: {last_message}
- 프로액티브 컨텍스트: {proactive_context}

**핵심 라우팅 규칙 (반드시 순서대로 확인):**

1. **FINISH 조건 - 가장 중요!**
   - 마지막 메시지가 AI 메시지(질문, 인사, 피드백 등)인 경우 → 반드시 'FINISH'
   - 면접 단계가 'Finished'인 경우 → 반드시 'FINISH'

2. **Greeting 단계**
   - 프로액티브 컨텍스트가 있고 면접 단계가 'Greeting'인 경우 → 'greeting_agent'
   - 면접 단계가 'Greeting'이고 마지막 메시지가 AI의 인사인 경우 → 'questioning_agent'

3. **사용자 답변 처리**
   - 마지막 메시지가 사용자 메시지이고 면접 단계가 'Questioning'인 경우 → 'evaluation_agent'

4. **평가 후 피드백**
   - 면접 단계가 'Evaluating'이고 평가가 완료된 경우 → 'feedback_agent'

5. **피드백 후 다음 단계**
   - 면접 단계가 'Feedback'이고 피드백이 완료된 경우 → 'questioning_agent' 또는 'farewell_agent'

**응답 형식:** 반드시 다음 중 하나만 반환하세요:
greeting_agent, questioning_agent, evaluation_agent, feedback_agent, farewell_agent, FINISH

결정:`;

export const interviewerNode = async (state: InterviewState) => {
    console.log("면접관 노드가 실행 중입니다.");
    const { proactive } = state;

    let message = "다음 질문에 답변해주세요.";

    if (proactive) {
        const { trigger_event_type, metadata } = proactive;
        if (trigger_event_type === "USER_APPLIED") {
            message = `안녕하세요, ${metadata?.userName || '지원자'}님. 지원해주셔서 감사합니다. 지금부터 AI 역량 면접을 시작하겠습니다.`;
        } else if (trigger_event_type === "INTERVIEW_SCHEDULED") {
            message = `안녕하세요, ${metadata?.userName || '지원자'}님. 예약하신 AI 역량 면접 시간이 되었습니다. 준비되셨으면 시작하겠습니다.`;
        }
    }
  
    return {
      ...state,
      messages: [...state.messages, new HumanMessage(message)],
      flow_control: {
        ...state.flow_control,
        next_worker: "supervisor"
      }
    };
};

export const supervisorNode = async (state: InterviewState) => {
  console.log("--- 슈퍼바이저 노드 시작 ---");
  const { messages, task, proactive } = state;

  // 1. 면접 시작 처리 (가장 먼저 확인)
  if (messages.length === 0) {
    console.log("상태: 대화 없음 -> greeting_agent 호출");
    return {
      ...state,
      flow_control: {
        next_worker: "greeting_agent",
      },
    };
  }

  const lastMessage = messages[messages.length - 1];
  const lastMessageType = lastMessage instanceof AIMessage ? "AI" : "Human";
  
  // 2. AI가 방금 메시지를 보낸 경우 (사용자 응답 대기)
  if (lastMessage instanceof AIMessage) {
    console.log(`상태: ${task.interview_stage} / AI 메시지 -> FINISH (사용자 입력 대기)`);
    return {
      ...state,
      flow_control: {
        next_worker: "FINISH",
      }
    };
  }
  
  // 3. 면접 종료 상태 처리
  if (task.interview_stage === "Finished") {
    console.log("상태: Finished -> FINISH");
    return {
      ...state,
      flow_control: {
        next_worker: "FINISH",
      }
    };
  }

  // 4. LLM을 통해 다음 에이전트 결정 (사용자가 답변한 경우)
  console.log(`상태: ${task.interview_stage} / ${lastMessageType} 메시지 -> LLM으로 라우팅 결정`);
  
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0,
  }).pipe(new StringOutputParser());

  const formattedPrompt = supervisorPrompt
    .replace("{interview_stage}", task.interview_stage)
    .replace("{last_message_type}", lastMessageType)
    .replace("{last_message}", lastMessage.content.toString())
    .replace("{proactive_context}", JSON.stringify(proactive, null, 2) || "없음");

  console.log("LLM Supervisor 호출...");
  const response = await model.invoke(formattedPrompt);
  const nextNode = response.toLowerCase().trim().replace(/"/g, "");

  console.log(`Supervisor 결정: ${nextNode}`);
  console.log("--- 슈퍼바이저 노드 종료 ---");
  return {
    ...state,
    flow_control: {
      ...state.flow_control,
      next_worker: nextNode,
    }
  };
}; 