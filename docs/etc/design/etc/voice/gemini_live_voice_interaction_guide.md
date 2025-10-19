# Gemini Live API 음성 상호작용 구현 가이드 (TypeScript)

## 1. 개요
이 문서는 TypeScript와 Web Audio API를 사용하여 Gemini Live API와 실시간 음성 상호작용을 구현하는 방법을 코드 중심으로 안내합니다.

음성 상호작용의 핵심 과정은 다음과 같습니다.
1.  마이크 입력 캡처: 브라우저에서 사용자의 마이크 입력을 받습니다.
2.  오디오 포맷 변환: 캡처된 오디오를 Gemini API가 요구하는 형식(16-bit PCM, 16kHz)으로 실시간 변환합니다.
3.  API로 스트리밍: 변환된 오디오 데이터를 API로 전송합니다.
4.  AI 음성 응답 수신: API로부터 AI의 음성 응답 데이터를 받습니다.
5.  응답 재생: 수신한 음성 데이터를 브라우저에서 재생합니다.

이 과정은 복잡하며, 특히 오디오를 실시간으로 처리하기 위해 Web Audio API에 대한 이해가 필요합니다.

## 2. 사전 준비
먼저 `@google/genai` SDK를 설치합니다.

```bash
npm install @google/genai
```

## 3. 구현 단계별 코드 분석

### 3.1. 오디오 처리용 `AudioWorklet` 작성

UI 스레드의 성능 저하를 방지하기 위해, 오디오 처리는 별도의 스레드에서 동작하는 `AudioWorklet`에서 수행하는 것이 매우 중요합니다.

#### `audio-processor.worklet.ts`
이 워크릿은 브라우저의 기본 오디오 형식(`Float32Array`)을 API가 요구하는 `Int16Array` (16-bit PCM) 형식으로 변환하는 역할을 합니다.

```typescript
// audio-processor.worklet.ts

class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
  }

  /**
   * Float32Array 형식의 오디오 버퍼를 Int16Array (16-bit PCM)으로 변환합니다.
   * @param buffer Float32Array 형식의 오디오 데이터
   * @returns Int16Array 형식의 PCM 데이터
   */
  private float32ToPCM16(buffer: Float32Array): Int16Array {
    let l = buffer.length;
    const buf = new Int16Array(l);
    while (l--) {
      buf[l] = Math.min(1, buffer[l]) * 0x7fff;
    }
    return buf;
  }

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>
  ): boolean {
    const input = inputs[0];
    if (input && input.length > 0) {
      const pcmData = this.float32ToPCM16(input[0]);
      // 변환된 PCM 데이터를 메인 스레드로 전송합니다.
      this.port.postMessage(pcmData);
    }
    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);
```

### 3.2. 메인 애플리케이션 로직

이제 메인 애플리케이션에서 마이크 입력을 받고, 워크릿을 통해 오디오를 처리하며, Gemini API와 통신하는 로직을 구현합니다.

#### `VoiceInteractionService.ts` (개념 코드)

```typescript
import { GoogleGenAI, Content, Part, Modality } from "@google/genai";

class VoiceInteractionService {
  private ai: GoogleGenAI;
  private audioContext: AudioContext | null = null;
  private microphoneSource: MediaStreamAudioSourceNode | null = null;
  private audioProcessorNode: AudioWorkletNode | null = null;
  private session: any | null = null; // 실제 타입은 SDK에 따라 다름

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI(apiKey);
  }

  async start() {
    this.audioContext = new AudioContext({ sampleRate: 16000 }); // API 요구사항에 맞춰 16kHz로 설정

    // 1. AudioWorklet 모듈 로드
    await this.audioContext.audioWorklet.addModule('audio-processor.worklet.js');

    // 2. 마이크 스트림 획득
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.microphoneSource = this.audioContext.createMediaStreamSource(stream);

    // 3. AudioWorklet 노드 생성 및 연결
    this.audioProcessorNode = new AudioWorkletNode(this.audioContext, 'audio-processor');
    this.microphoneSource.connect(this.audioProcessorNode);
    
    // 4. Gemini Live 세션 시작
    this.session = await this.ai.live.connect({
      model: 'gemini-2.5-flash-preview-native-audio-dialog', // 음성 대화 모델
      config: {
        responseModalities: [Modality.AUDIO], // 오디오 응답 요청
      },
      callbacks: {
        onmessage: (message) => {
          if (message.audio) {
            // AI 음성 응답 재생
            this.playAudio(message.audio);
          }
        },
        onerror: (e) => console.error("Error:", e.message),
        onclose: () => console.log("Session closed."),
      }
    });

    // 5. 처리된 오디오 데이터를 API로 전송
    this.audioProcessorNode.port.onmessage = (event) => {
      if (this.session) {
        // event.data는 Int16Array 형식의 PCM 데이터입니다.
        const audioChunkBase64 = this.toBase64(event.data.buffer);
        this.session.sendRealtimeInput({
          audio: {
            mimeType: "audio/pcm;rate=16000",
            data: audioChunkBase64,
          },
        });
      }
    };
  }

  private audioQueue: AudioBuffer[] = [];
  private isPlaying = false;

  private async playAudio(audioData: { data: string }) {
    if (!this.audioContext) return;

    // Base64 디코딩 및 AudioBuffer로 변환
    const decodedData = atob(audioData.data);
    const arrayBuffer = new ArrayBuffer(decodedData.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < decodedData.length; i++) {
      view[i] = decodedData.charCodeAt(i);
    }
    // API의 오디오 출력은 24kHz입니다.
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    
    this.audioQueue.push(audioBuffer);
    if (!this.isPlaying) {
      this.schedulePlayback();
    }
  }
  
  private schedulePlayback() {
    if (this.audioQueue.length === 0) {
      this.isPlaying = false;
      return;
    }
    this.isPlaying = true;
    
    const bufferToPlay = this.audioQueue.shift();
    if (!bufferToPlay || !this.audioContext) return;
    
    const source = this.audioContext.createBufferSource();
    source.buffer = bufferToPlay;
    source.connect(this.audioContext.destination);
    source.onended = () => this.schedulePlayback();
    source.start();
  }
  
  // ArrayBuffer를 Base64 문자열로 변환하는 헬퍼 함수
  private toBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  stop() {
    if (this.session) {
      this.session.close();
    }
    if (this.microphoneSource) {
      this.microphoneSource.disconnect();
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}
```

## 4. 핵심 고려사항
- 보안: 이 코드는 개념 증명용입니다. 프로덕션 환경에서는 절대 클라이언트 코드에 API 키를 직접 노출해서는 안 됩니다. 서버에서 생성한 임시 토큰을 사용하는 것이 안전합니다.
- 오디오 버퍼링 및 재생: `playAudio`와 `schedulePlayback` 함수는 수신된 오디오 청크를 끊김 없이 재생하기 위한 기본적인 큐(Queue) 방식입니다. 실제 프로덕션 환경에서는 네트워크 지터(jitter) 등을 고려한 더 정교한 버퍼링 로직이 필요할 수 있습니다.
- 에러 핸들링: 마이크 권한 거부, 네트워크 중단, API 에러 등 다양한 예외 상황에 대한 견고한 에러 처리 로직을 추가해야 합니다.
- 모델 선택: 문서에서는 음성 대화에 `gemini-2.5-flash-preview-native-audio-dialog`와 같은 네이티브 오디오 모델을 권장하고 있습니다. 요구사항에 맞는 모델을 선택해야 합니다.
