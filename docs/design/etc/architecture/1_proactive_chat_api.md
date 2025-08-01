# 프로액티브 상호작용을 위한 API 설계

## 1. 핵심 원칙: 트리거와 로직의 분리

`LangGraph` 기반 프로액티브 에이전트의 안정성과 확장성을 확보하기 위해, API를 두 가지 역할로 명확히 분리합니다.

1.  **프로액티브 트리거 API**: 시스템(백엔드)이 AI의 대화를 촉발시키는 역할.
2.  **대화형 API**: 사용자(클라이언트)가 AI와 직접 메시지를 주고받는 역할.

이러한 **관심사 분리(Separation of Concerns)** 원칙은 각 API의 책임을 명확히 하고, 시스템을 더 유연하고 유지보수하기 쉽게 만듭니다.

---

## 2. API 설계 패턴

### 패턴 1: 프로액티브 트리거 API

이 API는 AI가 사용자에게 먼저 말을 걸어야 하는 특정 **이벤트**가 발생했을 때, **시스템(서버)에 의해 호출**됩니다.

-   **역할**: AI 에이전트의 프로액티브 실행을 시작하도록 **명령(trigger)**합니다.
-   **주요 사용 사례**:
    -   사용자가 면접 지원을 완료했을 때
    -   지정된 면접 시간이 되었을 때
    -   사용자가 특정 페이지에 오래 머물러 도움이 필요하다고 판단될 때
-   **호출 주체**: 외부 시스템 (예: 웹 애플리케이션 백엔드, 스케줄러)
-   **예상 엔드포인트**: `POST /api/interview/trigger`

#### 요청 (Request)

```json
POST /api/interview/trigger
{
  "event_type": "USER_APPLIED", // 이벤트 유형 (예: 지원 완료, 시간 도달 등)
  "event_id": "evt_123456789",    // 멱등성 보장을 위한 고유 이벤트 ID
  "user_id": "user_abcde",        // 대상 사용자 ID
  "session_id": "session_xyz",      // 대화를 추적할 세션 ID 또는 스레드 ID
  "metadata": {                   // 이벤트 관련 추가 정보
    "job_role": "ai_agent"
  }
}
```

#### 응답 (Response)

```json
HTTP/1.1 202 Accepted
{
  "status": "triggered",
  "session_id": "session_xyz",
  "message": "Proactive interview process has been successfully initiated."
}
```

---

### 패턴 2: 대화형 API

이 API는 **사용자 클라이언트(웹 브라우저, 모바일 앱 등)** 가 AI와 직접 상호작용하기 위해 호출합니다. 기존의 채팅 API가 이 역할을 수행합니다.

-   **역할**:
    1.  사용자가 직접 대화를 시작.
    2.  프로액티브하게 시작된 대화에 사용자가 **응답**할 때 메시지를 전달.
-   **호출 주체**: 사용자 클라이언트
-   **기존 엔드포인트 활용**:
    -   `POST /api/interview/start`: 사용자가 직접 면접을 시작.
    -   `POST /api/interview/message`: 진행 중인 대화에 메시지를 전송.

---

## 3. 전체 상호작용 흐름

프로액티브 트리거와 대화형 API가 연동되는 과정은 다음과 같습니다.

1.  **이벤트 발생**: 사용자가 채용 공고에 지원을 완료합니다.
2.  **트리거 API 호출**: 채용 시스템 백엔드는 `POST /api/interview/trigger`를 호출하여 AI 면접관에게 면접을 시작하도록 알립니다.
3.  **AI의 첫 메시지 생성**: LangGraph 에이전트는 요청받은 `event_type`과 `metadata`를 기반으로 개인화된 첫 면접 질문을 생성합니다.
4.  **실행 일시 중지 (Interrupt)**: AI는 첫 메시지를 사용자에게 보낸 후, 사용자의 답변을 기다리기 위해 `interrupt` 상태로 전환됩니다.
5.  **사용자 응답**: 사용자는 웹사이트에 표시된 AI의 첫 질문을 보고 답변을 입력합니다.
6.  **대화형 API 호출**: 사용자 클라이언트는 사용자의 답변을 담아 `POST /api/interview/message`를 호출합니다. 이 때 `session_id`를 함께 전달하여 어떤 대화를 이어갈지 식별합니다.
7.  **대화 재개**: LangGraph 에이전트는 `interrupt` 상태에서 깨어나 사용자의 메시지를 처리하고, 다음 질문을 생성하며 대화를 이어갑니다.

이처럼 두 API를 분리함으로써, 시스템 주도 상호작용과 사용자 주도 상호작용을 명확히 구분하여 견고하고 확장 가능한 아키텍처를 구현할 수 있습니다.
