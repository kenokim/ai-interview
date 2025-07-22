import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StringOutputParser } from "@langchain/core/output_parsers";
const supervisorPrompt = `당신은 AI 면접관 팀을 관리하는 슈퍼바이저입니다. 전체 대화 흐름과 현재 상태를 보고, 다음에 어떤 에이전트를 호출해야 할지 결정해야 합니다.

사용 가능한 에이전트:
- greeting_agent: 면접 시작 인사 및 안내
- questioning_agent: 기술 질문 생성
- evaluation_agent: 사용자 답변 평가
- feedback_agent: 평가 결과 기반 피드백 제공
- farewell_agent: 면접 종료 인사
- FINISH: 사용자 입력을 기다려야 할 때 워크플로우를 일시 중지

**핵심 라우팅 규칙 (주어진 상태를 바탕으로 가장 적합한 다음 에이전트를 하나만 결정하세요):**

1.  **인사 후 사용자 준비 확인:**
    -   현재 단계: \`Greeting\` / 마지막 메시지: 사용자의 응답 → 사용자가 준비되었으므로 **questioning_agent** 호출

2.  **사용자 답변 평가:**
    -   현재 단계: \`Questioning\` / 마지막 메시지: 사용자의 답변 → 답변을 평가해야 하므로 **evaluation_agent** 호출

3.  **평가 후 피드백 제공:**
    -   현재 단계: \`Evaluating\` (평가 완료) → 평가 결과를 바탕으로 피드백을 제공해야 하므로 **feedback_agent** 호출

4.  **피드백 후 다음 질문 또는 종료:**
    -   현재 단계: \`Feedback\` / 마지막 메시지: AI의 피드백 → 남은 질문 수({remaining_questions})를 확인:
        -   남은 질문이 1개 이상이면 → 다음 질문을 위해 **questioning_agent** 호출
        -   남은 질문이 0개이면 → 면접을 마무리하기 위해 **farewell_agent** 호출

응답은 반드시 다음 중 하나의 단어로만 해주세요:
greeting_agent, questioning_agent, evaluation_agent, feedback_agent, farewell_agent, FINISH
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
    // 4. LLM을 통해 다음 에이전트 결정
    const lastMessageType = lastMessage instanceof AIMessage ? "AI" : "Human";
    console.log(`상태: ${task.interview_stage} / ${lastMessageType} 메시지 -> LLM으로 라우팅 결정`);
    const model = new ChatGoogleGenerativeAI({
        model: "gemini-2.0-flash",
        temperature: 0,
    }).pipe(new StringOutputParser());
    const remainingQuestions = Math.max(0, (state.task.question_pool?.length || 0) - (state.task.questions_asked?.length || 0));
    const formattedPrompt = supervisorPrompt
        .replace("{interview_stage}", task.interview_stage)
        .replace("{remaining_questions}", remainingQuestions.toString());
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
//# sourceMappingURL=interviewer.js.map