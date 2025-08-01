import { BaseMessage } from "@langchain/core/messages";
import { Annotation } from "@langchain/langgraph";

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
  /** 대화 시작의 원인 (예: "interview_reminder") */
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
  interview_stage: "Greeting" | "Questioning" | "Evaluating" | "Feedback" | "Farewell" | "Finished";
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

// LangGraph Annotation을 사용한 상태 정의
export const InterviewStateAnnotation = Annotation.Root({
  // 1. 핵심 대화 상태 (모든 상호작용의 기반)
  messages: Annotation<BaseMessage[]>({
    reducer: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
    default: () => [],
  }),
  
  // 2. 사용자 컨텍스트 (특별한 profile 병합 로직 포함)
  user_context: Annotation<UserContext>({
    reducer: (x: UserContext, y: Partial<UserContext>) => ({
      ...x,
      ...y,
      // profile 필드가 있으면 깊은 병합 수행 - 이것이 핵심 수정사항
      profile: y?.profile ? { ...x?.profile, ...y.profile } : x?.profile
    }),
    default: () => ({ user_id: "" }),
  }),

  // 3. 페르소나 상태 (챗봇의 정체성)
  persona: Annotation<PersonaState>({
    reducer: (x: PersonaState, y: Partial<PersonaState>) => ({ ...x, ...y }),
    default: () => ({
      name: "InterviewerAI",
      role: "AI 기술 면접관",
      backstory: "사용자의 성공적인 기술 면접 경험을 돕기 위해 설계된 AI 에이전트입니다.",
      style_guidelines: ["전문적이고 친절한 어조를 유지합니다."],
    }),
  }),

  // 4. 가드레일 및 안전 상태 (입력/출력 검증)
  guardrails: Annotation<GuardrailState | undefined>({
    reducer: (x, y) => y ?? x,
    default: () => ({
      is_safe: true,
      fallback_count: 0
    }),
  }),

  // 5. 선제적 대화 상태 (AI가 먼저 말을 거는 경우)
  proactive: Annotation<ProactiveContext | undefined>({
    reducer: (x, y) => y ?? x,
    default: () => undefined,
  }),

  // 6. 제어 흐름 상태 (그래프의 동적 라우팅)
  flow_control: Annotation<FlowControlState>({
    reducer: (x: FlowControlState, y: Partial<FlowControlState>) => ({ ...x, ...y }),
    default: () => ({}),
  }),

  // 7. 면접 과업 상태 (현재 작업 관리)
  task: Annotation<TaskState>({
    reducer: (x: TaskState, y: Partial<TaskState>) => ({ ...x, ...y }),
    default: () => ({
      interview_stage: "Greeting",
      question_pool: [],
      questions_asked: [],
      current_difficulty: 50,
    }),
  }),

  // 8. 평가 및 메타데이터 상태 (성능 측정)
  evaluation: Annotation<EvaluationState>({
    reducer: (x: EvaluationState, y: Partial<EvaluationState>) => ({ ...x, ...y }),
    default: () => ({
      turn_count: 0,
    }),
  }),
});

/**
 * AI 면접관 챗봇의 모든 상태를 포괄하는 최상위 통합 상태 타입입니다.
 */
export type InterviewState = typeof InterviewStateAnnotation.State;
export type InterviewStateType = InterviewState;

// 기존 호환성을 위한 별칭
export const interviewStateGraph = InterviewStateAnnotation; 