# **TypeScript를 활용한 Gemini Live API 실시간 멀티모달 AI 구축: 개발자 가이드**

## **서론**

### **실시간 AI로의 패러다임 전환**

기존의 인공지능 상호작용은 주로 요청-응답(request-response) 모델에
기반했습니다. 사용자가 질의를 보내면 서버가 처리 후 응답을 반환하는 이
방식은 많은 애플리케이션에 효과적이었지만, 인간의 대화처럼 자연스럽고
연속적인 상호작용을 구현하는 데에는 한계가 있었습니다. 최근 기술의
발전은 이러한 패러다임을 실시간, 저지연(low-latency) 대화형 인터페이스로
전환시키고 있습니다. 이 변화는 차세대 음성 비서, 실시간 번역, 대화형
교육 에이전트 등 새로운 종류의 애플리케이션 등장을 촉진하고 있습니다.

### **Gemini Live API 소개**

Gemini Live API는 이러한 실시간 경험을 구축하기 위한 Google의 핵심
기술입니다. 이 API의 핵심 가치는 오디오, 비디오, 텍스트의 연속적인
스트림을 처리하여 즉각적이고 인간과 유사한 음성 응답을 제공하는 데
있습니다. 이를 통해 개발자는 사용자와 모델 간의 자연스러운 대화 흐름을
만들 수 있습니다.

### **보고서의 목표 및 대상 독자**

본 보고서는 TypeScript 개발자를 위한 포괄적인 가이드입니다. 아키텍처
설계부터 SDK 사용법, 다양한 모달리티(modality)를 위한 실용적인 코드
구현, 그리고 고급 기능 활용법까지 심도 있게 다룰 것입니다. 최종적으로는
프로덕션 수준의 애플리케이션을 위한 청사진을 제시하는 것을 목표로
합니다.

### **\"프리뷰\" 상태에 대한 참고사항**

보고서를 시작하기에 앞서, Gemini Live API는 현재 \"프리뷰(Preview)\"
단계에 있다는 점을 명확히 해야 합니다. 이는 API의 기능이나 사양이 예고
없이 변경될 수 있음을 의미하며, 개발자는 이를 염두에 두고 시스템을
설계해야 합니다. 실제로 모델의 응답이 중간에 끊기는 현상이 보고된
사례는, 프리뷰 제품이 가질 수 있는 잠재적 불안정성을 보여주는 구체적인
예시입니다.

## **섹션 1: 실시간 대화형 애플리케이션 아키텍처 설계**

코드를 작성하기 전에, 애플리케이션의 견고한 기반을 보장하기 위한
핵심적인 상위 수준의 결정들을 다룹니다. 이 섹션은 전략적 사고와 다양한
아키텍처 패턴의 장단점을 이해하는 데 중점을 둡니다.

### **1.1 Gemini Live API: 핵심 개념 및 기능** {#gemini-live-api-핵심-개념-및-기능}

#### **저지연 양방향 통신**

Live API는 웹소켓(WebSockets) 기술을 기반으로 구축되어, 양방향 실시간
데이터 흐름을 가능하게 합니다. 이는 자연스러운 대화와
끼어들기(interruption)를 구현하는 데 필수적인 기술입니다.^1^ 기존의
요청-응답 방식의 REST API와는 근본적인 차이를 보입니다.

#### **멀티모달리티**

API는 오디오, 비디오, 텍스트 스트림을 동시에 처리할 수 있는
멀티모달(multimodal) 능력을 갖추고 있습니다. 이는 사용자가 화면이나
카메라로 보고 있는 것에 대해 대화하는 것과 같은 풍부하고 맥락적인
상호작용을 가능하게 합니다.

#### **고급 기능 개요**

음성 활동 감지(Voice Activity Detection, VAD)를 통한 끼어들기 처리, 외부
도구와의 연동을 위한 함수 호출(Function Calling), 그리고 향상된 세션
관리와 같은 핵심 고급 기능들은 이후 섹션에서 자세히 다룰 것입니다.

