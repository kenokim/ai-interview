# AI Interview Chatbot Server

TypeScript 기반의 LangGraph.js를 사용한 AI 기술 면접관 챗봇 서버입니다.

## 🏗️ 아키텍처

이 프로젝트는 **Supervisor-Worker 패턴**을 사용하여 구현되었습니다:

- **Supervisor**: 워크플로우를 관리하고 다음 실행할 Worker를 결정
- **Workers**: 각각의 특화된 역할을 수행하는 에이전트들
  - `greeting_agent`: 면접 시작 및 안내
  - `questioning_agent`: 기술 질문 선택 및 제시
  - `evaluation_agent`: 답변 평가 및 점수 산정
  - `feedback_agent`: 건설적인 피드백 제공
  - `farewell_agent`: 면접 마무리

## 📁 프로젝트 구조

```
server/
├── src/
│   ├── agents/
│   │   ├── supervisor.ts    # 워크플로우 오케스트레이터
│   │   └── workers.ts       # 전문가 에이전트들
│   ├── graph/
│   │   └── interviewer.ts   # 메인 LangGraph 정의
│   ├── types/
│   │   └── state.ts         # 상태 타입 정의
│   └── index.ts             # 서버 진입점
├── package.json             # 의존성 관리
├── tsconfig.json            # TypeScript 설정
├── langgraph.json           # LangGraph 설정
└── .env                     # 환경 변수
```

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# OpenAI API Key (필수)
OPENAI_API_KEY=your_openai_api_key_here

# LangSmith (선택사항 - 트레이싱용)
LANGCHAIN_API_KEY=your_langsmith_api_key_here
LANGCHAIN_TRACING_V2=true
LANGCHAIN_PROJECT=AI_Interview_Chatbot

# 서버 설정
PORT=3000
NODE_ENV=development
```

### 3. LangGraph Studio로 개발하기 (시각적 디버깅)

LangGraph Studio를 사용하면 그래프의 실행 흐름을 시각적으로 확인하고, 각 단계의 상태를 디버깅할 수 있습니다.

1.  **Docker 실행**: LangGraph Studio는 Docker 컨테이너 위에서 프로젝트를 실행합니다. 먼저 Docker Desktop을 설치하고 실행해주세요.
2.  **LangGraph Studio 다운로드**: [공식 릴리즈 페이지](https://github.com/langchain-ai/langgraph/releases)에서 본인의 운영체제에 맞는 LangGraph Studio를 다운로드합니다.

    **CLI (macOS):**
    터미널을 사용하여 아래 명령어로 다운로드할 수도 있습니다. (Apple Silicon Mac 기준)
    ```bash
    # 참고: 아래는 v0.1.1 예시입니다. 최신 버전은 릴리즈 페이지에서 확인 후, URL의 버전 정보를 수정하여 실행하세요.
    curl -L -o LangGraph-Studio-arm64.dmg "https://github.com/langchain-ai/langgraph/releases/download/v0.1.1/LangGraph-Studio-0.1.1-arm64.dmg"
    ```

3.  **Studio에서 프로젝트 열기**: LangGraph Studio를 실행하고, 이 `server` 폴더를 프로젝트로 열어주세요.
4.  **그래프 실행 및 디버깅**: Studio가 자동으로 `langgraph.json` 파일을 인식하여 `interviewer` 그래프를 로드합니다. UI를 통해 직접 입력값을 넣고, 단계별로 실행하며 상태 변화를 추적할 수 있습니다.

### 4. 개발 서버 실행 (터미널)

```bash
npm run dev
```

### 5. 빌드 및 프로덕션 실행

```bash
npm run build
npm start
```

## 🔧 주요 기능

### 상태 관리
- **페르소나 상태**: 면접관의 성격과 말투 관리
- **대화 상태**: 메시지 기록 및 현재 대화 맥락
- **면접 상태**: 질문 풀, 평가 결과, 진행 상황
- **제어 흐름**: 현재 단계 및 다음 실행할 에이전트

### 동적 페르소나 주입
- 각 에이전트가 실행될 때마다 상태에서 페르소나 정보를 읽어와 프롬프트에 동적으로 주입
- 페르소나 드리프트 방지를 위한 아키텍처 수준의 해결책

### 적응형 질문 선택
- 이전 답변의 평가 결과를 바탕으로 다음 질문의 난이도 조절
- 사용자의 기술 스택에 맞춰 질문 커스터마이징

## 📊 LangGraph 설정

`langgraph.json` 파일은 LangGraph Platform 배포를 위한 설정을 포함합니다:

```json
{
  "node_version": "20",
  "dockerfile_lines": [],
  "dependencies": ["."],
  "graphs": {
    "interviewer": "./src/graph/interviewer.ts:interviewerGraph"
  },
  "env": ".env"
}
```

## 🧪 테스트

```bash
npm test
```

## 📚 참고 문서

- [LangGraph.js 공식 문서](https://langchain-ai.github.io/langgraphjs/)
- [LangChain.js 문서](https://js.langchain.com/)
- [프로젝트 설계 문서](../docs/chatbot/)

## 🤝 기여하기

1. 이 레포지토리를 포크하세요
2. 새로운 기능 브랜치를 생성하세요 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋하세요 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시하세요 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성하세요

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요. 