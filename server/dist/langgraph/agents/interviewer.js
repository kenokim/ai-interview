import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
const supervisorPrompt = `당신은 AI 면접관 팀을 관리하는 슈퍼바이저입니다. 대화의 맥락을 보고 다음에 어떤 에이전트를 호출할지 결정합니다.

[사용 가능한 에이전트]
- greeting_agent: 면접 시작 인사를 담당합니다. (참고: 이 에이전트는 대화가 처음 시작될 때 시스템에 의해 단 한 번만 호출됩니다. 당신은 이 에이전트를 다시 호출해서는 안 됩니다.)
- conversation_agent: 지원자와 기술 질문이나 일반 대화를 이어갑니다.
- FINISH: 지원자의 답변을 기다리기 위해 워크플로우를 일시 중지합니다.

[라우팅 규칙]
주어진 상태 정보를 바탕으로 다음 규칙에 따라 가장 적합한 에이전트 *하나만* 결정하세요.

- **면접 시작 또는 대화 진행**:
  - 'interview_stage'가 "Greeting" 또는 "Questioning"이고, 마지막 메시지가 지원자의 응답(HumanMessage)이라면, 면접을 계속 진행해야 합니다.
  - 👉 **conversation_agent**를 호출하세요.

- **AI가 방금 응답한 경우**:
  - 마지막 메시지가 AI의 응답(AIMessage)이면, 지원자의 다음 입력을 기다려야 합니다. (참고: 이 규칙은 시스템에 의해 자동으로 처리될 수 있습니다.)
  - 👉 **FINISH**를 호출하세요.

[출력]
반드시 다음 중 하나의 단어로만 응답하세요:
conversation_agent, FINISH
`;
export const interviewerNode = async (state) => {
    console.log("면접관 노드가 실행 중입니다.");
    const { proactive } = state;
    let message = "다음 질문에 답변해주세요.";
    if (proactive) {
        const { trigger_event_type, metadata } = proactive;
        if (trigger_event_type === "USER_APPLIED") {
            message = `안녕하세요, ${metadata?.userName || '지원자'}님. 지원해주셔서 감사합니다. 지금부터 AI 역량 면접을 시작하겠습니다.`;
        }
        else if (trigger_event_type === "INTERVIEW_SCHEDULED") {
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
export const supervisorNode = async (state) => {
    console.log("🧠 [LangGraph] --- 슈퍼바이저 노드 시작 ---");
    const { messages, task } = state;
    console.log(`🔍 Supervisor: 현재 메시지 개수 = ${messages.length}`);
    if (messages.length > 0) {
        const lm = messages[messages.length - 1];
        console.log(`🔍 Supervisor: 마지막 메시지(${lm instanceof AIMessage ? "AI" : "Human"}) = "${lm.content.toString().slice(0, 50)}"`);
    }
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
    // 2. AI가 "질문"을 한 직후에만 FINISH
    if (lastMessage instanceof AIMessage && task.interview_stage === "Questioning") {
        console.log(`상태: Questioning / AI 메시지 -> FINISH (사용자 입력 대기)`);
        return {
            ...state,
            flow_control: {
                next_worker: "FINISH",
            }
        };
    }
    // 2-1. AI가 "인사"를 한 직후에도 FINISH (사용자가 준비 상태를 확인할 수 있도록)
    if (lastMessage instanceof AIMessage && task.interview_stage === "Greeting") {
        console.log(`상태: Greeting / AI 메시지 -> FINISH (사용자 준비 상태 확인 대기)`);
        return {
            ...state,
            flow_control: {
                next_worker: "FINISH",
            }
        };
    }
    // 2-2. 사용자가 "시작" 등으로 준비를 알린 경우 바로 Questioning 단계로
    if (lastMessage instanceof HumanMessage && task.interview_stage === "Greeting") {
        console.log(`상태: Greeting / Human 메시지 -> conversation_agent 호출`);
        return {
            ...state,
            flow_control: {
                next_worker: "conversation_agent",
            },
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
    // 4. LLM을 통한 지능적인 라우팅 결정
    const lastMessageType = lastMessage instanceof AIMessage ? "AI" : "Human";
    console.log(`상태: ${task.interview_stage} / ${lastMessageType} 메시지 -> LLM으로 라우팅 결정`);
    const model = new ChatGoogleGenerativeAI({
        model: "gemini-2.5-flash",
        temperature: 0,
        streaming: true,
    });
    const remainingQuestions = Math.max(0, (state.task.question_pool?.length || 0) - (state.task.questions_asked?.length || 0));
    const enhancedPrompt = supervisorPrompt
        .replace("{remaining_questions}", remainingQuestions.toString());
    console.log("LLM Supervisor 호출...");
    let response = "";
    const stream = await model.stream(enhancedPrompt);
    for await (const chunk of stream) {
        response += chunk.content;
    }
    const nextNode = response.toLowerCase().trim().replace(/"/g, "");
    console.log(`🧠 [LangGraph] Supervisor 결정: ${nextNode}`);
    console.log("🧠 [LangGraph] --- 슈퍼바이저 노드 종료 ---");
    return {
        ...state,
        flow_control: {
            ...state.flow_control,
            next_worker: nextNode,
        }
    };
};
//# sourceMappingURL=interviewer.js.map