#### **지원 모델**

Live API와 호환되는 모델 목록은 공식 문서에서 확인할 수 있으며, 각
모델은 네이티브 오디오(native audio)나 하프-캐스케이드(half-cascade)와
같이 서로 다른 기능을 지원하므로 신중한 선택이 필요합니다.

### **1.2 구현 경로: 서버-사이드 vs. 클라이언트-사이드 아키텍처** {#구현-경로-서버-사이드-vs.-클라이언트-사이드-아키텍처}

#### **서버-투-서버(Server-to-Server) 접근 방식**

이 아키텍처에서는 개발자의 백엔드 서버가 클라이언트 애플리케이션(웹,
모바일)과 Gemini Live API 사이의 프록시 역할을 합니다.^2^ 클라이언트는
미디어 스트림을 개발자의 서버로 전송하고, 서버는 이를 다시 Google API로
전달합니다.

#### **클라이언트-투-서버(Client-to-Server) 접근 방식**

이 아키텍처에서는 클라이언트 애플리케이션이 개발자의 백엔드를 거치지
않고 웹소켓을 통해 Gemini Live API에 직접 연결하여 미디어 스트림을
전송합니다.^2^

#### **보안 영향: API 키 vs. 임시 토큰** {#보안-영향-api-키-vs.-임시-토큰}

두 아키텍처의 선택은 중요한 보안 문제를 수반합니다. 표준 API 키를
클라이언트 사이드 코드에 직접 포함시키는 것은 심각한 보안 위험을
초래합니다. 따라서 클라이언트-투-서버 아키텍처에 권장되는 방식은 임시
토큰(ephemeral token)을 사용하는 것입니다. 임시 토큰은 보안이 확보된
백엔드에서 발급받아 클라이언트에게 단기간의 접근 권한을 부여하는 데
사용됩니다.

이러한 구조는 \"클라이언트냐 서버냐\"의 단순한 선택이 아님을 시사합니다.
가장 낮은 지연 시간을 제공하는 클라이언트-투-서버 접근 방식조차도,
안전한 인증을 위해서는 토큰을 발급하는 최소한의 백엔드 구성 요소가
필수적입니다. 이 점은 프로젝트 계획 단계에서 반드시 고려해야 할 중요한
기술적 요구사항입니다.

**표 1.1: 구현 경로 장단점 비교**

| 기능                   | 서버-투-서버                                     | 클라이언트-투-서버                    |
|------------------------|--------------------------------------------------|---------------------------------------|
| **지연 시간**          | 높음 (추가 네트워크 홉 발생)                     | 낮음 (직접 연결)                      |
| **보안**               | 높음 (API 키가 서버에만 저장됨)                  | 낮음 (임시 토큰 메커니즘 필수)        |
| **구현 복잡도**        | 높음 (프록시 서버 구현 필요)                     | 중간 (토큰 발급 백엔드 필요)          |
| **확장성**             | 서버 인프라에 따라 결정됨                        | Google 인프라에 의존                  |
| **비용 (데이터 전송)** | 클라이언트-서버, 서버-API 간 이중 전송 비용 발생 | 클라이언트-API 간 단일 전송 비용 발생 |

### **1.3 오디오 생성 모델 선택: 네이티브 vs. 하프-캐스케이드** {#오디오-생성-모델-선택-네이티브-vs.-하프-캐스케이드}

#### **네이티브 오디오 (Native Audio)**

이 아키텍처는 가장 자연스러운 음성을 제공하며, 감성 대화(affective
dialogue, 사용자의 어조 이해)나 능동적 오디오(proactive audio, 무관한
소음 무시)와 같은 고급 기능을 활성화합니다.^2^

gemini-2.5-flash-preview-native-audio-dialog와 같은 모델이 이를
지원합니다.

#### **하프-캐스케이드 오디오 (Half-Cascade Audio)**

