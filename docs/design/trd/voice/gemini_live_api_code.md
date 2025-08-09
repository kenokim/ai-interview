# Gemini Live API · React · Express · ws 통합 구조

이 문서는 Gemini Live API를 React 프런트엔드와 Express 백엔드(ws 라이브러리)로 연결하여 실시간 음성 대화를 구현할 때의 핵심 아키텍처와 코드 구성을 요약한다.

## 1. 요청-응답 흐름 개요

```
┌─────────────┐     WebSocket(PCM)      ┌─────────────────┐  ai.live.connect   ┌────────────┐
│ React (브라우저)│ ─────────────────────▶ │  Express + ws   │ ──────────────────▶ │ Gemini Live │
│  MediaRecorder │ ◀───────────────────── │  Node 백엔드     │ ◀────────────────── │   Session   │
└─────────────┘     WebSocket(JSON)      └─────────────────┘  Streaming reply  └────────────┘
```

1. 브라우저가 마이크를 열고 MediaRecorder가 100 ms 간격으로 PCM 스트림을 생성한다.
2. 프런트엔드는 `/` 루트 WebSocket(`ws://<server>/`)에 연결하고 오디오 청크를 전송한다.
3. 백엔드는 각 클라이언트 연결마다 `ai.live.connect()`로 Gemini 세션을 생성한다.
4. 백엔드는 클라이언트 → Gemini 오디오 스트림 전달, Gemini → 클라이언트 오디오·텍스트 스트림 전달을 동시에 수행한다.

## 2. 프런트엔드 (React)

### MediaRecorder란?
브라우저 표준 Web API로, 사용자의 마이크나 화면 등 MediaStream을 실시간으로 녹음해 Blob 청크를 이벤트 형태로 제공합니다. 호출 간격을 지정하면 지정 ms마다 `dataavailable` 이벤트가 발생해 스트림 전송에 적합합니다.

### PCM이란?
Pulse-Code Modulation의 약자로, 압축되지 않은 원시 오디오 데이터를 의미합니다. Gemini Live API는 16-bit 정수, 16 kHz, 모노 채널의 PCM 포맷을 요구합니다. 따라서 웹에서 기본적으로 제공되는 Opus·WebM 스트림은 AudioWorklet 등을 통해 PCM으로 변환해야 합니다.

주요 책임

- 마이크 권한 요청 후 MediaRecorder로 16-bit PCM 16 kHz 모노 스트림 생성 (프로덕션에서는 AudioWorklet 변환 필요)
- 오디오 청크를 WebSocket으로 송신
- 서버로부터 받은 JSON 메시지 중
  - `output_transcription.text` → 텍스트 전사 누적
  - `model_turn.parts.inline_data.data` → base64 오디오 디코딩 후 재생

핵심 함수 스케치

```typescript
const ws = new WebSocket("ws://localhost:8080");
ws.onopen = () => mediaRecorder.start(100);
mediaRecorder.ondataavailable = e => {
  if (e.data.size > 0 && ws.readyState === WebSocket.OPEN) ws.send(e.data);
};
ws.onmessage = e => {
  const data = JSON.parse(e.data);
  if (data.output_transcription?.text) setTranscript(t => t + data.output_transcription.text);
  if (data.model_turn?.parts?.inline_data?.data) playAudio(decode(data.model_turn.parts.inline_data.data));
};
```

## 3. 백엔드 (Express + ws)

- `http.createServer(app)`로 HTTP 서버 생성 후 `new WebSocketServer({ server })` 사용
- `wss.on('connection', async ws => …)` 내부에서
  1. `startLiveSession()` 호출로 Gemini 세션 생성
  2. `for await (const res of geminiSession.receive())` 루프에서 모델 응답을 클라이언트로 전송
  3. `ws.on('message', async buf => geminiSession.send_realtime_input({ audio: { data: buf } }))`
  4. 연결 종료 시 세션 정리

서버 코드 요약

```typescript
wss.on('connection', async (ws: WebSocket) => {
  const session = await startLiveSession();

  // Gemini → Client
  (async () => {
    for await (const res of session.receive()) {
      if (res.server_content) ws.send(JSON.stringify(res.server_content));
    }
  })();

  // Client → Gemini
  ws.on('message', async (audio: Buffer) => {
    await session.send_realtime_input({ audio: { data: audio } });
  });
});
```

## 4. Gemini Live 세션 모듈

```typescript
import { GoogleGenAI } from "@google/genai";
export async function startLiveSession() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  return ai.live.connect({
    model: "gemini-live-2.5-flash",
    config: {
      response_modalities: ["audio", "text"],
      input_audio_transcription: {},
      output_audio_transcription: {},
    },
  });
}
```

## 5. 메시지 포맷

| 방향 | 타입 | 설명 |
|-------|------|------|
| Client → Server | Binary | 16 bit PCM 16 kHz 모노 오디오 청크 |
| Server → Client | JSON | Gemini `server_content` 객체 (오디오 base64, 텍스트 전사 등) |
