# AI Interview Server API Documentation

Express 기반 AI 면접 서버의 REST API 문서입니다.

## 서버 시작

```bash
# 개발 모드 (TypeScript 직접 실행)
npm run dev

# 프로덕션 모드 (빌드 후 실행)
npm run serve

# CLI 모드 (기존 콘솔 인터페이스)
npm run cli
```

## 환경 변수 설정

`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
PORT=3000
NODE_ENV=development
GOOGLE_API_KEY=your_google_api_key_here
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
```

## API 엔드포인트

### 1. 헬스 체크

**GET** `/health`

서버 상태를 확인합니다.

```bash
curl http://localhost:3000/health
```

**응답:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. 면접 시작

**POST** `/api/interview/start`

새로운 면접 세션을 시작합니다.

**요청 본문:**
```json
{
  "jobRole": "Frontend Developer",
  "experience": "mid-level",
  "interviewType": "technical",
  "resume": "선택사항: 이력서 내용",
  "jobDescription": "선택사항: 채용공고 내용",
  "userName": "선택사항: 사용자 이름"
}
```

**파라미터:**
- `jobRole` (필수): 지원 직무
- `experience` (필수): 경력 수준 (`junior`, `mid-level`, `senior`, `lead`)
- `interviewType` (필수): 면접 유형 (`technical`, `behavioral`, `mixed`)
- `resume` (선택): 이력서 내용 (최대 10,000자)
- `jobDescription` (선택): 채용공고 내용 (최대 10,000자)
- `userName` (선택): 사용자 이름

```bash
curl -X POST http://localhost:3000/api/interview/start \
  -H "Content-Type: application/json" \
  -d '{
    "jobRole": "Frontend Developer",
    "experience": "mid-level",
    "interviewType": "technical",
    "userName": "김개발"
  }'
```

**응답:**
```json
{
  "success": true,
  "sessionId": "session_1704067200000_abc123",
  "message": "안녕하세요! 오늘 면접에 참여해주셔서 감사합니다...",
  "stage": "Greeting",
  "turnCount": 0,
  "userContext": {
    "jobRole": "Frontend Developer",
    "experience": "mid-level",
    "interviewType": "technical",
    "resume": null,
    "jobDescription": null,
    "userName": "김개발"
  }
}
```

### 3. 메시지 전송

**POST** `/api/interview/message`

사용자 메시지를 전송하고 AI 응답을 받습니다.

**요청 본문:**
```json
{
  "sessionId": "session_1704067200000_abc123",
  "message": "네, 면접 준비가 되었습니다."
}
```

**파라미터:**
- `sessionId` (필수): 면접 세션 ID
- `message` (필수): 사용자 메시지 (최대 5,000자)

```bash
curl -X POST http://localhost:3000/api/interview/message \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session_1704067200000_abc123",
    "message": "네, 면접 준비가 되었습니다."
  }'
```

**응답:**
```json
{
  "success": true,
  "message": "좋습니다! 그럼 첫 번째 질문을 드리겠습니다...",
  "stage": "Questioning",
  "turnCount": 1,
  "messageCount": 3,
  "currentQuestion": {
    "id": "js_closures",
    "text": "JavaScript의 클로저에 대해 설명해주세요.",
    "category": "JavaScript",
    "difficulty": "medium"
  },
  "questionsAsked": 1,
  "lastEvaluation": {
    "score": 8.5,
    "evaluations": [
      {
        "criterion": "technical_accuracy",
        "score": 9,
        "reasoning": "정확한 기술적 설명"
      }
    ],
    "is_sufficient": true
  },
  "interviewProgress": {
    "stage": "Questioning",
    "totalQuestions": 3,
    "questionsAsked": 1,
    "isComplete": false
  }
}
```

### 4. 세션 상태 조회

**GET** `/api/interview/status/:sessionId`

면접 세션의 현재 상태를 조회합니다.

```bash
curl http://localhost:3000/api/interview/status/session_1704067200000_abc123
```

**응답:**
```json
{
  "success": true,
  "stage": "Questioning",
  "turnCount": 3,
  "messageCount": 7,
  "lastEvaluation": {
    "score": 8.5,
    "evaluations": [...],
    "is_sufficient": true
  }
}
```

### 5. 면접 종료

