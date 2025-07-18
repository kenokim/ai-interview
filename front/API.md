# AI 면접 서버 API 문서

Express 기반 AI 면접 서버의 REST API 문서입니다.

## API 엔드포인트

### 1. 면접 시작

새로운 면접 세션을 시작하고 첫 번째 AI 메시지를 받습니다.

-   **엔드포인트**: `POST /api/interview/start`
-   **Content-Type**: `application/json`

#### 요청 본문

```json
{
  "jobRole": "Frontend Developer",
  "experience": "mid-level",
  "interviewType": "technical",
  "resume": "Optional: 이력서 내용",
  "jobDescription": "Optional: 채용공고 내용",
  "userName": "김개발"
}
```

#### 응답 (성공)

```json
{
  "success": true,
  "data": {
    "sessionId": "session_1704067200000_abc123",
    "initial_message": "안녕하세요! 오늘 면접에 참여해주셔서 감사합니다...",
    "stage": "Greeting"
  }
}
```

---

### 2. 메시지 전송

사용자의 메시지(답변)를 전송하고 AI의 다음 응답(질문)을 받습니다.

-   **엔드포인트**: `POST /api/interview/message`
-   **Content-Type**: `application/json`

#### 요청 본문

```json
{
  "sessionId": "session_1704067200000_abc123",
  "message": "네, 면접 준비가 되었습니다."
}
```

#### 응답 (성공)

```json
{
  "success": true,
  "data": {
    "response": "좋습니다! 그럼 첫 번째 질문을 드리겠습니다...",
    "stage": "Questioning"
  }
}
```

---

### 3. 세션 상태 조회

특정 면접 세션의 현재 상태를 조회합니다.

-   **엔드포인트**: `GET /api/interview/status/:sessionId`

#### 응답 (성공)

```json
{
  "success": true,
  "data": {
    "sessionId": "session_1704067200000_abc123",
    "stage": "Questioning",
    "turnCount": 3,
    "lastEvaluation": {
      "score": 8.5,
      "reasoning": "정확한 기술적 설명"
    }
  }
}
```

---

### 4. 면접 종료

면접 세션을 종료하고 최종 결과를 요청합니다.

-   **엔드포인트**: `POST /api/interview/end`
-   **Content-Type**: `application/json`

#### 요청 본문

```json
{
  "sessionId": "session_1704067200000_abc123"
}
```

#### 응답 (성공)

```json
{
  "success": true,
  "data": {
    "message": "Interview session ended successfully.",
    "finalEvaluation": {
      "overallScore": 8.5,
      "summary": "전반적으로 우수한 기술적 지식을 보여주었습니다."
    }
  }
}
```

---

### 5. 모든 세션 목록 조회 (디버깅용)

현재 서버에 활성화된 모든 면접 세션 목록을 조회합니다.

-   **엔드포인트**: `GET /api/interview/sessions`

#### 응답 (성공)

```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "sessionId": "session_1704067200000_abc123",
        "stage": "Questioning"
      }
    ],
    "totalSessions": 1
  }
}
```

---

## 에러 응답 형식

API 요청이 실패할 경우, 모든 엔드포인트는 다음 형식의 응답을 반환합니다.

```json
{
  "success": false,
  "error": "에러 메시지 (예: Validation failed)",
  "details": [
    "상세 에러 내용 (예: sessionId is required)"
  ]
}
``` 