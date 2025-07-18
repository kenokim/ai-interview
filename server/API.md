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
    "sessionId": "interview_1721286000000_a1b2c3d4e",
    "initialMessage": "안녕하세요! 오늘 면접에 참여해주셔서 감사합니다. 준비되셨으면 시작하겠습니다."
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
  "sessionId": "interview_1721286000000_a1b2c3d4e",
  "message": "네, 면접 준비가 되었습니다."
}
```

#### 응답 (성공)

```json
{
  "success": true,
  "data": {
    "response": "좋습니다! 그럼 첫 번째 질문을 드리겠습니다. JavaScript의 클로저에 대해 설명해주시겠어요?",
    "completed": false
  }
}
```

---

### 3. 세션 상태 조회

특정 면접 세션의 현재 상태(State) 전체를 조회합니다.

-   **엔드포인트**: `GET /api/interview/status/:sessionId`

#### 응답 (성공)

```json
{
  "success": true,
  "data": {
    "user_context": {
      "user_id": "interview_1721286000000_a1b2c3d4e",
      "profile": {
        "name": "김개발",
        "experience_level": "mid-level",
        "tech_stack": ["Frontend Developer"]
      }
    },
    "messages": [
      { "type": "human", "content": "네, 면접 준비가 되었습니다." },
      { "type": "ai", "content": "좋습니다! 그럼 첫 번째 질문을 드리겠습니다..." }
    ],
    "task": {
      "interview_stage": "Questioning",
      "current_question": { "id": "q1", "content": "..." },
      "questions_asked": [ { "id": "q1", "content": "..." } ]
    },
    "next": "FINISH"
  }
}
```

---

### 4. 면접 종료

면접 세션을 수동으로 종료하고 간단한 요약 메시지를 받습니다.

-   **엔드포인트**: `POST /api/interview/end`
-   **Content-Type**: `application/json`

#### 요청 본문

```json
{
  "sessionId": "interview_1721286000000_a1b2c3d4e"
}
```

#### 응답 (성공)

```json
{
  "success": true,
  "data": {
    "summary": "면접이 완료되었습니다. 총 15개의 메시지가 교환되었습니다."
  }
}
```

---

### 5. 모든 세션 목록 조회 (디버깅용)

현재 서버에 저장된 모든 면접 세션의 ID 목록을 조회합니다.

-   **엔드포인트**: `GET /api/interview/sessions`

#### 응답 (성공)

```json
{
  "success": true,
  "data": {
    "sessions": [
      "interview_1721286000000_a1b2c3d4e",
      "interview_1721286000000_f5g6h7i8j"
    ],
    "totalSessions": 2
  }
}
```

---

## 에러 응답 형식

API 요청이 실패할 경우, 모든 엔드포인트는 다음 형식의 응답을 반환합니다.

```json
{
  "success": false,
  "error": "에러 메시지 (예: Session not found)",
  "timestamp": "2025-07-18T08:00:00.000Z"
}
``` 