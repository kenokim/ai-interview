# LangGraph 기반 AI 면접관 챗봇 아키텍처 설계

## 1. 개요

본 문서는 `docs/research/1_복잡한_상호작용_챗봇_구현_연구.md` 기술 백서에 제시된 원칙과 패턴을 기반으로, AI 기술 면접관 챗봇의 LangGraph 아키텍처를 설계하는 것을 목표로 합니다.

이 아키텍처는 면접이라는 복잡한 상호작용을 모델링하고, 동적인 대화 흐름을 제어하며, 향후 새로운 기능(예: 다른 직무 면접, 코딩 테스트)을 쉽게 추가할 수 있도록 **모듈성, 확장성, 유연성**을 확보하는 데 중점을 둡니다.

## 2. 핵심 설계 원칙 (LangGraph 기본 원리)

백서에서 강조하는 LangGraph의 핵심 개념을 채택하여 아키텍처의 기반으로 삼습니다.

-   **StateGraph**: 상태를 가진 순환 그래프(Stateful, Cyclical Graph)를 사용하여, 면접관이 질문하고, 답변을 평가하고, 피드백을 주고, 다시 다음 질문으로 넘어가는 반복적이고 복잡한 면접의 흐름을 모델링합니다.
-   **상태 (State)**: Python의 `TypedDict`를 사용하여 면접의 전체 맥락을 관리하는 중앙 데이터 구조(`State`)를 명시적으로 정의합니다. 이 상태 객체는 대화 기록, 현재 면접 단계, 질문 목록, 사용자 답변, 평가 결과 등 모든 정보를 포함하는 "단일 진실 공급원(Single Source of Truth)" 역할을 합니다.
-   **노드 (Nodes)**: 면접 과정에서 필요한 각 기능(예: `면접 시작 안내`, `질문 선택`, `답변 평가`, `피드백 제공`)을 개별 Python 함수 또는 LangChain 실행 가능 객체(Runnable)로 구현하여 그래프의 노드로 정의합니다. 각 노드는 독립적으로 테스트하고 수정할 수 있어 모듈성을 높입니다.
-   **엣지 (Edges)**: 노드 간의 제어 흐름을 정의합니다. 특히 **조건부 엣지(Conditional Edges)**를 적극적으로 활용하여, 면접관의 동적인 의사결정(예: "사용자 답변의 평가 결과에 따라 다음 질문 난이도를 조절할지, 아니면 추가 질문을 할지 결정")을 구현합니다.

## 3. 제안 아키텍처: Supervisor-Worker 패턴

백서에서 제안된 가장 일반적이고 강력한 멀티 에이전트 패턴인 **Supervisor-Worker 아키텍처**를 채택합니다. 단일 에이전트에게 모든 역할을 부여할 경우 LLM의 추론 성능이 저하될 수 있으므로, 역할을 분리하여 시스템의 안정성과 효율성을 높입니다.

-   **Supervisor (면접 총괄 에이전트)**: 면접의 전체 흐름을 지휘하는 오케스트레이터입니다. 사용자의 입력과 현재 대화 상태를 종합적으로 분석하여, 다음에 어떤 작업을 수행해야 할지 결정하고 가장 적합한 **Worker 에이전트**에게 작업을 위임하는 역할을 합니다.
-   **Worker (전문가 에이전트)**: 각자 좁은 범위의 명확한 임무를 수행하는 데 특화된 에이전트들입니다. 이들은 감독자의 지시를 받아 실제 작업을 처리합니다.

### 3.1. 전문가 에이전트 (Workers) 구성

AI 면접관을 위해 다음과 같은 Worker 에이전트를 정의합니다.

-   `technical_question_agent`: 사용자의 기술 스택, 경력 수준, 이전 답변 품질을 분석하여 적절한 기술 면접 질문을 생성하고 제시합니다. 질문의 난이도를 동적으로 조절하고, 사용자의 전문 분야에 맞는 심화 질문을 만들어냅니다.
-   `followup_question_agent`: 사용자의 답변을 분석하여 더 깊이 있는 이해를 위한 꼬리질문을 생성합니다. 답변의 모호한 부분을 명확히 하거나, 실제 경험과 이론적 지식을 구분하는 질문, 또는 답변의 한계를 탐색하는 질문을 만듭니다.