이 아키텍처는 텍스트-음성 변환(Text-to-Speech, TTS) 출력을 사용합니다.
음성의 자연스러움은 다소 떨어지지만, 특히 도구/함수 호출 기능을 사용할
때 더 나은 안정성을 제공합니다.^2^

gemini-live-2.5-flash-preview와 같은 모델이 이 방식을 사용합니다.

#### **표준 TTS와의 차이점**

Live API의 오디오 생성은 대화형, 비정형 상호작용에 최적화되어 있는 반면,
표준 Gemini API의 TTS(gemini-2.5-flash-preview-tts)는 오디오북과 같이
정확한 텍스트 낭독이 필요한 시나리오에 적합합니다.

**표 1.2: Gemini Live API 모델 비교**

| 모델명                                       | 오디오 아키텍처 | 주요 기능                                      | 권장 사용 사례                                |
|----------------------------------------------|-----------------|------------------------------------------------|-----------------------------------------------|
| gemini-2.5-flash-preview-native-audio-dialog | 네이티브 오디오 | 감성 대화, 능동적 오디오, 가장 자연스러운 음성 | 최고 품질의 음성 비서, 인간과 유사한 상호작용 |
| gemini-live-2.5-flash-preview                | 하프-캐스케이드 | 도구/함수 호출 시 높은 안정성                  | 외부 API 연동이 잦은 대화형 에이전트          |
| gemini-2.0-flash-live-001                    | 하프-캐스케이드 | 안정적인 프로덕션 환경용                       | 안정성이 중요한 상용 서비스                   |

### **1.4 프로덕션 경로: Firebase AI Logic의 역할과 한계** {#프로덕션-경로-firebase-ai-logic의-역할과-한계}

#### **Google의 권장 사항**

Google은 프로덕션 웹 앱의 경우, App Check와 같은 강화된 보안 기능과
간소화된 통합을 제공하는 Firebase AI Logic SDK 사용을 권장합니다.

#### **결정적인 한계**

하지만 최신 문서에 따르면, **Firebase AI Logic SDK는 아직 웹 앱에서 Live
API를 지원하지 않습니다**.^4^ 현재는 Vertex AI 백엔드를 사용하는
Android, Flutter, Unity 앱에서만 사용 가능합니다.

이는 웹 개발자에게 중요한 갈림길을 제시합니다. Google의 보안 모범 사례를
따르려면 Firebase AI Logic을 사용해야 하지만, 이 경로에서는 Live API를
사용할 수 없습니다. 따라서 현재 웹에서 실시간 대화 기능을 구현하려는
개발자는 @google/genai SDK를 직접 사용하고, 1.2절에서 논의된 임시 토큰
패턴과 같은 자체 보안 아키텍처를 구축해야 합니다. 이는 Google이 권장하는
웹 앱 프로덕션 경로에서 벗어나 더 큰 보안 및 구현 부담을 감수해야 함을
의미합니다.

## **섹션 2: 환경 설정 및 SDK 구성**

TypeScript 프로젝트를 위한 개발 환경을 준비하는 실용적이고 단계적인
가이드입니다.

### **2.1 Google Gen AI SDK (@google/genai) 설치 및 구성** {#google-gen-ai-sdk-googlegenai-설치-및-구성}

먼저, npm 또는 yarn을 사용하여 패키지를 설치합니다.

npm install @google/genai

이후, Google AI Studio(API 키 사용) 또는 Vertex AI용으로 SDK를 초기화할
수 있습니다.^5^

**Node.js 예제:**

> TypeScript

import { GoogleGenAI } from \"@google/genai\";  
  
// 보안을 위해 환경 변수에서 API 키 로드  
const GEMINI_API_KEY = process.env.GEMINI_API_KEY as string;  
const ai = new GoogleGenAI(GEMINI_API_KEY);

**브라우저 예제 (보안 경고 포함):**

> TypeScript

import { GoogleGenAI } from \"@google/genai\";  
  
