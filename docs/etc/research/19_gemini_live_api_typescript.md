# **Gemini Live API와 TypeScript를 활용한 실시간 멀티모달 애플리케이션 아키텍처 설계: 2025년 최종 가이드**

## **섹션 1: 2025년 8월의 Gemini API 환경**

2025년 하반기에 Gemini API를 활용하는 개발자는 중대한 기술적 변곡점에 서
있습니다. 이 시점에서는 어떤 SDK를 선택하고 어떤 플랫폼을 기반으로
구축할 것인지에 대한 초기 결정이 프로젝트의 성공과 직결됩니다. 이러한
기초적인 선택을 올바르게 하는 것은 기술 부채를 방지하고 최신 기능에 대한
접근성을 보장하는 가장 중요한 첫걸음입니다.

### **1.1 새로운 표준: @google/genai SDK 심층 분석** {#새로운-표준-googlegenai-sdk-심층-분석}

2025년 8월 현재, JavaScript/TypeScript 환경에서 Gemini API를 사용하는
모든 신규 개발 프로젝트에 대해 유일하게 공식적으로 권장되는 프로덕션용
라이브러리는 **@google/genai** SDK입니다. 이 SDK는 Gemini 2.0 모델
제품군 출시와 함께 2025년 5월에 정식 버전(General Availability)으로
전환되었습니다.

이러한 변화는 단순한 버전 업데이트를 넘어선 Google의 전략적 통합 의지를
보여줍니다. @google/genai는 Gemini, Veo, Imagen 등 Google의 모든 생성형
모델을 위한 통합 인터페이스로 설계되어, 개발자에게 일관되고 풍부한
기능의 경험을 제공하는 것을 목표로 합니다. 특히, 이 SDK는 구형
라이브러리에서는 사용할 수 없는 Live API와 같은 최신 핵심 기능에 대한
접근을 독점적으로 제공합니다. SDK의 설계 철학은 상태 비저장(stateless)과
균일성에 중점을 두며, 모든 API 메서드에 중앙 Client 객체를 통해 접근하는
방식을 채택했습니다.

@google/genai SDK의 핵심 기능은 여러 하위 모듈로 구성되어 있으며, 각
모듈은 특정 목적을 수행합니다. 개발자는 이 모듈들을 통해 Gemini의 강력한
기능들을 활용하게 됩니다.

- ai.models: 텍스트 생성, 스트리밍, 임베딩 계산 등 모델과의 기본적인
  > 상호작용을 담당합니다.

- ai.chats: 대화 기록을 자동으로 관리하여 멀티턴(multi-turn) 챗봇 경험을
  > 간소화합니다.

- ai.files: 멀티모달 프롬프트를 위한 대용량 파일을 업로드하고
  > 관리합니다.

- ai.live: 본 보고서의 핵심 주제인 실시간 양방향 통신을 위한 WebSocket
  > 세션을 시작합니다.

### **1.2 과거와의 작별: @google/generative-ai의 지원 종료** {#과거와의-작별-googlegenerative-ai의-지원-종료}

과거에 사용되던 레거시 SDK인 \*\*@google/generative-ai\*\*는 이제 명확한
지원 종료(deprecation) 경로에 있습니다. 2025년 9월 30일을 기점으로
중요한 버그 수정을 포함한 모든 지원이 영구적으로 중단될 예정입니다.

이는 2025년 8월에 시작하는 모든 신규 프로젝트는 이 라이브러리를 절대
사용해서는 안 된다는 강력한 신호입니다. 공식 문서는 기능 격차가 점점 더
벌어질 것이며, 잠재적인 버그가 더 이상 수정되지 않을 것이라고 명시적으로
경고하고 있습니다. 이는 단순한 권장 사항이 아닌, 기술적 단절을
의미합니다. 따라서 오래된 튜토리얼이나 AI가 생성한 코드에서 이 구형
패키지를 참조하는 경우가 있더라도, 개발자는 의식적으로 최신
@google/genai SDK를 선택해야 합니다. 구형 코드베이스를 유지보수하는 팀을
위해 마이그레이션 가이드가 제공되고 있습니다.

### **1.3 플랫폼의 갈림길: Gemini Developer API vs. Google Cloud Vertex AI** {#플랫폼의-갈림길-gemini-developer-api-vs.-google-cloud-vertex-ai}

@google/genai SDK는 두 개의 서로 다른 백엔드 플랫폼을 대상으로 할 수
있습니다: Gemini Developer API(Google AI Studio를 통해 접근)와 Vertex
AI. 이는 프로젝트의 성격과 확장성을 결정하는 중요한 아키텍처 결정입니다.

**Gemini Developer API**

- **설명:** 가장 간단한 진입점으로, 프로토타이핑, 개인 프로젝트, 빠른
  > 개발이 중요한 서버 측 애플리케이션에 이상적입니다. 인증을 위해
  > 간단한 API 키를 사용합니다.