### 3.2. 통합 상태 (State) 아키텍처

AI 면접관 챗봇의 모든 기능(페르소나, 안전장치, 선제적 대화, 평가 등)을 지원하기 위해, 연구 문서들의 요구사항을 종합하여 설계된 모듈식 상태 객체를 사용합니다. 이는 `docs/chatbot/2_chatbot_state_design.md`에 상세히 정의되어 있으며, 본 문서에서는 최상위 구조만 기술합니다.

```typescript
import { BaseMessage } from "@langchain/core/messages";
// 상세 하위 상태(UserContext, TaskState 등)는
// `docs/chatbot/2_chatbot_state_design.md`에 정의되어 있습니다.
import {
  UserContext,
  PersonaState,
  GuardrailState,
  ProactiveContext,
  FlowControlState,
  TaskState,
  EvaluationState,
} from "./sub_states"; // 가정된 경로

/**
 * AI 면접관 챗봇의 모든 상태를 포괄하는 최상위 통합 상태 인터페이스입니다.
 * 각 필드는 기능별로 모듈화된 하위 상태 객체를 나타냅니다.
 */
export interface InterviewState {
  // 1. 핵심 대화 상태
  user_context: UserContext;
  messages: BaseMessage[];

  // 2. 페르소나 상태
  persona: PersonaState;

  // 3. 가드레일 및 안전 상태
  guardrails?: GuardrailState;

  // 4. 선제적 대화 상태
  proactive?: ProactiveContext;

  // 5. 제어 흐름 상태
  flow_control: FlowControlState;

  // 6. 면접 과업 상태
  task: TaskState;

  // 7. 평가 및 메타데이터 상태
  evaluation: EvaluationState;
}
```

## 4. 그래프 구조 및 상호작용 흐름

### 4.1. 그래프 다이어그램 (Mermaid)

Supervisor-Worker 패턴의 제어 흐름을 시각화하면 다음과 같습니다. 모든 Worker는 작업을 완료한 후 항상 Supervisor에게 제어를 반환하여 다음 단계를 지시받습니다.

```mermaid
graph TD
    subgraph "AI Interviewer Graph"
        direction TB
        START --> Supervisor;

        Supervisor -- "route to technical" --> TechnicalQuestion;
        Supervisor -- "route to followup" --> FollowupQuestion;
        Supervisor -- "End of Interview" --> END;

        TechnicalQuestion -- "question generated" --> Supervisor;
        FollowupQuestion -- "followup generated" --> Supervisor;
    end
```

### 4.2. 상호작용 시나리오 예시

1.  **면접 시작**:
    -   사용자가 입장을 알리면, `START`에서 `Supervisor` 노드가 호출됩니다.
    -   `Supervisor`는 사용자의 기본 정보(기술 스택, 경력 수준)를 분석하고, 첫 번째 기술 질문이 필요하다고 판단합니다.
    -   조건부 엣지에 의해 `TechnicalQuestion` 노드가 실행되어 적절한 기술 질문을 생성하고 사용자에게 제시합니다.
    -   `TechnicalQuestion` 노드는 질문 생성 완료 후 제어를 `Supervisor`에게 돌려줍니다.

2.  **질문-답변-꼬리질문 루프**:
    -   사용자가 기술 질문에 답변하면, `Supervisor`는 답변의 깊이와 완성도를 평가합니다.
    -   답변이 표면적이거나 추가 설명이 필요하다고 판단되면, `next_worker_to_call`을 `followup_question_agent`로 설정합니다.
    -   `FollowupQuestion` 노드는 사용자의 답변을 분석하여 더 구체적인 꼬리질문을 생성합니다.
    -   사용자가 꼬리질문에 답변하면, `Supervisor`는 다시 상황을 평가하여 추가 꼬리질문이 필요한지, 아니면 다음 기술 질문으로 넘어갈지 결정합니다.
    -   이 과정은 면접의 목표(예: 특정 기술 영역 평가 완료)가 달성될 때까지 반복됩니다.

