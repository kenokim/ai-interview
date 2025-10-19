# AI Interview Backend

TypeScript 기반의 NestJS 서버로 구현된 AI 인터뷰 플랫폼의 백엔드 API입니다.

## 🚀 시작하기

### 설치

```bash
npm install
```

### 환경 변수 설정

`.env` 파일을 생성하고 다음과 같이 설정하세요:

```env
# Application
PORT=4001
NODE_ENV=development

# Google Gemini API (필수)
GOOGLE_API_KEY=your_gemini_api_key_here

# API Configuration
API_PREFIX=api/v1

# CORS Origins
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:5174

# Swagger
SWAGGER_TITLE=AI Interview Backend API
SWAGGER_DESCRIPTION=AI Interview platform backend API documentation
SWAGGER_VERSION=1.0

# Logging
LOG_Level=debug
```

**🔑 Gemini API Key 발급:**
1. [Google AI Studio](https://makersuite.google.com/app/apikey) 방문
2. API Key 생성
3. `.env` 파일의 `GOOGLE_API_KEY`에 설정

### 개발 서버 실행

```bash
npm run start:dev
```

서버가 실행되면:
- API: http://localhost:4001/api/v1
- Swagger 문서: http://localhost:4001/api

## 📋 API 엔드포인트

### Question Generator

**POST** `/api/v1/agents/question-generator`

면접 질문을 생성합니다.

#### 요청 Body

```json
{
  "userProfile": {
    "jobRole": "backend",
    "experience": "mid-level", 
    "interviewType": "technical",
    "language": "en",
    "resume": "Software Engineer with 3 years...",
    "jobDescription": "We are looking for..."
  },
  "previousQAs": [
    {
      "question": "What is your experience with Node.js?",
      "answer": "I have been working with Node.js for 3 years..."
    }
  ],
  "sessionId": "session_123456"
}
```

#### 응답

```json
{
  "success": true,
  "data": {
    "question": "Can you explain the difference between REST and GraphQL APIs?",
    "category": "API Design",
    "difficulty": "intermediate",
    "expectedPoints": [
      "REST principles and constraints",
      "GraphQL query language benefits",
      "Use case comparisons"
    ]
  },
  "sessionId": "session_123456",
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

## 🛠️ 기술 스택

- **Framework**: NestJS
- **Language**: TypeScript
- **LLM**: Google Gemini 1.5 Flash
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator, class-transformer
- **Environment**: dotenv, @nestjs/config

## 📁 프로젝트 구조

```
src/
├── agents/                    # AI 에이전트 모듈들
│   ├── agents.module.ts
│   └── question-generator/    # 질문 생성기
│       ├── question-generator.module.ts
│       ├── question-generator.controller.ts
│       ├── question-generator.service.ts    # Gemini API 통합
│       └── question-generator.dto.ts
├── app.module.ts             # 루트 모듈 (ConfigModule 포함)
└── main.ts                   # 애플리케이션 진입점
```

## 🧪 스크립트

```bash
# 개발 서버
npm run start:dev

# 빌드
npm run build

# 프로덕션 실행
npm run start:prod

# 테스트
npm run test

# 린트
npm run lint

# 포맷
npm run format
```
