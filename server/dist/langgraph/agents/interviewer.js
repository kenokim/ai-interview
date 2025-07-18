import { HumanMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StringOutputParser } from "@langchain/core/output_parsers";
const supervisorPrompt = `당신은 AI 면접관 팀을 관리하는 슈퍼바이저입니다. 전체 대화 흐름과 현재 상태를 보고, 다음에 어떤 에이전트를 호출해야 할지 결정해야 합니다.

사용 가능한 에이전트:
- interviewer: 면접 시작/종료 인사, 다음 단계 안내 등 일반적인 대화를 담당합니다.
- technical_question_agent: 기술 질문을 생성합니다.
- followup_question_agent: 이전 답변에 대한 후속 질문을 생성합니다.
- evaluate_answer: 사용자의 답변을 평가합니다.
- FINISH: 면접을 종료합니다.

현재 면접 단계: {interview_stage}
마지막 메시지: {last_message}
프로액티브 실행 컨텍스트: {trigger_context}

규칙:
1.  **프로액티브 시작**: 'trigger_context'가 있고 면접 단계가 'Greeting'이면, 반드시 'interviewer'를 호출하여 면접 시작 인사를 하세요.
2.  **사용자 답변 후**: 면접 단계가 'Answering'이면, 반드시 'evaluate_answer'를 호출하여 답변을 평가하세요.
3.  **평가 후**: 면접 단계가 'Evaluating'이면, 'followup_question_agent'나 'technical_question_agent'를 호출하여 다음 질문을 하세요.
4.  **질문 후**: 면접 단계가 'Questioning' 또는 'Follow-up'이면, 사용자 답변을 기다려야 하므로 반드시 'FINISH'를 호출하세요.
5.  **인사**: 면접 단계가 'Greeting'이면, 'technical_question_agent'를 호출하여 첫 질문을 시작하세요.

다음에 호출할 에이전트 이름만 정확히 반환하세요.`;
export const interviewerNode = async (state) => {
    console.log("🗣️ Interviewer node running...");
    const { trigger_context } = state;
    let message = "다음 질문에 답변해주세요.";
    if (trigger_context) {
        const { event_type, metadata } = trigger_context;
        if (event_type === "USER_APPLIED") {
            message = `안녕하세요, ${metadata?.userName || '지원자'}님. 지원해주셔서 감사합니다. 지금부터 AI 역량 면접을 시작하겠습니다.`;
        }
        else if (event_type === "INTERVIEW_SCHEDULED") {
            message = `안녕하세요, ${metadata?.userName || '지원자'}님. 예약하신 AI 역량 면접 시간이 되었습니다. 준비되셨으면 시작하겠습니다.`;
        }
    }
    return {
        messages: [new HumanMessage(message)],
        next: "supervisor"
    };
};
export const supervisorNode = async (state) => {
    console.log("🎯 Supervisor node 실행 중...");
    const { messages, interview_stage, trigger_context } = state;
    const lastMessage = messages[messages.length - 1];
    const model = new ChatGoogleGenerativeAI({
        model: "gemini-2.0-flash",
        temperature: 0,
    }).pipe(new StringOutputParser());
    const formattedPrompt = supervisorPrompt
        .replace("{interview_stage}", interview_stage)
        .replace("{last_message}", lastMessage.content.toString())
        .replace("{trigger_context}", JSON.stringify(trigger_context, null, 2) || "없음");
    console.log("🤖 Supervisor agent 호출 중...");
    const response = await model.invoke(formattedPrompt);
    console.log(`🤖 Supervisor 원본 응답: ${response}`);
    const nextNode = response.toLowerCase().trim().replace(/"/g, "");
    console.log(`🎯 Supervisor 결정: { next: '${nextNode}' }`);
    return {
        next: nextNode,
    };
};
//# sourceMappingURL=interviewer.js.map