**POST** `/api/interview/end`

면접 세션을 종료하고 최종 결과를 받습니다.

**요청 본문:**
```json
{
  "sessionId": "session_1704067200000_abc123"
}
```

```bash
curl -X POST http://localhost:3000/api/interview/end \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session_1704067200000_abc123"
  }'
```

**응답:**
```json
{
  "success": true,
  "message": "Interview session ended successfully",
  "sessionSummary": {
    "sessionId": "session_1704067200000_abc123",
    "totalTurns": 5,
    "totalMessages": 11,
    "questionsAsked": 3,
    "stage": "Finished",
    "duration": 1800000
  },
  "finalEvaluation": {
    "score": 8.5,
    "evaluations": [
      {
        "criterion": "technical_accuracy",
        "score": 9,
        "reasoning": "정확한 기술적 설명"
      },
      {
        "criterion": "communication",
        "score": 8,
        "reasoning": "명확한 의사소통"
      }
    ],
    "is_sufficient": true
  },
  "interviewResults": {
    "questionsAsked": [
      {
        "id": "js_closures",
        "text": "JavaScript의 클로저에 대해 설명해주세요.",
        "category": "JavaScript",
        "difficulty": "medium"
      }
    ],
    "finalSummary": "전반적으로 우수한 기술적 지식을 보여주었습니다.",
    "taskSuccessful": true,
    "recommendations": [
      {
        "area": "technical_accuracy",
        "score": 9,
        "feedback": "정확한 기술적 설명"
      },
      {
        "area": "communication",
        "score": 8,
        "feedback": "명확한 의사소통"
      }
    ]
  }
}
```

### 6. 활성 세션 목록

**GET** `/api/interview/sessions`

모든 활성 세션 목록을 조회합니다. (디버깅 용도)

```bash
curl http://localhost:3000/api/interview/sessions
```

**응답:**
```json
{
  "success": true,
  "sessions": [
    {
      "sessionId": "session_1704067200000_abc123",
      "stage": "Questioning",
      "turnCount": 3,
      "messageCount": 7
    }
  ],
  "totalSessions": 1
}
```

## 에러 응답

모든 API 엔드포인트는 에러 발생 시 다음 형식으로 응답합니다:

### 400 Bad Request (입력 검증 실패)
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    "jobRole is required and must be a non-empty string",
    "experience must be one of: junior, mid-level, senior, lead"
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 404 Not Found (세션 없음)
```json
{
  "success": false,
  "error": "Interview session not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to start interview session",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 입력 제한사항

- `message`: 최대 5,000자
- `resume`: 최대 10,000자
- `jobDescription`: 최대 10,000자
- `experience`: `junior`, `mid-level`, `senior`, `lead` 중 하나
- `interviewType`: `technical`, `behavioral`, `mixed` 중 하나

## 사용 예시

### 완전한 면접 플로우

```bash
# 1. 면접 시작
SESSION_ID=$(curl -s -X POST http://localhost:3000/api/interview/start \
  -H "Content-Type: application/json" \
  -d '{
    "jobRole": "Frontend Developer",
    "experience": "mid-level",
    "interviewType": "technical",
    "userName": "김개발"
  }' | jq -r '.sessionId')

# 2. 메시지 전송
curl -X POST http://localhost:3000/api/interview/message \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"message\": \"네, 준비되었습니다.\"
  }"

# 3. 면접 종료
curl -X POST http://localhost:3000/api/interview/end \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\"
  }"
```

## 개발 및 디버깅

- 모든 API 요청과 응답은 콘솔에 로그로 출력됩니다
- `/health` 엔드포인트로 서버 상태를 확인할 수 있습니다
- `/api/interview/sessions`로 현재 활성 세션을 확인할 수 있습니다
- 에러 발생 시 상세한 스택 트레이스가 서버 로그에 출력됩니다

## 보안 고려사항

- 프로덕션 환경에서는 CORS 설정을 적절히 구성하세요
- API 키는 환경 변수로 관리하고 코드에 하드코딩하지 마세요
- 세션 데이터는 현재 메모리에 저장되므로, 프로덕션에서는 Redis나 데이터베이스를 사용하세요
- 입력 검증이 구현되어 있지만, 추가적인 보안 검사를 고려하세요 