- **초기화:** new GoogleGenAI({apiKey: \'YOUR_API_KEY\'})와 같이 API
  > 키만으로 간단하게 클라이언트를 초기화할 수 있습니다.^1^

**Google Cloud Vertex AI**

- **설명:** 엔터프라이즈급 플랫폼으로, 견고성, 확장성, 그리고 Google
  > Cloud 생태계와의 깊은 통합을 제공합니다. 고급 보안, 결제 관리,
  > 프로비저닝된 처리량(provisioned throughput)과 같은 기능이 필요한
  > 프로덕션 애플리케이션에 권장되는 경로입니다.

- **초기화:** Vertex AI 초기화는 Google Cloud 프로젝트 ID와
  > 위치(location) 정보가 필요합니다: new GoogleGenAI({ vertexai: true,
  > project: \'\...\', location: \'\...\' }).

플랫폼 선택은 인증 방식, 사용 가능한 모델, 다른 클라우드 서비스와의 통합
가능성에 직접적인 영향을 미칩니다. Vertex AI는 gcloud CLI 설치, 결제
활성화, API 활성화 등 더 많은 초기 설정이 필요하지만, 훨씬 더 통제되고
확장 가능한 환경을 제공합니다. 이 두 플랫폼의 차이점을 명확히 이해하는
것은 프로젝트 초기 단계에서 매우 중요하며, 아래 표는 주요 특징을
비교하여 의사결정을 돕습니다.

**표 1: 플랫폼 비교: Gemini Developer API vs. Vertex AI**

| 기능                   | Gemini Developer API                   | Google Cloud Vertex AI                            |
|------------------------|----------------------------------------|---------------------------------------------------|
| **인증**               | API 키                                 | IAM (Identity and Access Management), 서비스 계정 |
| **초기 설정 복잡도**   | 낮음                                   | 높음 (gcloud CLI, GCP 프로젝트 설정 필요)         |
| **이상적인 사용 사례** | 프로토타이핑, 개인 프로젝트, 빠른 개발 | 프로덕션, 엔터프라이즈급 애플리케이션             |
| **확장성**             | 기본 제공                              | 뛰어난 확장성, 프로비저닝된 처리량 지원           |
| **통합**               | 제한적                                 | Google Cloud 생태계와 완벽 통합                   |
| **주요 기능**          | 핵심 Gemini 기능                       | Grounding, 고급 보안, MLOps 도구 등               |
| **비용 모델**          | 사용량 기반                            | 사용량 기반, 약정 할인, 프로비저닝된 처리량       |

이 비교는 개발자가 프로젝트의 요구사항에 가장 적합한 플랫폼을 초기에
선택하도록 유도합니다. 예를 들어, 간단한 API 키 기반의 Gemini Developer
API로 시작했다가 프로덕션 단계에서 Vertex AI의 엔터프라이즈 기능이
필요하다는 사실을 뒤늦게 깨닫는 흔한 실수를 방지할 수 있습니다. 이는
단순한 편의성 문제가 아니라, 장기적인 아키텍처의 안정성과 확장성을
결정하는 전략적 선택입니다.

## **섹션 2: 기초 설정 및 보안 구성**

이 섹션에서는 TypeScript 프로젝트를 처음부터 올바르게 설정하는 실용적인
단계를 안내하며, 타협할 수 없는 보안 모범 사례를 강조합니다.

### **2.1 환경 전제 조건: Node.js 및 TypeScript 프로젝트 구성** {#환경-전제-조건-node.js-및-typescript-프로젝트-구성}

최신 Node.js 환경은 필수적입니다. 공식 문서는 Node.js 버전 20 이상을
명시하고 있습니다.

1.  **Node.js 버전 확인:** 터미널에서 node -v 명령어를 실행하여 버전을
    > 확인합니다.

2.  **프로젝트 디렉토리 생성:** mkdir gemini-live-agent && cd
    > gemini-live-agent 명령어로 새 디렉토리를 만들고 이동합니다.

3.  **Node.js 프로젝트 초기화:** npm init -y를 실행하여 package.json
    > 파일을 생성합니다.

4.  **TypeScript 설치:** npm install -g typescript를 통해 TypeScript를
    > 전역으로 설치하거나, npm install -D typescript로 개발 의존성으로
    > 추가합니다.

5.  **TypeScript 구성 파일 초기화:** tsc \--init 명령어를 실행합니다. 이
    > 명령어는 타입스크립트 프로젝트의 컴파일 옵션을 정의하는
    > tsconfig.json 파일을 생성합니다.

### **2.2 SDK 설치 및 필수 의존성** {#sdk-설치-및-필수-의존성}

웹 서버를 구축하고 Gemini API와 상호작용하기 위해 핵심 SDK와 지원
패키지를 설치해야 합니다.

- **핵심 의존성 설치:**  
  > Bash  
  > npm install @google/genai express body-parser dotenv  
  >   
  > 이 명령어는 @google/genai SDK와 함께, 서버 구축에 표준적으로
  > 사용되는 express, 요청 본문 파싱을 위한 body-parser, 환경 변수
  > 관리를 위한 dotenv를 설치합니다.^1^ 이 조합은 프로덕션 준비가 된
  > 서버 측 API 프록시를 구축하기 위한 최소한의 표준 스택을 나타냅니다.

- 타입 정의 설치:  
  > 견고한 TypeScript 개발 경험을 위해, 위 패키지들에 대한 타입 정의
  > 파일을 개발 의존성으로 설치합니다.

com npm install -D @types/node @types/express @types/body-parser

\`\`\`

이를 통해 코드 편집기에서 자동 완성 및 타입 검사의 이점을 최대한 활용할
수 있습니다.2

### **2.3 API 키 보안: 타협 불가능한 원칙** {#api-키-보안-타협-불가능한-원칙}

API 키 보안은 Gemini 애플리케이션 개발에서 가장 중요한 원칙입니다.
**절대로 API 키를 소스 코드에 하드코딩하거나 클라이언트 측
애플리케이션에 노출해서는 안 됩니다.** 이는 공식 문서 전반에 걸쳐 가장
빈번하게 반복되는 보안 경고입니다.

1.  **API 키 발급:** Google AI Studio에 방문하여 무료로 API 키를
    > 생성합니다.^1^

2.  **안전한 저장:** 모범 사례는 환경 변수를 사용하는 것입니다.

    - 프로젝트 루트 디렉토리에 .env 파일을 생성합니다.

    - 파일에 키를 추가합니다: GEMINI_API_KEY=\"YOUR_API_KEY_HERE\".

    - 실수로 키가 원격 저장소에 커밋되는 것을 방지하기 위해, 즉시
      > .gitignore 파일에 .env를 추가해야 합니다.

3.  **코드에서 로드:** dotenv 패키지를 사용하여 애플리케이션 시작 시
    > .env 파일의 변수를 process.env 객체로 로드합니다.  
    > TypeScript  
    > // 애플리케이션 진입점 (예: index.ts) 상단  
    > import dotenv from \'dotenv\';  
    > dotenv.config();  
    >   
    > 이 설정을 통해 코드의 다른 부분에서 process.env.GEMINI_API_KEY로
    > 안전하게 키에 접근할 수 있습니다. @google/genai SDK는 클라이언트
    > 초기화 시 apiKey 옵션이 명시적으로 제공되지 않으면 자동으로
    > process.env.GEMINI_API_KEY를 찾아 사용합니다.

이러한 \"기본적으로 안전한(Secure by Default)\" 설정 방식은 단순한 권장
사항을 넘어, 모든 상용 프로젝트의 표준 시작점으로 간주되어야 합니다.
프로젝트 초기부터 보안을 내재화함으로써, 개발 후반부에 발생할 수 있는
심각한 보안 문제를 예방할 수 있습니다.

## **섹션 3: Gemini Live API 마스터하기**

이 섹션에서는 사용자의 핵심 질문인 Live API에 대해 심층적으로 다룹니다.
Live API의 고유한 패러다임과 그로 인해 발생하는 아키텍처 고려 사항을
설명합니다.

### **3.1 Live API 패러다임: REST에서 실시간 WebSocket으로** {#live-api-패러다임-rest에서-실시간-websocket으로}

Live API는 표준적인 generateContent와 같은 REST 방식의 엔드포인트와는
근본적으로 다릅니다. 이 API는 **WebSocket** 연결을 통해 작동하는 상태
저장(stateful), 저지연(low-latency) API입니다. 이는 개발자가 영구적인
연결을 관리하고, 비동기적인 양방향 메시지 스트림을 처리하며, 세션 상태를
관리해야 함을 의미합니다. 상호작용은 단순한 요청-응답 주기가 아니라,
지속적인 대화의 형태를 띕니다. 이 기능은 @google/genai SDK의 ai.live
하위 모듈을 통해 접근할 수 있습니다.

Live API는 단순한 기능 추가가 아니라, Gemini 생태계 내에서 특화된 하위
시스템으로 이해해야 합니다. 자체적인 전용 모델(gemini-live-\*)을
요구하고, 다른 API와는 다른 통신 프로토콜(WebSocket)을 사용하며, SDK
내에 별도의 모듈(ai.live)을 가지고 있습니다. 또한, 고유한 아키텍처
패턴(클라이언트-서버 대 서버-서버)과 보안 고려사항(임시 토큰)을
도입합니다. 따라서 개발자는 기존의 텍스트 생성 코드를 단순히 수정하는
것이 아니라, 실시간 상호작용에 특화된 새로운 패턴과 기술을 학습하고
구현해야 합니다.

### **3.2 핵심 역량: 저지연, 양방향 스트리밍, 그리고 중단 가능성** {#핵심-역량-저지연-양방향-스트리밍-그리고-중단-가능성}

Live API는 자연스러운 인간과 같은 음성 대화를 구현하기 위해
설계되었습니다.

- **저지연성 (Low Latency):** 사용자가 인지할 수 있는 지연 없이 실시간
  > 상호작용을 가능하게 합니다.

- **양방향 스트리밍 (Bidirectional Streaming):** 클라이언트는
  > 입력(오디오, 비디오, 텍스트)을 지속적으로 스트리밍하면서 동시에
  > 모델로부터 출력을 수신할 수 있습니다.

- **중단 가능성 (Interruptibility):** 자연스러운 대화의 핵심 요소로,
  > 사용자가 모델의 음성 응답 도중에 자신의 목소리로 말을 끊고 개입할 수
  > 있게 합니다.

- **고급 기능:** 음성 활동 감지(Voice Activity Detection, VAD), 세션
  > 관리, 보안을 위한 임시 토큰(ephemeral tokens)과 같은 고급 기능도
  > 제공합니다.

### **3.3 실시간 상호작용을 위한 모델 선택** {#실시간-상호작용을-위한-모델-선택}

Live API를 사용하려면 이 목적을 위해 특별히 설계된 모델이 필요하며,
gemini-2.5-pro와 같은 표준 모델은 사용할 수 없습니다.

- **네이티브 오디오 (Native Audio):** 가장 자연스럽고 현실적인 음성을
  > 제공하며, 감성적 대화(affective dialogue)나 능동적 오디오(proactive
  > audio)와 같은 고급 기능을 활성화합니다. 이 모델들은 현재 프리뷰
  > 단계일 수 있습니다.

  - 예시 모델: gemini-2.5-flash-preview-native-audio-dialog.

- **하프-캐스케이드 오디오 (Half-Cascaded Audio):** 텍스트-음성
  > 변환(TTS) 출력을 사용하여, 특히 도구 사용(function calling)과 결합될
  > 때 더 나은 성능과 안정성을 제공합니다. 프로덕션 환경에서 더 신뢰성이
  > 높을 수 있습니다.

  - 예시 모델: gemini-live-2.5-flash.

모델 선택은 원하는 사용자 경험과 기능 세트에 따라 결정됩니다. 네이티브
오디오는 최첨단 경험을 제공하지만, 하프-캐스케이드는 프로덕션 환경에서의
안정성에 중점을 둡니다.

### **3.4 아키텍처 패턴: 서버-서버 vs. 클라이언트-서버** {#아키텍처-패턴-서버-서버-vs.-클라이언트-서버}

공식 문서는 Live API를 구현하기 위한 두 가지 주요 아키텍처 접근 방식을
제시합니다.

- **서버-서버 (Server-to-Server) - 프로덕션 권장:**

  - **흐름:** 클라이언트 (브라우저) → 자체 백엔드 서버 → Gemini Live API

  - **설명:** 클라이언트는 오디오/비디오 스트림을 자체 백엔드 서버로
    > 전송합니다. 안전한 환경에서 실행되는 백엔드 서버가 Gemini API와의
    > WebSocket 연결을 설정하고 프록시 역할을 수행하며 스트림을
    > 중계합니다.

  - **장점:** 최대의 보안 (API 키가 외부에 노출되지 않음), 로직 및
    > 데이터에 대한 완전한 제어.

  - **단점:** 추가적인 네트워크 홉으로 인한 잠재적 지연 시간 증가, 구현
    > 복잡성 증가.

- **클라이언트-서버 (Client-to-Server) - 프로토타이핑 또는 임시 토큰
  > 사용 시:**

  - **흐름:** 클라이언트 (브라우저) → Gemini Live API

  - **설명:** 프론트엔드 코드가 Live API의 WebSocket 엔드포인트에 직접
    > 연결됩니다.

  - **장점:** 낮은 지연 시간, 간단한 설정.

  - **단점:** 정적 API 키를 사용할 경우 심각한 보안 위험. 이 접근 방식은
    > 프로덕션 환경에서 \*\*임시 토큰(ephemeral tokens)\*\*을 사용할
    > 때만 유효합니다.

이 두 아키텍처는 지연 시간과 보안 사이의 명확한 트레이드오프 관계를
보여줍니다. Google의 문서는 클라이언트-서버 접근 방식이 \"더 나은
성능\"과 \"더 쉬운 설정\"을 제공한다고 명시하면서도, 즉시 보안 위험을
경고하고 프로덕션용으로 임시 토큰 사용을 권장합니다. 따라서 개발자는 이
두 가지를 단순한 \'옵션\'이 아니라, \'더 간단하고 빠르지만 덜 안전한
프로토타이핑 경로\'와 \'더 복잡하고 잠재적 지연이 있지만 프로덕션에
안전한 경로\' 사이의 의식적인 선택으로 받아들여야 합니다.

## **섹션 4: 실시간 음성 에이전트 구축: 단계별 구현**

이 섹션에서는 기능적인 음성 채팅 애플리케이션을 위한 완전하고 주석이
달린 코드베이스를 제공합니다. 프로덕션에 권장되는 견고하고 안전한
**서버-서버(Server-to-Server)** 아키텍처를 기반으로 구현합니다. 이
구현은 공식 live-api-web-console 스타터 앱에서 발견되는 패턴을 따릅니다.

### **4.1 Node.js/Express 서버 측 프록시 아키텍처 설계** {#node.jsexpress-서버-측-프록시-아키텍처-설계}

**목표:** 클라이언트가 연결할 수 있는 WebSocket 엔드포인트를 노출하는
Express 서버를 생성합니다. 이 서버는 Gemini Live API와의 연결을 중앙에서
관리합니다.

- **의존성:** express와 WebSocket 라이브러리인 ws를 사용합니다.

- **코드 구조:**

  - index.ts: 메인 서버 파일. Express 서버 설정 및 WebSocket 연결 처리를
    > 담당합니다.

  - gemini-live-service.ts: @google/genai SDK와의 모든 상호작용을
    > 캡슐화하는 전용 모듈입니다.

### **4.2 Live API 세션 시작 및 구성** {#live-api-세션-시작-및-구성}

**목표:** 서버에서 클라이언트가 WebSocket으로 연결될 때, SDK를 사용하여
Gemini Live API와의 세션을 설정합니다.

- **SDK 메서드:** ai.live.connect(params)를 사용합니다.

- **구성:**

  - model: Live API 전용 모델(예: gemini-live-2.5-flash)을 지정합니다.

  - config: 세션 구성을 설정합니다.

    - response_modalities: \`\`와 같이 모델로부터 받을 응답 유형을
      > 요청합니다.^4^

    - input_audio_transcription, output_audio_transcription: 실시간
      > 음성-텍스트 변환을 활성화하여 대화 내용을 텍스트로도 확인할 수
      > 있게 합니다.^4^

아래는 gemini-live-service.ts에 포함될 세션 시작 함수의 예시입니다.

> TypeScript

// gemini-live-service.ts  
import { GoogleGenAI } from \'@google/genai\';  
  
const apiKey = process.env.GEMINI_API_KEY;  
if (!apiKey) {  
throw new Error(\"GEMINI_API_KEY environment variable not set.\");  
}  
  
const ai = new GoogleGenAI({ apiKey });  
  
export async function startLiveSession() {  
try {  
const session = await ai.live.connect({  
model: \'gemini-live-2.5-flash\',  
config: {  
response_modalities:,  
input_audio_transcription: {},  
output_audio_transcription: {},  
},  
});  
console.log(\"Gemini Live API session started.\");  
return session;  
} catch (error) {  
console.error(\"Failed to start Gemini Live session:\", error);  
throw error;  
}  
}

### **4.3 양방향 오디오 스트림 관리** {#양방향-오디오-스트림-관리}

**목표:** 클라이언트의 마이크 오디오 데이터를 Gemini로, 그리고 Gemini의
음성 응답을 다시 클라이언트로 파이핑하는 가장 복잡한 부분을 상세히
설명합니다.

- **클라이언트 측 (React/TypeScript 예시):**

  1.  **마이크 접근 및 녹음:** navigator.mediaDevices.getUserMedia를
      > 사용하여 마이크에 접근하고, MediaRecorder API를 사용하여
      > 오디오를 캡처합니다.

  2.  **WebSocket 연결:** 백엔드 Node.js 서버의 WebSocket 엔드포인트에
      > 연결합니다.

  3.  **오디오 청크 전송:** MediaRecorder의 dataavailable 이벤트가
      > 발생할 때마다 오디오 데이터 청크(Blob 또는 ArrayBuffer)를
      > WebSocket을 통해 서버로 전송합니다.

  4.  **오디오 수신 및 재생:** 서버로부터 수신된 오디오 메시지를
      > 디코딩하고, Web Audio API(AudioContext)를 사용하여 실시간으로
      > 재생합니다. 이 로직은 live-api-web-console의 핵심 구현을
      > 참고합니다.

- **서버 측 (Node.js/ws):**

  1.  **클라이언트 메시지 수신:** 클라이언트 WebSocket에서 들어오는
      > 메시지를 수신합니다.

  2.  **Gemini로 오디오 전달:** 수신된 오디오 바이트를 Gemini Live API
      > 세션으로 전달합니다. SDK는 이 과정을 추상화하지만, 저수준에서는
      > session.send_realtime_input()과 유사한 작업이 수행됩니다.^4^

  3.  **Gemini 응답 수신:** async for (const response of
      > session.receive()) 루프를 사용하여 Gemini 세션으로부터 오디오 및
      > 텍스트 응답을 비동기적으로 수신합니다.

  4.  **클라이언트로 응답 전달:** 수신된 오디오 바이트나 텍스트 데이터를
      > 다시 해당 클라이언트의 WebSocket 연결을 통해 전송합니다.

- **오디오 형식:** **입력 오디오는 16-bit PCM, 16kHz, 모노 형식**이어야
  > 하며, **출력 오디오는 24kHz**라는 엄격한 요구사항을 준수해야
  > 합니다.^4^ 클라이언트 측에서  
  > MediaRecorder를 설정할 때 또는 서버 측에서 오디오를 처리할 때 이
  > 형식을 맞추는 것이 매우 중요합니다.

### **4.4 완전한 주석 코드베이스** {#완전한-주석-코드베이스}

**목표:** 클라이언트(App.tsx)와 서버(index.ts)의 완전하고 작동 가능한
소스 코드를 제공합니다.

#### **서버 코드 (index.ts)** {#서버-코드-index.ts}

> TypeScript

// index.ts  
import express from \'express\';  
import http from \'http\';  
import { WebSocketServer, WebSocket } from \'ws\';  
import dotenv from \'dotenv\';  
import { startLiveSession } from \'./gemini-live-service\';  
  
dotenv.config();  
  
const app = express();  
const server = http.createServer(app);  
const wss = new WebSocketServer({ server });  
  
const PORT = process.env.PORT \|  
  
\| 8080;  
  
wss.on(\'connection\', async (ws: WebSocket) =\> {  
console.log(\'Client connected\');  
  
try {  
// 각 클라이언트 연결에 대해 새로운 Gemini Live 세션을 시작합니다.  
const geminiSession = await startLiveSession();  
  
// Gemini로부터 메시지를 수신하고 클라이언트로 전달합니다.  
(async () =\> {  
try {  
for await (const response of geminiSession.receive()) {  
// 서버 콘텐츠(오디오, 텍스트 등)가 있는 경우에만 처리합니다.  
if (response.server_content) {  
// 응답을 JSON 문자열로 변환하여 클라이언트로 전송합니다.  
ws.send(JSON.stringify(response.server_content));  
}  
}  
} catch (error) {  
console.error(\'Error receiving from Gemini:\', error);  
ws.close();  
}  
})();  
  
// 클라이언트로부터 메시지(오디오 청크)를 수신하고 Gemini로
전달합니다.  
ws.on(\'message\', async (message: Buffer) =\> {  
// 클라이언트에서 받은 오디오 데이터를 Gemini 세션으로 보냅니다.  
await geminiSession.send_realtime_input({ audio: { data: message } });  
});  
  
ws.on(\'close\', () =\> {  
console.log(\'Client disconnected\');  
// 세션 정리 로직 추가 가능  
});  
  
ws.on(\'error\', (error) =\> {  
console.error(\'WebSocket error:\', error);  
});  
  
} catch (error) {  
console.error(\'Failed to initialize connection with Gemini:\',
error);  
ws.close(1011, \'Failed to connect to AI service\');  
}  
});  
  
server.listen(PORT, () =\> {  
console.log(\`Server is listening on port \${PORT}\`);  
});

#### **클라이언트 코드 (React App.tsx)** {#클라이언트-코드-react-app.tsx}

> TypeScript

// App.tsx  
import React, { useState, useRef, useEffect } from \'react\';  
  
const App: React.FC = () =\> {  
const = useState(false);  
const = useState\<string\>(\'\');  
const ws = useRef\<WebSocket \| null\>(null);  
const mediaRecorder = useRef\<MediaRecorder \| null\>(null);  
const audioContext = useRef\<AudioContext \| null\>(null);  
  
useEffect(() =\> {  
return () =\> {  
ws.current?.close();  
};  
},);  
  
const handleToggleRecording = () =\> {  
if (isRecording) {  
// 녹음 중지  
mediaRecorder.current?.stop();  
ws.current?.close();  
setIsRecording(false);  
} else {  
// 녹음 시작  
navigator.mediaDevices.getUserMedia({ audio: true }).then(stream =\> {  
// WebSocket 연결 설정  
ws.current = new WebSocket(\'ws://localhost:8080\');  
  
ws.current.onopen = () =\> {  
console.log(\'WebSocket connected\');  
setIsRecording(true);  
  
// MediaRecorder 설정  
mediaRecorder.current = new MediaRecorder(stream, { mimeType:
\'audio/webm;codecs=opus\' }); // 실제로는 PCM 변환 필요  
mediaRecorder.current.ondataavailable = (event) =\> {  
if (event.data.size \> 0 && ws.current?.readyState === WebSocket.OPEN)
{  
// 서버로 오디오 데이터 전송 (실제 프로덕션에서는 PCM 16kHz로 변환
필요)  
ws.current.send(event.data);  
}  
};  
  
// 100ms 간격으로 데이터 전송  
mediaRecorder.current.start(100);  
};  
  
ws.current.onmessage = (event) =\> {  
const data = JSON.parse(event.data);  
// 텍스트 트랜스크립션 처리  
if (data.output_transcription?.text) {  
setTranscript(prev =\> prev + data.output_transcription.text);  
}  
// 오디오 데이터 처리  
if (data.model_turn?.parts?.inline_data?.data) {  
const audioData = atob(data.model_turn.parts.inline_data.data);  
const audioBuffer = new Uint8Array(audioData.length);  
for (let i = 0; i \< audioData.length; i++) {  
audioBuffer\[i\] = audioData.charCodeAt(i);  
}  
playAudio(audioBuffer.buffer);  
}  
};  
  
ws.current.onclose = () =\> {  
console.log(\'WebSocket disconnected\');  
setIsRecording(false);  
};  
});  
}  
};  
  
const playAudio = async (buffer: ArrayBuffer) =\> {  
if (!audioContext.current) {  
audioContext.current = new (window.AudioContext \|  
  
\| (window as any).webkitAudioContext)({ sampleRate: 24000 });  
}  
const source = audioContext.current.createBufferSource();  
// PCM 데이터를 AudioBuffer로 디코딩 (이 부분은 실제 데이터 형식에 맞게
구현 필요)  
const decodedBuffer = await
audioContext.current.decodeAudioData(buffer);  
source.buffer = decodedBuffer;  
source.connect(audioContext.current.destination);  
source.start();  
};  
  
return (  
\<div\>  
\<h1\>Gemini Live Voice Agent\</h1\>  
\<button onClick={handleToggleRecording}\>  
{isRecording? \'Stop Recording\' : \'Start Recording\'}  
\</button\>  
\<h2\>Transcript:\</h2\>  
\<p\>{transcript}\</p\>  
\</div\>  
);  
};  
  
export default App;

**참고:** 위 클라이언트 코드는 개념 증명을 위한 것이며, MediaRecorder가
생성하는 WebM/Opus 코덱의 오디오를 Gemini가 요구하는 Raw PCM 형식으로
변환하는 로직은 생략되었습니다. 실제 프로덕션에서는 AudioWorklet 등을
사용하여 클라이언트 측에서 실시간 오디오 형식 변환을 구현해야 합니다.

## **섹션 5: 고급 제어 및 기능 통합**

기본적인 음성 채팅을 넘어, SDK의 고급 구성 옵션을 사용하여 에이전트의
행동을 제어하고 기능을 향상시키는 방법을 시연합니다.

### **5.1 generationConfig를 통한 모델 행동 미세 조정** {#generationconfig를-통한-모델-행동-미세-조정}

generationConfig 객체는 모델의 출력 생성 방식을 정밀하게 제어하는 데
사용됩니다. 이는 모델의 창의성, 답변 길이, 무작위성 등을 조절할 수 있는
강력한 도구입니다.

- **주요 매개변수**:

  - temperature: 출력의 무작위성을 제어합니다. 낮은 값(예: 0.2)은 더
    > 결정론적이고 일관된 응답을, 높은 값(예: 0.9)은 더 창의적이고
    > 다양한 응답을 생성합니다. 기본값은 보통 1.0입니다.

  - topP: 다음 토큰을 선택할 때 고려할 토큰 후보군의 누적 확률을
    > 제어합니다. temperature와 함께 사용되어 출력의 다양성을
    > 조절합니다.

  - maxOutputTokens: 응답으로 생성될 수 있는 최대 토큰 수를 제한합니다.

  - stopSequences: 모델이 특정 문자열을 생성하면 응답 생성을 중단하도록
    > 하는 문자열 배열입니다.

모델의 동작은 단일 설정이 아닌, 여러 계층에서 적용될 수 있는 구성의
조합으로 결정됩니다. Vertex AI SDK에서는 모델을 인스턴스화할
때(getGenerativeModel) 프로젝트 전체의 기본값을 설정할 수 있으며, 각
개별 요청(generateContent) 시 이 값을 재정의하여 특정 작업에 맞는 동작을
유도할 수 있습니다. 이러한 계층적 접근 방식은 성숙하고 프로덕션 지향적인
API의 특징이며, 개발자에게 강력한 유연성을 제공합니다.

구현 예시:

아래 코드는 generateContent 호출 시 generationConfig를 전달하는 방법을
보여줍니다.

> TypeScript

// 여러 스니펫(S41, S46, S51, S85)을 종합하여 생성된 예시  
import { GoogleGenAI } from \"@google/genai\";  
  
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });  
const model = ai.models.getGenerativeModel({ model: \"gemini-2.5-flash\"
});  
  
async function generateCreativeStory() {  
const generationConfig = {  
temperature: 0.9,  
topP: 0.95,  
maxOutputTokens: 2048,  
};  
  
const prompt = \"마법의 배낭에 대한 짧은 이야기를 써줘.\";  
  
const result = await model.generateContent({  
contents: \[{ role: \"user\", parts: \[{ text: prompt }\] }\],  
generationConfig: generationConfig,  
});  
  
const response = result.response;  
console.log(response.text());  
}  
  
generateCreativeStory();

### **5.2 safetySettings를 통한 강력한 콘텐츠 관리** {#safetysettings를-통한-강력한-콘텐츠-관리}

Gemini API에는 괴롭힘, 증오심 표현 등 유해 콘텐츠를 차단하기 위한 안전
필터가 내장되어 있으며, 이는 요청별로 구성할 수 있습니다.

- **구성:** safetySettings 매개변수는 각기 category와 차단
  > 임계값(threshold)을 지정하는 객체의 배열입니다. 임계값은 BLOCK_NONE,
  > BLOCK_LOW_AND_ABOVE 등으로 설정할 수 있습니다.

- **구현:** safetySettings 배열을 구성하여 요청에 전달합니다.

**구현 예시:**

> TypeScript

// S47, S48, S51을 종합하여 생성된 예시  
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from
\"@google/genai\";  
  
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });  
const model = ai.models.getGenerativeModel({ model: \"gemini-2.5-flash\"
});  
  
async function generateSafely() {  
const safetySettings =;  
  
const prompt = \"안전하지 않을 수 있는 프롬프트\";  
  
const result = await model.generateContent({  
contents: \[{ role: \"user\", parts: \[{ text: prompt }\] }\],  
safetySettings: safetySettings,  
});  
  
const response = result.response;  
console.log(response.text());  
}  
  
generateSafely();

### **5.3 Live 세션에서 Function Calling으로 에이전트 역량 강화** {#live-세션에서-function-calling으로-에이전트-역량-강화}

Live API는 Function Calling을 지원하여, 모델이 실시간으로 외부 도구 및
API와 상호작용할 수 있게 합니다. 이는 실시간 에이전트의 판도를 바꾸는
기능입니다. 예를 들어, 에이전트는 \"런던 날씨 어때?\"와 같은 음성 요청을
듣고, 실시간으로 날씨 API를 호출한 다음, 그 결과를 사용자에게 음성으로
답할 수 있습니다.

- **프로세스:**

  1.  **함수 선언:** FunctionDeclaration 객체를 사용하여 함수의 이름,
      > 설명, 매개변수를 정의합니다.

  2.  **모델에 제공:** Live API 세션의 tools 구성에 함수 선언을
      > 전달합니다.

  3.  **도구 호출 처리:** 세션에서 발생하는 toolcall 이벤트를
      > 수신합니다. 도구 호출이 수신되면, 해당하는 애플리케이션 코드를
      > 실행합니다.

  4.  **결과 반환:** 함수 실행 결과를 다시 모델에 전송하여 모델이 최종
      > 응답을 생성하도록 합니다.

live-api-web-console 저장소는 이 전체 과정을 보여주는 완전한
React/TypeScript 예제를 제공하므로, 이를 분석하는 것이 매우 유용합니다.

## **섹션 6: 프로토타입에서 프로덕션으로**

이 마지막 실용 섹션에서는 작동하는 데모를 신뢰성 있고 안전하며 복원력
있는 프로덕션 애플리케이션으로 전환하는 데 필요한 중요한 주제들을
다룹니다. Gemini 애플리케이션의 성숙도 모델은 다음과 같이 여러 단계로
나눌 수 있습니다.

1.  **레벨 1 (프로토타입):** API 키를 사용한 직접적인 클라이언트 측
    > 호출. \"프로토타이핑 전용\"으로 명시되어 있습니다.

2.  **레벨 2 (기본 프로덕션):** API 키를 보유하는 서버 측 프록시. 보안의
    > 기준선입니다.

3.  **레벨 3 (고급 프로덕션):** 지연 시간과 보안의 균형을 맞추기 위해
    > 임시 토큰을 사용하는 클라이언트-서버 모델.

4.  **레벨 4 (관리형 프로덕션):** 보안, 상태, 인프라를 대신 처리해주는
    > Firebase AI Logic과 같은 플랫폼 사용.

이 섹션에서는 이러한 성숙도 모델을 따라 개발자가 애플리케이션을 발전시킬
수 있는 명확한 로드맵을 제공합니다.

### **6.1 포괄적인 오류 처리: try\...catch 프레임워크** {#포괄적인-오류-처리-try...catch-프레임워크}

네트워크 호출과 API 상호작용은 실패할 수 있으므로, 견고한 오류 처리는
선택이 아닌 필수입니다. 모든 API 호출은 try\...catch 블록으로 감싸야
합니다.

- **오류 유형:**

  - **네트워크 오류:** fetch 호출 자체가 실패할 수 있습니다.

  - **API 오류:** Gemini API는 잘못된 인수(400), 속도 제한(429), 내부
    > 서버 오류(500) 등 특정 HTTP 상태 코드와 함께 오류를 반환합니다.
    > SDK는 이를 포착할 수 있는 예외를 발생시킵니다.

  - **안전 차단:** 응답 자체가 안전 설정으로 인해 콘텐츠가 차단되었음을
    > 나타낼 수 있습니다 (finishReason: \'SAFETY\'). 이는 전통적인
    > 오류는 아니지만, 우아하게 처리해야 합니다.

오류 처리 코드 예시:

아래 예시는 API 호출을 try\...catch로 감싸고, 응답의 finishReason까지
확인하는 포괄적인 패턴을 보여줍니다.

> TypeScript

import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from
\"@google/genai\";  
  
//\... (model 초기화)  
  
async function makeRobustRequest(prompt: string) {  
try {  
const result = await model.generateContent({  
contents: \[{ role: \"user\", parts: \[{ text: prompt }\] }\],  
//\... safetySettings, generationConfig  
});  
  
const response = result.response;  
  
// 안전 설정에 의해 차단되었는지 확인  
if (response.promptFeedback?.blockReason) {  
console.error(\`Request was blocked. Reason:
\${response.promptFeedback.blockReason}\`);  
return \"죄송합니다. 요청을 처리할 수 없습니다.\";  
}  
  
// 응답 텍스트 반환  
return response.text();  
  
} catch (error) {  
// API 또는 네트워크 오류 처리  
console.error(\"An error occurred during the API call:\", error);  
// 사용자에게 친화적인 메시지 반환  
return \"오류가 발생했습니다. 잠시 후 다시 시도해주세요.\";  
}  
}

**표 2: 일반적인 API 오류 코드 및 해결 전략**

| HTTP 코드 | 오류 이름            | 주요 원인                                                  | 권장 조치 (TypeScript/클라이언트 측)                                                                                                                             |
|-----------|----------------------|------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 400       | INVALID_ARGUMENT     | 요청 본문 형식 오류 (오타, 필수 필드 누락 등)              | API 참조 문서를 확인하여 요청 형식을 검토하고, 사용하는 API 버전과 모델이 해당 기능을 지원하는지 확인합니다.                                                     |
| 429       | RESOURCE_EXHAUSTED   | 속도 제한 초과 (분당 요청 수 초과)                         | 요청 빈도를 줄이거나, 지수 백오프(exponential backoff)를 사용한 재시도 로직을 구현합니다. 필요한 경우 할당량 증가를 요청합니다.                                  |
| 500       | INTERNAL             | Google 측의 예기치 않은 오류, 또는 입력 컨텍스트가 너무 김 | 입력 컨텍스트 길이를 줄이거나, 다른 모델(예: Gemini 1.5 Pro -\> Flash)로 일시적으로 전환해 봅니다. 잠시 후 재시도하고, 문제가 지속되면 피드백을 통해 보고합니다. |
| 503       | UNAVAILABLE          | 서비스가 일시적으로 과부하되었거나 다운됨                  | 잠시 후 재시도하거나 다른 모델로 일시 전환합니다.                                                                                                                |
| N/A       | finishReason: SAFETY | 프롬프트 또는 응답이 안전 필터에 의해 차단됨               | response.promptFeedback.blockReason을 확인하여 원인을 파악하고, 프롬프트를 수정하거나 safetySettings를 조정합니다.                                               |

### **6.2 고급 보안: 임시 토큰 구현** {#고급-보안-임시-토큰-구현}

고성능 클라이언트-서버 아키텍처의 경우, 클라이언트에 정적 API 키를
노출하는 대신 단기 수명(short-lived) 인증 토큰인 \*\*임시 토큰(ephemeral
tokens)\*\*을 사용하는 것이 권장되는 보안 메커니즘입니다.

- **아키텍처:**

  1.  클라이언트 애플리케이션이 자체 백엔드 서버의 인증된 엔드포인트(예:
      > /api/get-gemini-token)를 호출합니다.

  2.  안전한 API 키를 보유한 백엔드 서버가 Gemini API 엔드포인트를
      > 호출하여 단기 수명 토큰을 생성합니다.

  3.  백엔드는 이 토큰을 클라이언트에 반환합니다.

  4.  클라이언트는 이 임시 토큰을 사용하여 Gemini Live API에 직접
      > WebSocket 연결을 설정합니다.

이 패턴은 직접적인 클라이언트-API 연결의 저지연 이점과 서버 관리 자격
증명의 보안을 결합합니다. 공식 문서는 이 프로세스에 대한 가이드를
제공하며, 이를 요약하고 설명하는 것이 중요합니다.

### **6.3 관리형 대안 탐색: Firebase AI Logic 개요** {#관리형-대안-탐색-firebase-ai-logic-개요}

자체 백엔드 프록시를 구축하고 관리하는 것을 피하고 싶은 개발자를 위해,
Firebase AI Logic은 강력한 관리형 대안으로 제시됩니다.

- **장점:**

  - **강화된 보안:** Firebase App Check과 같은 기능을 포함하여 승인되지
    > 않은 클라이언트로부터의 남용을 방지합니다.

  - **간소화된 개발:** SDK가 대화 상태를 관리하고 백엔드의 복잡성을 일부
    > 추상화합니다.

  - **생태계 통합:** Firestore, Remote Config 등 다른 Firebase 서비스와
    > 원활하게 연동됩니다.

이 보고서는 @google/genai SDK 자체에 중점을 두지만, 많은 사용 사례에서
Firebase AI Logic이 더 우수하고 실용적인 프로덕션 경로가 될 수 있음을
언급하는 것이 중요합니다.

## **섹션 7: 결론: 대화형 AI의 미래**

이 마지막 섹션에서는 핵심 학습 내용을 요약하고 실시간 AI 상호작용의
미래를 조망합니다.

### **7.1 모범 사례 및 핵심 아키텍처 요약** {#모범-사례-및-핵심-아키텍처-요약}

- **@google/genai SDK 표준화:** 모든 신규 프로젝트는 이 최신 SDK를
  > 기반으로 해야 합니다.

- **서버 측, 보안 우선 사고방식:** 개발 초기부터 보안을 최우선으로
  > 고려하는 서버 측 아키텍처를 채택해야 합니다.

- **Live API의 특수성 이해:** Live API는 특화된 WebSocket 기반
  > 아키텍처를 요구한다는 점을 인지해야 합니다.

- **전체 구성 옵션 활용:** generationConfig, safetySettings, tools와
  > 같은 전체 구성 옵션을 활용하여 정교하고 신뢰할 수 있는 에이전트를
  > 구축해야 합니다.

### **7.2 실시간 멀티모달 상호작용의 다음 물결 예측** {#실시간-멀티모달-상호작용의-다음-물결-예측}

Live API, 네이티브 오디오 모델, 멀티모달 기능에 대한 Google의 막대한
투자는 명확한 방향성을 시사합니다. 미래는 단순한 텍스트 기반 챗봇이
아니라, 보고, 듣고, 말할 수 있는 완전한 상호작용형, 상황 인식 에이전트의
시대가 될 것입니다.

산업용 모터 유지보수나 자율 AI 에이전트 프레임워크 ^5^와 같은 실제 적용
사례들은 이러한 새로운 사용 사례가 이미 등장하고 있음을 보여주는
구체적인 증거입니다. 앞으로 우리는 초현실적인 고객 서비스 에이전트,
실시간 코드 페어링 어시스턴트, 온디바이스 접근성 도구, 대화형 교육 튜터
등 상상 속에서만 가능했던 애플리케이션들이 현실화되는 것을 목격하게 될
것입니다. 이 가이드에서 다룬 기술과 아키텍처 원칙은 이러한 미래를
구축하는 개발자들에게 견고한 기반이 될 것입니다.

#### 참고 자료

1.  googleapis/js-genai: TypeScript/JavaScript SDK for Gemini \... -
    > GitHub, 8월 1, 2025에 액세스,
    > [[https://github.com/googleapis/js-genai]{.underline}](https://github.com/googleapis/js-genai)

2.  How to use Google Gemini with Node.js and TypeScript - Rootstrap,
    > 8월 1, 2025에 액세스,
    > [[https://www.rootstrap.com/blog/how-to-use-google-gemini-with-node-js-and-typescript]{.underline}](https://www.rootstrap.com/blog/how-to-use-google-gemini-with-node-js-and-typescript)

3.  google-gemini/live-api-web-console - GitHub, 8월 1, 2025에 액세스,
    > [[https://github.com/google-gemini/live-api-web-console]{.underline}](https://github.com/google-gemini/live-api-web-console)

4.  Live API \| Generative AI on Vertex AI \| Google Cloud, 8월 1,
    > 2025에 액세스,
    > [[https://cloud.google.com/vertex-ai/generative-ai/docs/live-api]{.underline}](https://cloud.google.com/vertex-ai/generative-ai/docs/live-api)

5.  Building an AI Agent with Gemini and TypeScript - DEV Community, 8월
    > 1, 2025에 액세스,
    > [[https://dev.to/gsk007/building-an-ai-agent-with-google-gemini-a-modular-approach-inspired-by-agent-from-scratch-29ef]{.underline}](https://dev.to/gsk007/building-an-ai-agent-with-google-gemini-a-modular-approach-inspired-by-agent-from-scratch-29ef)