3.  **면접 진행 및 종료**:
    -   `Supervisor`는 현재 질문 영역이 충분히 탐색되었다고 판단하면, 다음 기술 영역으로 넘어가기 위해 `technical_question_agent`를 다시 호출합니다.
    -   모든 필요한 기술 영역이 다뤄지고 면접 목표가 달성되면, `Supervisor`는 `FINISH`를 반환하여 그래프 실행을 `END`에서 종료시킵니다.

## 5. 고급 기능 통합 계획

백서에서 논의된 고급 패턴들을 적용하여 챗봇의 성능을 극대화합니다.

-   **에이전틱 RAG (Agentic RAG)**: `technical_question_agent`는 질문 데이터베이스에서 단순 검색하는 것이 아니라, 사용자의 답변 히스토리, 기술 트렌드, 난이도 곡선을 종합적으로 분석하여 동적으로 질문을 생성하거나 변형합니다. `followup_question_agent`는 답변의 키워드와 맥락을 분석하여 가장 효과적인 꼬리질문 방향을 결정합니다.
-   **대화 메모리 (Conversation Memory)**: LangGraph의 내장 **체크포인터(Checkpointer)** 기능을 활용하여 전체 면접 대화의 `InterviewState`를 지속적으로 저장하고 불러옵니다. `thread_id`를 각 면접 세션에 부여함으로써, 사용자가 중간에 나갔다가 다시 돌아와도 면접을 이어서 진행할 수 있는 컨텍스트 유지를 구현합니다.
-   **오류 처리 및 복원력 (Error Handling & Resilience)**: 각 Worker 노드(특히 외부 API 호출이 있을 수 있는 경우) 내에 `try...catch` 블록을 추가합니다. 실패 시, 상태에 `error` 플래그와 `error_count`를 기록하고, `Supervisor`는 이 상태를 바탕으로 재시도를 지시하거나, 사용자에게 문제를 알리는 등의 대체(Fallback) 전략을 수행하도록 설계하여 시스템 안정성을 높입니다.

## 6. 에이전트별 상세 역할 정의

### 6.1. Supervisor Agent
- **주요 역할**: 면접 흐름 제어 및 의사결정
- **핵심 기능**:
  - 사용자 답변 품질 평가 (추가 질문 필요성 판단)
  - 면접 진행 상황 모니터링 (시간, 질문 수, 커버리지)
  - 다음 에이전트 선택 (기술질문 vs 꼬리질문)
  - 면접 종료 조건 판단

### 6.2. Technical Question Agent
- **주요 역할**: 기술 면접 질문 생성 및 제시
- **핵심 기능**:
  - 사용자 기술 스택 분석
  - 경력 수준별 난이도 조절
  - 이전 답변 기반 다음 질문 영역 선택
  - 실무 중심의 실용적 질문 생성

### 6.3. Follow-up Question Agent
- **주요 역할**: 답변 심화를 위한 꼬리질문 생성
- **핵심 기능**:
  - 답변 분석 및 약점 식별
  - 이론과 실무 경험 구분 질문
  - 모호한 답변 명확화 요청
  - 답변의 한계 및 예외 상황 탐색

## 7. 결론

본 문서에서 제안된 **3개 에이전트 Supervisor-Worker 아키텍처**는 `1_복잡한_상호작용_챗봇_구현_연구.md` 백서의 핵심 원칙들을 충실히 반영하면서도, 기술 면접의 핵심 요소에 집중한 효율적인 설계안입니다. 

이 구조는 **Supervisor**의 지능적인 흐름 제어 하에서 **Technical Question Agent**와 **Follow-up Question Agent**가 협력하여 깊이 있고 체계적인 기술 면접을 진행할 수 있도록 설계되었습니다. 각 에이전트의 전문화된 역할 분담을 통해 면접의 품질을 높이면서도, 향후 새로운 질문 유형이나 평가 방식을 쉽게 추가할 수 있는 **확장성**을 보장합니다.
