import { Annotation } from "@langchain/langgraph";
// LangGraph Annotation을 사용한 상태 정의
export const InterviewStateAnnotation = Annotation.Root({
    // 1. 핵심 대화 상태 (모든 상호작용의 기반)
    messages: Annotation({
        reducer: (x, y) => x.concat(y),
        default: () => [],
    }),
    // 2. 사용자 컨텍스트 (특별한 profile 병합 로직 포함)
    user_context: Annotation({
        reducer: (x, y) => ({
            ...x,
            ...y,
            // profile 필드가 있으면 깊은 병합 수행 - 이것이 핵심 수정사항
            profile: y?.profile ? { ...x?.profile, ...y.profile } : x?.profile
        }),
        default: () => ({ user_id: "" }),
    }),
    // 3. 페르소나 상태 (챗봇의 정체성)
    persona: Annotation({
        reducer: (x, y) => ({ ...x, ...y }),
        default: () => ({
            name: "InterviewerAI",
            role: "AI 기술 면접관",
            backstory: "사용자의 성공적인 기술 면접 경험을 돕기 위해 설계된 AI 에이전트입니다.",
            style_guidelines: ["전문적이고 친절한 어조를 유지합니다."],
        }),
    }),
    // 4. 가드레일 및 안전 상태 (입력/출력 검증)
    guardrails: Annotation({
        reducer: (x, y) => y ?? x,
        default: () => ({
            is_safe: true,
            fallback_count: 0
        }),
    }),
    // 5. 선제적 대화 상태 (AI가 먼저 말을 거는 경우)
    proactive: Annotation({
        reducer: (x, y) => y ?? x,
        default: () => undefined,
    }),
    // 6. 제어 흐름 상태 (그래프의 동적 라우팅)
    flow_control: Annotation({
        reducer: (x, y) => ({ ...x, ...y }),
        default: () => ({}),
    }),
    // 7. 면접 과업 상태 (현재 작업 관리)
    task: Annotation({
        reducer: (x, y) => ({ ...x, ...y }),
        default: () => ({
            interview_stage: "Greeting",
            question_pool: [],
            questions_asked: [],
            current_difficulty: 50,
        }),
    }),
    // 8. 평가 및 메타데이터 상태 (성능 측정)
    evaluation: Annotation({
        reducer: (x, y) => ({ ...x, ...y }),
        default: () => ({
            turn_count: 0,
        }),
    }),
});
// 기존 호환성을 위한 별칭
export const interviewStateGraph = InterviewStateAnnotation;
//# sourceMappingURL=state.js.map