# AI 면접관 챗봇 구현을 위한 핵심 고려사항

본 문서는 AI 면접관 챗봇을 성공적으로 개발하기 위해 사전에 정의하고 고려해야 할 기술적, 설계적 요구사항을 총정리한 체크리스트입니다.

## 1. 상태 (State) 관리 아키텍처

-   통합 상태 객체 정의: `docs/chatbot/2_chatbot_state_design.md`에 정의된 `InterviewState` 인터페이스를 구현의 기준으로 삼습니다.
    -   모듈성: `UserContext`, `TaskState`, `PersonaState` 등 기능별로 분리된 하위 상태 객체의 데이터 흐름을 명확히 합니다.
    -   타입 안정성: TypeScript의 `interface`를 사용하여 개발 전반에 걸쳐 데이터 타입의 일관성을 유지합니다.
-   상태 지속성 (Persistence): 대화의 맥락을 잃지 않도록 상태를 저장하고 불러오는 메커니즘을 결정합니다.
    -   체크포인터(Checkpointer): LangGraph.js의 내장 체크포인터 사용을 전제로, 어떤 종류의 저장소(`MemorySaver`, `RedisSaver` 등)를 사용할지 결정합니다.

## 2. 그래프 (Graph) 구조 및 흐름

-   Supervisor-Worker 패턴 구현: `docs/chatbot/1_chatbot_graph_design.md`에 설계된 아키텍처를 따릅니다.
    -   Supervisor Node: 사용자의 입력과 현재 상태(`InterviewState`)를 분석하여 다음에 호출할 Worker를 결정하는 핵심 라우팅 로직을 구현합니다.
    -   Worker Nodes: 각자의 역할을 수행하는 전문가 에이전트(노드)들을 개별 함수/모듈로 구현합니다.
        -   `greeting_agent`
        -   `questioning_agent`
        -   `evaluation_agent`
        -   `feedback_agent`
        -   `farewell_agent`
-   엣지 (Edges) 정의:
    -   진입점(Entry Point): 그래프의 시작점(`START`)을 `Supervisor` 노드로 연결합니다.
    -   조건부 엣지(Conditional Edges): `Supervisor`의 `flow_control.next_worker` 상태값에 따라 적절한 Worker 노드로 분기하는 로직을 구현합니다.
    -   종료점(Finish Point): 면접 종료 조건(예: `farewell_agent` 완료 후)을 만족했을 때, `END`로 그래프 실행을 마치는 경로를 정의합니다.

## 3. 프롬프트 (Prompts) 설계

-   에이전트별 시스템 프롬프트: 각 Worker 에이전트와 Supervisor의 역할, 목표, 행동 지침을 정의하는 시스템 프롬프트를 작성합니다.
-   페르소나 주입 프롬프트: `PersonaState`의 정보(`name`, `role`, `backstory`, `style_guidelines`)를 시스템 프롬프트나 메시지에 동적으로 주입하여 일관된 페르소나를 유지하는 메커니즘을 설계합니다.
-   작업 특화 프롬프트: 각 에이전트의 구체적인 작업을 위한 프롬프트를 설계합니다.
    -   `evaluation_agent`: "다음 답변을 [채점 기준]에 따라 평가하고, 각 항목에 대한 점수와 근거를 JSON 형식으로 반환해 줘."
    -   `feedback_agent`: "다음 평가 결과를 바탕으로, 지원자에게 격려가 되면서도 개선점을 명확히 알려주는 피드백을 생성해 줘."
    -   `questioning_agent`: "지금까지의 대화 맥락과 지원자의 기술 스택(`user_context.profile`)을 고려하여 다음 질문을 선택하거나 생성해 줘."

## 4. 데이터 소스 및 도구 (Tools)

-   질문 데이터베이스: 면접 질문 목록(`question_pool`)을 어디서 가져올지 결정합니다. (예: JSON 파일, Vector DB, 일반 DB)
-   사용자 프로필 연동: `user_context.profile` 정보를 가져오기 위한 외부 시스템(예: API, DB) 연동 방식을 정의합니다.
-   (선택) Agentic RAG 도구: `questioning_agent`가 지능적으로 질문을 생성/선택하기 위해 사용할 Retriever 도구를 정의합니다.

## 5. 안전장치 (Guardrails) 및 오류 처리

-   입력 검증 로직: `GuardrailState`를 활용하여 사용자의 모든 입력에 대해 안전성(유해성, PII) 및 의도(면접 관련, 범위 이탈)를 검사하는 로직을 구현합니다.
-   오류 처리: 각 노드 실행 시 발생할 수 있는 오류(API 에러, 타임아웃 등)를 `try...catch`로 처리하고, `fallback_count`를 증가시키며 재시도하거나 사용자에게 안내하는 정책을 수립합니다.

## 6. 평가 (Evaluation) 및 모니터링

-   평가 데이터 수집: `EvaluationState`에 정의된 지표(`turn_count`, `task_successful` 등)를 대화 흐름에 따라 적절히 수집하고 업데이트하는 로직을 구현합니다.
-   LangSmith 연동: 디버깅, 추적, 성능 평가를 위해 LangSmith와의 연동을 기본으로 설정합니다.

## 7. 환경 설정 및 종속성

-   기술 스택 확정: TypeScript, Node.js, LangGraph.js 등 주요 라이브러리의 버전을 명시합니다.
-   환경 변수 관리: LLM API 키, DB 접속 정보 등 민감한 정보를 안전하게 관리할 방안을 수립합니다. (예: `.env` 파일)
