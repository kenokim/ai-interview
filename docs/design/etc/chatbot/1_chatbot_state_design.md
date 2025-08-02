# LangGraph 기반 AI 면접관 챗봇을 위한 통합 상태(State) 설계

## 1. 개요

본 문서는 AI 면접관 챗봇의 모든 기능을 포괄하고 제어하기 위한 중앙 데이터 구조, 즉 상태(State) 객체를 상세히 정의합니다. 이 설계안은 5개의 핵심 연구 문서에서 도출된 요구사항을 종합하여, 챗봇의 페르소나, 대화 흐름, 작업 관리, 안전성, 선제적 상호작용, 평가 등 모든 측면을 지원하는 견고하고 확장 가능한 아키텍처를 제공하는 것을 목표로 합니다.

상태 객체는 LangGraph 워크플로우의 "단일 진실 공급원(Single Source of Truth)" 역할을 하며, 그래프의 모든 노드와 엣지는 이 상태 객체를 읽고 수정함으로써 일관된 컨텍스트 하에 동작합니다.

## 2. 통합 상태 아키텍처: `InterviewState`

전체 상태는 여러 개의 모듈화된 하위 상태 `TypedDict`를 조합하여 구성됩니다. 이는 관련 상태끼리 그룹화하여 복잡성을 낮추고 유지보수성을 높이기 위함입니다.

### 2.1. 메인 상태 객체 (`InterviewState`)

```typescript
import { BaseMessage } from "@langchain/core/messages";
// 하위 상태들을 정의한 파일에서 임포트합니다.
import {
  UserContext,
  PersonaState,
  GuardrailState,
  ProactiveContext,
  FlowControlState,
  TaskState,
  EvaluationState,
} from "./sub_states";

/**
 * AI 면접관 챗봇의 모든 상태를 포괄하는 최상위 통합 상태 인터페이스입니다.
 */
export interface InterviewState {
  // 1. 핵심 대화 상태 (모든 상호작용의 기반)
  user_context: UserContext;
  messages: BaseMessage[];

  // 2. 페르소나 상태 (챗봇의 정체성)
  persona: PersonaState;

  // 3. 가드레일 및 안전 상태 (입력/출력 검증)
  guardrails?: GuardrailState;

  // 4. 선제적 대화 상태 (AI가 먼저 말을 거는 경우)
  proactive?: ProactiveContext;

  // 5. 제어 흐름 상태 (그래프의 동적 라우팅)
  flow_control: FlowControlState;

  // 6. 면접 과업 상태 (현재 작업 관리)
  task: TaskState;

  // 7. 평가 및 메타데이터 상태 (성능 측정)
  evaluation: EvaluationState;
}
```

### 2.2. 하위 상태 객체 상세 정의 (`sub_states.ts`)

#### 2.2.1. `UserContext`: 사용자 기본 정보

사용자에 대한 기본적인 식별 정보를 담습니다.

```typescript
/** 사용자 식별 및 프로필 정보 */
export interface UserContext {
  /** 시스템에서 사용자를 고유하게 식별하는 ID */
  user_id: string;
  /** DB 등에서 조회한 사용자의 상세 정보 (이름, 기술 스택 등) */
  profile?: Record<string, any>;
}
```
-   설계 근거: 개인화된 상호작용의 기반입니다. `user_id`를 통해 `user_profile`을 조회하고, 이를 바탕으로 맞춤형 질문을 하거나 피드백을 제공합니다. (문서 `2_LangGraph_AI_선제적_대화_구현.md`, `3_LangGraph_챗봇_페르소나_설정.md`)

#### 2.2.2. `PersonaState`: 페르소나 관리

챗봇의 정체성과 관련된 모든 정보를 관리합니다.

```typescript
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
```
-   설계 근거: 대화 전반에 걸쳐 일관된 페르소나를 유지하기 위한 "진실의 원천"입니다. 정적 속성과 동적 속성을 모두 포함하여 깊이 있는 페르소나를 구현합니다. (문서 `3_LangGraph_챗봇_페르소나_설정.md`)

#### 2.2.3. `GuardrailState`: 안전성 및 범위 제어

사용자의 입력을 검증하고 시스템의 안전성을 확보하기 위한 상태입니다.