// 경고: 프로토타이핑 전용입니다. 클라이언트 사이드 코드에 API 키를
노출하지 마십시오.  
// 프로덕션 환경에서는 임시 토큰을 사용해야 합니다.  
const ai = new GoogleGenAI(\"YOUR_GEMINI_API_KEY\");

SDK의 공식 소스 코드는 js-genai GitHub 저장소에서 확인할 수 있습니다.

### **2.2 중요 보안 참고사항: API 키 관리** {#중요-보안-참고사항-api-키-관리}

다시 한번 강조하지만, **클라이언트 사이드 코드에 API 키를 노출하는 것을
피해야 합니다**. 서버 사이드 개발에서는 dotenv와 같은 패키지를 사용하여
환경 변수로 키를 관리하는 것이 모범 사례입니다. 프로덕션 환경의
클라이언트 사이드 연결에는 1.2절에서 설명한 임시 토큰 방식이 유일하게
안전한 대안입니다.

## **섹션 3: 핵심 대화 흐름 구현: TypeScript 심층 분석**

본 보고서의 핵심으로, 주요 사용 사례에 대한 상세하고 주석이 달린
TypeScript 코드를 제공합니다. 공식 문서와 커뮤니티 예제의 정보를
종합하여 일관된 가이드를 제시합니다.

### **3.1 ai.live.connect()를 이용한 라이브 세션 설정** {#ai.live.connect를-이용한-라이브-세션-설정}

모든 실시간 상호작용은 @google/genai SDK의 ai.live 하위 모듈에서
시작됩니다. connect 메서드는 세션을 설정하는 진입점 역할을 합니다.

connect 메서드는 session 객체를 반환하며, 상호작용은 단순한 await
response 형태가 아닙니다. 대신, 개발자는 onopen, onmessage, onerror,
onclose와 같은 콜백을 통해 이벤트를 수신해야 합니다. 이는 REST API에
익숙한 개발자들이 사고방식을 전환해야 함을 의미합니다. 서버로부터
비동기적으로 들어오는 메시지를 올바르게 관리하는 이벤트 기반 패턴을
익히는 것이 중요합니다. 공식 예제에서는 responseQueue와 waitMessage
루프를 사용하여 이를 처리하는 일반적인 패턴을 보여줍니다.

**표 3.1: Live API 연결 구성(config) 파라미터**

| 파라미터명                 | 타입   | 설명                                                                      | 예시 값                                                           |
|----------------------------|--------|---------------------------------------------------------------------------|-------------------------------------------------------------------|
| response_modalities        | string | 모델의 응답 형식을 지정합니다. TEXT 또는 AUDIO 중 하나만 설정 가능합니다. | \`\`                                                              |
| system_instruction         | object | 대화 전반에 걸쳐 모델의 행동을 정의하는 시스템 지침입니다.                | { parts: }                                                        |
| tools                      | object | 모델이 사용할 수 있는 외부 도구(함수 호출, Google 검색 등)를 제공합니다.  | \`\`                                                              |
| input_audio_transcription  | object | 입력 오디오에 대한 전사(transcription)를 활성화합니다.                    | {}                                                                |
| output_audio_transcription | object | 출력 오디오에 대한 전사를 활성화합니다.                                   | {}                                                                |
| speechConfig               | object | 음성 출력의 목소리, 언어 등을 설정합니다.                                 | { voiceConfig: { prebuiltVoiceConfig: { voiceName: \'Kore\' } } } |
| realtimeInputConfig        | object | 음성 활동 감지(VAD) 설정을 구성합니다.                                    | { automaticActivityDetection: { disabled: false } }               |

### **3.2 양방향 텍스트 스트리밍: 실시간 채팅 인터페이스 구축** {#양방향-텍스트-스트리밍-실시간-채팅-인터페이스-구축}

실시간으로 텍스트 메시지를 주고받는 방법을 구현합니다.

**코드 예제:**

> TypeScript

import { GoogleGenAI, Modality } from \"@google/genai\";  
  
async function runTextChat() {  
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY as string);  
const model = \"gemini-live-2.5-flash-preview\";  
const config = { responseModalities: };  
  
const session = await ai.live.connect({  
model: model,  
config: config,  
callbacks: {  
onmessage: (message) =\> {  
if (message.text) {  
process.stdout.write(message.text);  
}  
if (message.serverContent?.turnComplete) {  
console.log(\"\n\[Model turn complete\]\");  
}  
},  
onerror: (e) =\> console.error(\"Error:\", e.message),  
}  
});  
  
console.log(\"Session started. Type your message and press Enter.\");  
  
// 사용자 입력을 받아 서버로 전송  
process.stdin.on(\'data\', async (data) =\> {  
const userInput = data.toString().trim();  
if (userInput.toLowerCase() === \'exit\') {  
session.close();  
process.exit();  
}  
  
await session.sendClientContent({  
turns: \[{ role: \"user\", parts: \[{ text: userInput }\] }\],  
turnComplete: true // 이 메시지 후 모델이 응답하도록 함  
});  
});  
}  
  
runTextChat();

이 코드는 response_modalities를 TEXT로 설정하고,
session.sendClientContent를 사용하여 사용자 메시지를 전송합니다.
onmessage 콜백에서는 수신되는 텍스트 조각을 실시간으로 출력하고,
turnComplete 플래그를 확인하여 모델의 응답이 끝났음을 감지합니다.

### **3.3 양방향 오디오 스트리밍: 완전한 음성 대화** {#양방향-오디오-스트리밍-완전한-음성-대화}

이 부분은 가장 복잡하지만 핵심적인 구현입니다. 음성 대화의 전체 과정을
다룹니다. Live API는 특정 오디오 형식(raw 16-bit PCM, 16kHz)을
요구하지만, 브라우저의 마이크 입력은 이 형식으로 바로 제공되지
않습니다.^1^ 따라서 클라이언트 애플리케이션은 오디오를 캡처, 다운샘플링,
인코딩 후 전송해야 합니다. 마찬가지로, API가 반환하는 오디오(raw 16-bit
PCM, 24kHz) 역시 직접 재생할 수 없으므로, 클라이언트가 버퍼링하고
스케줄링하여 끊김 없이 재생해야 합니다. 이 모든 정밀한 오디오 조작에는
브라우저의 Web Audio API가 필수적입니다.^1^

#### **3.3.1 Web Audio API로 마이크 입력 캡처하기** {#web-audio-api로-마이크-입력-캡처하기}

먼저 navigator.mediaDevices.getUserMedia({ audio: true })를 사용하여
마이크 접근 권한을 요청하고 미디어 스트림을 얻습니다.^1^ 그 다음,

AudioContext를 생성하고 이 스트림을 AudioWorkletNode와 같은 처리 노드에
연결하여 메인 UI 스레드를 차단하지 않고 오디오를 처리합니다.

#### **3.3.2 오디오 청크 처리 및 Live API로 스트리밍하기** {#오디오-청크-처리-및-live-api로-스트리밍하기}

AudioWorkletProcessor 내에서 다음 작업을 수행하는 TypeScript 코드를
작성합니다.

1.  오디오 버퍼를 수신합니다.

2.  필요시 16kHz로 다운샘플링합니다.

3.  16-bit PCM 형식으로 변환합니다.

4.  Base64로 인코딩합니다.

5.  session.sendRealtimeInput()을 사용하여 mimeType:
    > \"audio/pcm;rate=16000\"과 함께 전송합니다.

**audio-processor.worklet.ts 예제:**

> TypeScript

class AudioProcessor extends AudioWorkletProcessor {  
constructor() {  
super();  
}  
  
process(inputs: Float32Array, outputs: Float32Array, parameters:
Record\<string, Float32Array\>): boolean {  
const input = inputs;  
if (input && input.length \> 0) {  
const pcmData = this.float32ToPCM16(input);  
this.port.postMessage(pcmData);  
}  
return true;  
}  
  
float32ToPCM16(buffer: Float32Array): Int16Array {  
let l = buffer.length;  
const buf = new Int16Array(l);  
while (l\--) {  
buf\[l\] = Math.min(1, buffer\[l\]) \* 0x7FFF;  
}  
return buf;  
}  
}  
  
registerProcessor(\'audio-processor\', AudioProcessor);

#### **3.3.3 모델의 오디오 응답 수신 및 재생하기** {#모델의-오디오-응답-수신-및-재생하기}

onmessage 콜백에서 수신된 오디오 데이터를 처리합니다. 네트워크
지연(jitter)에 대응하고 부드러운 재생을 보장하기 위해 오디오 버퍼/큐가
필요합니다.^1^ Base64 데이터를 디코딩하고

AudioBuffer로 변환한 후, AudioBufferSourceNode를 사용하여 AudioContext
내에서 재생을 스케줄링합니다. API의 출력 오디오는 24kHz 샘플링 레이트를
가집니다.

### **3.4 멀티모달 입력 통합: 비디오 및 이미지 스트리밍** {#멀티모달-입력-통합-비디오-및-이미지-스트리밍}

멀티모달 콘텐츠는 Content 객체 내의 Part 객체로 전송됩니다.

#### **비디오 스트리밍**

비디오 스트리밍은 다음 과정을 따릅니다:

1.  WebRTC를 사용하여 화면 또는 웹캠 스트림을 캡처합니다.

2.  특정 FPS(예: 0.5 FPS)로 프레임을 \<canvas\> 요소에 렌더링합니다.

3.  캔버스에서 프레임을 Base64 인코딩된 이미지로 추출합니다.

4.  적절한 이미지 mimeType과 함께 session.sendRealtimeInput()으로
    > 전송합니다.

#### **이미지 전송**

정적 이미지는 inlineData(Base64 문자열)와 mimeType을 포함하는 Part로
전송할 수 있습니다.

## **섹션 4: 고급 Live API 기능 마스터하기**

이 섹션에서는 API의 고급 기능을 구현하여 애플리케이션을 단순한 데모에서
강력하고 기능이 풍부한 도구로 발전시킵니다.

### **4.1 음성 활동 감지(VAD)를 통한 자연스러운 끼어들기** {#음성-활동-감지vad를-통한-자연스러운-끼어들기}

자연스러운 대화를 위해서는 사용자가 모델의 말을 끊고 들어갈 수 있는
끼어들기(\"barge-in\") 기능이 필수적입니다.

#### **서버-사이드 VAD (기본값)**

기본적으로 모델은 VAD를 수행하며, 사용자가 말하기 시작하면 모델의 현재
응답이 자동으로 취소됩니다. 개발자는
realtimeInputConfig.automaticActivityDetection 필드를 통해
감도(startOfSpeechSensitivity, endOfSpeechSensitivity) 및 침묵
시간(silenceDurationMs)을 조정할 수 있습니다. 코드에서는
message.server_content.interrupted === true를 확인하여 끼어들기가
발생했는지 알 수 있습니다.

#### **클라이언트-사이드 VAD (수동 제어)**

자동 VAD를 비활성화하고 activityStart, activityEnd와 같은 클라이언트
이벤트를 사용하여 수동으로 대화 차례를 제어할 수도 있습니다. 이는
개발자에게 더 많은 제어권을 주지만 복잡성을 증가시킵니다.

### **4.2 함수 호출 및 도구를 통한 기능 확장** {#함수-호출-및-도구를-통한-기능-확장}

함수 호출을 통해 모델은 외부 시스템 및 API와 상호작용하여 실시간 날씨
정보를 가져오는 등 더욱 강력한 기능을 수행할 수 있습니다. 구현 단계는
다음과 같습니다:

1.  **선언:** FunctionDeclaration을 사용하여 함수의 이름, 설명,
    > 파라미터에 대한 JSON 스키마를 정의합니다.

2.  **도구 제공:** 세션 연결 시 tools 배열에 이 선언을 전달합니다.

3.  **도구 호출 처리:** toolcall 이벤트를 수신하거나 FunctionCall 타입의
    > 응답 부분을 확인합니다.

4.  **함수 실행:** FunctionCall에서 인수를 파싱하여 해당 로컬 함수를
    > 실행합니다.

5.  **결과 반환:** 함수 실행 결과를 FunctionResponse 부분으로 모델에
    > 다시 보내 최종 답변을 생성하도록 합니다.

### **4.3 상태 관리: 컨텍스트 창, 압축 및 세션 재개** {#상태-관리-컨텍스트-창-압축-및-세션-재개}

#### **컨텍스트 창 및 압축**

API는 유한한 크기의 컨텍스트 창을 가집니다. 대화가 길어져 최대 컨텍스트
크기(max content size)에 도달하면, 가장 오래된 대화 내용을 삭제하여 목표
컨텍스트 크기(target content size)까지 대화 내용을 압축합니다. 이 기능은
긴 대화를 원활하게 유지하는 데 필수적입니다.

#### **세션 재개**

이 안정성 기능은 API가 세션 상태를 최대 24시간 동안 서버에 저장하도록
하여, 일시적인 네트워크 중단 후에도 클라이언트가 session_resumption
핸들을 사용해 재연결하고 대화를 이어갈 수 있게 합니다. 이는 특히 모바일
애플리케이션의 견고성을 높이는 데 중요합니다.

## **섹션 5: 참조 구현: 완전한 웹 콘솔 구축**

이전 섹션의 모든 개념을 종합하여, 공식 React 웹 콘솔 및 커뮤니티 Angular
프로젝트에서 관찰된 모범 사례를 기반으로 일관된 아키텍처 청사진을
제시합니다.

### **5.1 React/Angular 애플리케이션의 아키텍처 청사진** {#reactangular-애플리케이션의-아키텍처-청사진}

애플리케이션은 다음과 같은 모듈식 구성 요소를 가집니다:

- **UI 컴포넌트:** 연결 상태 표시, 제어 트레이(마이크/캠 토글), 채팅 창,
  > 비디오 피드 등.

- **서비스 레이어:** 웹소켓 통신, 오디오 녹음, 오디오 재생 로직을
  > 캡슐화한 서비스.

- **상태 관리:** React Context 또는 Redux/Zustand와 같은 전역 상태
  > 저장소를 사용하여 연결 상태, 로그, 대화 기록을 관리.

### **5.2 웹소켓 클라이언트 서비스: 연결 로직 캡슐화** {#웹소켓-클라이언트-서비스-연결-로직-캡슐화}

ai.live.connect 로직을 래핑하는 TypeScript 클래스(WebSocketClient)를
만듭니다. 이 클래스는 connect(), disconnect(), sendMessage(text)와 같은
메서드를 노출하고, onOpen, onMessage, onTranscript 등의 이벤트를
애플리케이션의 다른 부분으로 브로드캐스트하는 이벤트 이미터 패턴을
사용합니다. 이는 원시 웹소켓 처리를 UI 컴포넌트로부터 분리하는 좋은 설계
방식입니다.^6^

### **5.3 Web Audio Worklet을 이용한 고성능 오디오 처리** {#web-audio-worklet을-이용한-고성능-오디오-처리}

오디오 처리를 메인 UI 스레드에서 분리하여 UI 멈춤 현상을 방지하는 것이
매우 중요합니다.^1^ 이를 위해 두 개의 개별 오디오 워크릿을 구현합니다.

- audio-processing.worklet.ts: 마이크 오디오를 캡처, 다운샘플링,
  > 인코딩하여 웹소켓 클라이언트 서비스로 전송합니다.

- audio-playback.worklet.ts: 웹소켓 서비스로부터 오디오 청크를 수신하고
  > 끊김 없는 재생을 위해 스케줄링합니다.

## **섹션 6: 결론 및 향후 전망**

### **6.1 프로덕션 수준 시스템을 위한 모범 사례 요약** {#프로덕션-수준-시스템을-위한-모범-사례-요약}

- **보안 우선:** 클라이언트 사이드 연결에는 항상 임시 토큰을 사용합니다.

- **아키텍처의 중요성:** 지연 시간, 품질, 기능 요구사항에 따라 구현
  > 경로(클라이언트 vs. 서버)와 오디오 모델(네이티브 vs.
  > 하프-캐스케이드)을 신중하게 선택합니다.

- **비동기성 수용:** 웹소켓 통신을 위해 이벤트 기반 프로그래밍과 비동기
  > 패턴을 마스터합니다.

- **무거운 작업 위임:** Web Audio Worklet을 사용하여 모든 클라이언트
  > 사이드 오디오 처리를 위임하고 UI 반응성을 보장합니다.

- **불안정성 대비:** \"프리뷰\" 상태는 방어적인 코딩, SDK를 자체
  > 서비스로 래핑, 그리고 변경 로그를 주시해야 함을 의미합니다.

### **6.2 진화하는 환경: API의 프리뷰 상태와 파트너 통합의 가능성** {#진화하는-환경-api의-프리뷰-상태와-파트너-통합의-가능성}

API는 계속 진화하고 있으며, Firebase 웹 지원과 같은 기능은 아직 제공되지
않습니다.^4^ 한편,

**Daily, LiveKit, Voximplant**와 같은 파트너 플랫폼은 WebRTC 및
오디오/비디오 스트림 관리의 복잡성을 추상화하여 개발을 크게 단순화할 수
있는 대안을 제시합니다. 이는 개발팀에게 \"직접 구축할 것인가, 솔루션을
구매할 것인가(build vs. buy)\"의 전형적인 선택지를 제공합니다.

결론적으로, Gemini Live API는 프리뷰 상태임에도 불구하고 차세대 대화형
AI를 위한 강력하고 유연한 기반을 제공합니다. 이 API의 복잡성을
마스터하는 것은 이 분야의 개발자에게 가치 있는 투자가 될 것입니다.

#### 참고 자료

1.  Building Advanced AI Voice Assistants Using Google Gemini 2.0 \...,
    > 8월 1, 2025에 액세스,
    > [[https://gerard-sans.medium.com/building-advanced-ai-voice-assistants-using-google-gemini-2-0-and-angular-81ca0fa68ff6]{.underline}](https://gerard-sans.medium.com/building-advanced-ai-voice-assistants-using-google-gemini-2-0-and-angular-81ca0fa68ff6)

2.  Get started with Live API \| Gemini API \| Google AI for Developers,
    > 8월 1, 2025에 액세스,
    > [[https://ai.google.dev/gemini-api/docs/live]{.underline}](https://ai.google.dev/gemini-api/docs/live)

3.  Live API \| Generative AI on Vertex AI \| Google Cloud, 8월 1,
    > 2025에 액세스,
    > [[https://cloud.google.com/vertex-ai/generative-ai/docs/live-api]{.underline}](https://cloud.google.com/vertex-ai/generative-ai/docs/live-api)

4.  Bidirectional streaming using the Gemini Live API \| Firebase AI
    > Logic - Google, 8월 1, 2025에 액세스,
    > [[https://firebase.google.com/docs/ai-logic/live-api]{.underline}](https://firebase.google.com/docs/ai-logic/live-api)

5.  googleapis/js-genai: TypeScript/JavaScript SDK for Gemini \... -
    > GitHub, 8월 1, 2025에 액세스,
    > [[https://github.com/googleapis/js-genai]{.underline}](https://github.com/googleapis/js-genai)

6.  1월 1, 1970에 액세스,
    > [[https://github.com/google-gemini/live-api-web-console/blob/main/src/lib/websocket-client.ts]{.underline}](https://github.com/google-gemini/live-api-web-console/blob/main/src/lib/websocket-client.ts)
