import { BaseMessage } from "@langchain/core/messages";
import { StateGraph, StateGraphArgs } from "@langchain/langgraph";
/** 사용자 식별 및 프로필 정보 */
export interface UserContext {
    /** 시스템에서 사용자를 고유하게 식별하는 ID */
    user_id: string;
    /** DB 등에서 조회한 사용자의 상세 정보 (이름, 기술 스택 등) */
    profile?: Record<string, any>;
}
/** 챗봇의 정체성, 역할, 말투를 정의 */
export interface PersonaState {
    /** 챗봇의 이름 (예: "인터뷰어 봇") */
    name: string;
    /** 챗봇의 역할 (예: "신입 프론트엔드 개발자 면접관") */
    role: string;
    /** 페르소나의 배경 설정 */
    backstory: string;
    /** "전문적이지만 친절한 톤 유지"와 같은 구체적인 행동 지침 */
    style_guidelines: string[];
    /** 대화의 흐름에 따라 변하는 동적 감정 상태 (예: "encouraging") */
    current_mood?: string;
}
/** 입력의 안전성, 범위, 유효성을 관리 */
export interface GuardrailState {
    /** PII, 유해성 등 초기 안전 검사 통과 여부 */
    is_safe: boolean;
    /** 사용자 의도 분류 결과 */
    user_intent?: "interview_related" | "out_of_scope" | "clarification_needed";
    /** 사용자 입력에서 추출한 핵심 개체명 (예: 기술명) */
    parsed_entities?: Record<string, any>;
    /** 가장 최근에 발생한 오류 메시지 */
    error_message?: string;
    /** 오류 발생 시 재시도 횟수 카운트 */
    fallback_count: number;
}
/** AI가 먼저 대화를 시작할 때의 맥락 정보 */
export interface ProactiveContext {
    /** 대화 시작의 원인 (예: "interview_reminder") */
    trigger_event_type: string;
    /** 중복 실행 방지를 위한 이벤트 고유 ID */
    trigger_event_id: string;
    /** 이벤트 관련 추가 정보 (예: 면접 시간) */
    metadata: Record<string, any>;
}
/** 그래프의 실행 흐름을 제어 */
export interface FlowControlState {
    /** Supervisor가 다음에 호출할 Worker 에이전트의 이름 */
    next_worker?: string;
    /** 인간의 개입을 기다릴 때 필요한 정보 */
    human_in_loop_payload?: Record<string, any>;
}
/** 현재 면접 과업과 관련된 구체적인 정보 */
export interface TaskState {
    /** 면접의 현재 단계 */
    interview_stage: "Greeting" | "Questioning" | "Feedback" | "Farewell" | "Finished";
    /** 전체 질문 목록. 각 질문 객체는 'difficulty': number (0-100) 필드를 포함해야 함. */
    question_pool: Record<string, any>[];
    /** 이미 질문한 목록 */
    questions_asked: Record<string, any>[];
    /** 현재 사용자가 답변 중인 질문 */
    current_question?: Record<string, any>;
    /** 사용자의 최근 답변 */
    current_answer?: string;
    /** 현재 면접의 난이도. 0-100 사이의 수치. 50으로 시작. */
    current_difficulty: number;
    /** 바로 이전 질문의 난이도. */
    previous_difficulty?: number;
    /** 가장 최근에 실행된 Worker 에이전트의 결과물 */
    agent_outcome?: any;
    /** 도구 실행 결과 */
    tool_outputs?: Record<string, any>[];
}
/** 성능 평가 및 분석을 위한 메타데이터 */
export interface EvaluationState {
    /** 현재 대화의 턴 수 */
    turn_count: number;
    /** 사용자의 직접적인 피드백 */
    last_user_feedback?: "positive" | "negative";
    /** 전체 면접 과업의 최종 성공 여부 */
    task_successful?: boolean;
    /** LLM-as-a-Judge가 생성한 최종 평가 요약 */
    final_evaluation_summary?: string;
}
/**
 * AI 면접관 챗봇의 모든 상태를 포괄하는 최상위 통합 상태 인터페이스입니다.
 */
export interface InterviewState {
    messages: BaseMessage[];
    user_context: UserContext;
    persona: PersonaState;
    guardrails?: GuardrailState;
    proactive?: ProactiveContext;
    flow_control: FlowControlState;
    task: TaskState;
    evaluation: EvaluationState;
}
export declare const interviewStateGraph: StateGraphArgs<InterviewState>;
export type InterviewStateType = InterviewState;
export declare const InterviewStateAnnotation: StateGraph<StateGraphArgs<InterviewState>, InterviewState, Partial<InterviewState>, "__start__", import("@langchain/langgraph").StateDefinition, import("@langchain/langgraph").StateDefinition, import("@langchain/langgraph").StateDefinition>;
//# sourceMappingURL=state.d.ts.map