```typescript
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
```
-   설계 근거: 의도치 않은 요청을 처리하기 위한 다층적 방어의 핵심입니다. '라우터-디스패처' 패턴을 통해 `user_intent`를 분류하고, '개체명 추출'을 통해 `parsed_entities`를 확보하며, '자가 수정 루프'를 위해 `fallback_count`와 `error_message`를 관리합니다. (문서 `4_LangGraph_챗봇_의도_외_요청_방지.md`)

#### 2.2.4. `ProactiveContext`: 선제적 대화 트리거

챗봇이 먼저 대화를 시작하는 경우, 그 맥락을 저장합니다.

```typescript
/** AI가 먼저 대화를 시작할 때의 맥락 정보 */
export interface ProactiveContext {
  /** 대화 시작의 원인 (예: "interview_reminder") */
  trigger_event_type: string;
  /** 중복 실행 방지를 위한 이벤트 고유 ID */
  trigger_event_id: string;
  /** 이벤트 관련 추가 정보 (예: 면접 시간) */
  metadata: Record<string, any>;
}
```
-   설계 근거: 반응형 챗봇을 넘어 능동적인 에이전트를 구현하기 위해 필수적입니다. 이 상태의 존재 여부로 그래프의 진입점을 다르게 설정할 수 있으며, `trigger_event_id`를 통해 멱등성을 보장합니다. (문서 `2_LangGraph_AI_선제적_대화_구현.md`)

#### 2.2.5. `FlowControlState`: 대화 흐름 제어

그래프의 실행 경로를 동적으로 결정하기 위한 상태입니다.

```typescript
/** 그래프의 실행 흐름을 제어 */
export interface FlowControlState {
  /** Supervisor가 다음에 호출할 Worker 에이전트의 이름 */
  next_worker?: string;
  /** 인간의 개입을 기다릴 때 필요한 정보 */
  human_in_loop_payload?: Record<string, any>;
}
```
-   설계 근거: 'Supervisor-Worker' 패턴의 핵심입니다. `Supervisor` 에이전트가 `next_worker`를 결정하여 제어권을 위임합니다. `human_in_loop_payload`는 중요한 결정 전 인간의 승인을 받기 위해 실행을 `interrupt` 할 때 사용됩니다. (문서 `1_복잡한_상호작용_챗봇_구현_연구.md`, `4_LangGraph_챗봇_의도_외_요청_방지.md`)

#### 2.2.6. `TaskState`: 면접 과업 관리

현재 진행 중인 면접 과업과 관련된 정보를 구체적으로 저장합니다.

```typescript
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
```
-   설계 근거: 복잡한 면접 과정을 단계별로 추적하고 관리하기 위해 필요합니다. `interview_stage`는 현재 면접의 어느 부분에 있는지 명확히 하고, `question_pool`과 `questions_asked`는 질문의 중복을 방지합니다. `current_difficulty`와 `previous_difficulty`는 사용자의 이전 답변 평가 결과에 따라 질문의 난이도를 0-100 사이의 수치로 미세 조정하는 적응형 면접(Adaptive Interview) 경험을 구현하기 위한 핵심 상태입니다. (문서 `1_복잡한_상호작용_챗봇_구현_연구.md`)

#### 2.2.7. `EvaluationState`: 평가 지표 및 메타데이터

시스템 성능 평가 및 분석을 위한 데이터를 수집합니다.

```typescript
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
```
-   설계 근거: 챗봇의 성능을 지속적으로 측정하고 개선하기 위한 '평가 플라이휠'의 기반입니다. 대화 길이(`turn_count`), 사용자 만족도(`last_user_feedback`), 과업 완료 여부(`task_successful`) 등 핵심 지표를 상태 내에서 직접 관리하여 LangSmith와 같은 외부 평가 도구와 연동합니다. (문서 `5_LangGraph_챗봇_평가_방법.md`)

## 3. 결론

본 문서에서 설계한 `InterviewState` 객체는 5개 연구 문서의 요구사항을 모두 통합한 포괄적인 상태 관리 아키텍처입니다. 하위 상태로 분리된 모듈식 구조는 각 기능 영역(페르소나, 안전, 흐름 제어 등)의 응집도를 높이고, 전체 시스템의 복잡성을 관리하기 용이하게 만듭니다.

이 상태 객체는 AI 면접관 챗봇이 복잡한 상호작용을 안정적으로 수행하고, 일관된 페르소나를 유지하며, 예측 불가능한 사용자 입력에 효과적으로 대응하고, 스스로의 성능을 지속적으로 평가하고 개선하는 데 필요한 모든 정보를 담는 핵심적인 청사진이 될 것입니다.
