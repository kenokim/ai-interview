# Gemini Live API 개요 및 사용 구조

> 이 문서는 [Google AI for Developers: Get started with Live API](https://ai.google.dev/gemini-api/docs/live?hl=ko) 문서를 기반으로 정리되었습니다.

## 1. Gemini Live API란?

Gemini Live API는 Gemini 모델과 실시간으로 음성 및 영상 상호작용을 할 수 있도록 설계된 저지연(low-latency) API입니다. 오디오, 비디오, 텍스트의 연속적인 스트림을 처리하여 즉각적이고 사람과 대화하는 듯한 자연스러운 경험을 제공하는 것이 특징입니다.

### 주요 기능

-   실시간 양방향 스트리밍: WebSocket을 기반으로 클라이언트와 서버 간에 실시간으로 데이터를 주고받습니다.
-   음성 활동 감지 (VAD): 사용자의 발화를 감지하여 모델이 자연스럽게 대화에 끼어들거나 멈출 수 있습니다. 이를 통해 사용자가 모델의 응답을 중단시키는 'barge-in' 기능이 가능합니다.
-   다양한 입출력 (Multi-modality): 텍스트-텍스트, 오디오-텍스트, 텍스트-오디오, 오디오-오디오 등 다양한 형태의 상호작용을 지원합니다.
-   Tool 사용 및 함수 호출: 외부 도구나 API를 호출하여 모델의 기능을 확장할 수 있습니다.
-   세션 관리 및 보안: 긴 대화를 관리하기 위한 세션 관리 기능과 클라이언트 측 보안을 위한 임시 토큰(ephemeral tokens)을 지원합니다.

### 파트너 연동

더 간단한 개발 프로세스를 원한다면 Daily 또는 LiveKit과 같은 서드 파티 파트너 플랫폼을 사용할 수 있습니다. 이 플랫폼들은 WebRTC 프로토콜을 통해 Gemini Live API를 이미 통합하여 실시간 오디오 및 비디오 애플리케이션 개발을 간소화합니다.

## 2. 사용 구조

Gemini Live API를 사용하는 구조는 크게 '연결 방식'과 '모델 선택'으로 나눌 수 있습니다.

### 연결 방식 (Implementation Approach)

-   서버-투-서버 (Server-to-server): 백엔드 서버가 WebSocket을 통해 Live API와 직접 연결됩니다. 클라이언트(웹/앱)는 미디어 스트림을 백엔드 서버로 전송하고, 백엔드가 이를 다시 Live API로 전달하는 구조입니다.
-   클라이언트-투-서버 (Client-to-server): 프론트엔드(클라이언트) 코드가 WebSocket을 통해 Live API와 직접 연결됩니다. 백엔드를 거치지 않아 지연 시간이 줄어들지만, 프로덕션 환경에서는 보안을 위해 API 키 대신 임시 토큰을 사용하는 것이 권장됩니다.

### 모델 선택 (Audio Generation Architecture)

-   네이티브 오디오 (Native Audio): 가장 자연스럽고 현실적인 음성을 생성하며, 다국어 성능이 우수합니다. 감정 인식 대화, 선제적 오디오(모델이 응답 여부 결정) 등의 고급 기능을 지원합니다.
    -   모델 예: `gemini-2.5-flash-preview-native-audio-dialog`, `gemini-2.5-flash-exp-native-audio-thinking-dialog`
-   하프-캐스케이드 오디오 (Half-cascade Audio): 네이티브 오디오 입력과 텍스트-음성 변환(TTS) 출력을 결합한 구조입니다. Tool 사용 시 더 나은 성능과 안정성을 제공합니다.
    -   모델 예: `gemini-live-2.5-flash-preview`, `gemini-2.0-flash-live-001`

### 기본 사용 흐름

1.  WebSocket 연결을 생성하여 세션을 시작합니다.
2.  첫 메시지로 세션 설정을 전송합니다 (사용할 모델, 응답 형식 등).
3.  오디오/텍스트/비디오 데이터를 스트리밍으로 전송합니다.
    -   오디오 입력 형식: 16-bit PCM, 16kHz, 모노 채널
4.  서버로부터 텍스트 또는 오디오(24kHz) 스트림을 실시간으로 수신합니다.
5.  대화가 끝나면 연결을 종료합니다.

## 3. 예제 코드 (오디오 입력, 오디오 출력)

다음은 로컬의 `.wav` 파일을 읽어 Live API로 전송하고, 모델이 생성한 음성 응답을 다시 `.wav` 파일로 저장하는 예제입니다.

### Python

```python
# 필요한 라이브러리 설치: pip install google-generativeai librosa soundfile
import asyncio
import io
import wave
from google import genai
from google.genai import types
import soundfile as sf
import librosa

# 로컬 환경에서 실행 시 API 키를 설정해야 합니다.
# genai.configure(api_key="YOUR_API_KEY")

client = genai.Client()

# 네이티브 오디오 모델 사용
model = "gemini-2.5-flash-preview-native-audio-dialog"

# 세션 설정: 응답을 오디오로 받음
config = {
  "response_modalities": ["AUDIO"],
  "system_instruction": "You are a helpful assistant and answer in a friendly tone.",
}

async def main():
    # Live API와 비동기적으로 연결
    async with client.aio.live.connect(model=model, config=config) as session:

        # 입력 오디오 파일(.wav)을 API 요구사항에 맞게 변환 (16-bit PCM, 16kHz)
        # 'sample.wav' 파일이 현재 디렉토리에 있어야 합니다.
        try:
            buffer = io.BytesIO()
            y, sr = librosa.load("sample.wav", sr=16000)
            sf.write(buffer, y, sr, format='RAW', subtype='PCM_16')
            buffer.seek(0)
            audio_bytes = buffer.read()
        except FileNotFoundError:
            print("Error: 'sample.wav' not found. Please download it first.")
            print("You can download an example file with: !wget https://storage.googleapis.com/generativeai-downloads/data/16000.wav -O sample.wav")
            return

        # 변환된 오디오 데이터를 API로 전송
        await session.send_realtime_input(
            audio=types.Blob(data=audio_bytes, mime_type="audio/pcm;rate=16000")
        )

        # 응답 오디오를 저장할 .wav 파일 열기
        wf = wave.open("audio_response.wav", "wb")
        wf.setnchannels(1)       # 모노
        wf.setsampwidth(2)       # 16-bit
        wf.setframerate(24000)   # 출력은 24kHz

        # 서버로부터 비동기적으로 응답 수신
        async for response in session.receive():
            # 응답 데이터에 오디오가 포함되어 있으면 파일에 쓰기
            if response.data is not None:
                wf.writeframes(response.data)

        wf.close()
        print("Audio response saved to audio_response.wav")

if __name__ == "__main__":
    # 이 스크립트를 실행하기 전에 'sample.wav' 파일을 준비해주세요.
    # 터미널에서 `wget https://storage.googleapis.com/generativeai-downloads/data/16000.wav -O sample.wav` 명령어로 다운로드할 수 있습니다.
    asyncio.run(main())

```

### JavaScript (Node.js)

```javascript
// 필요한 라이브러리 설치: npm install @google/genai wavefile
import { GoogleGenAI, Modality } from '@google/genai';
import * as fs from "node:fs";
import pkg from 'wavefile';  // npm install wavefile
const { WaveFile } = pkg;

const ai = new GoogleGenAI("YOUR_API_KEY");

// 네이티브 오디오 모델 사용
const model = "gemini-2.5-flash-preview-native-audio-dialog"

const config = {
  responseModalities: [Modality.AUDIO], 
  systemInstruction: "You are a helpful assistant and answer in a friendly tone."
};

async function main() {
    const responseQueue = [];

    // 메시지 큐에서 메시지를 기다리는 함수
    async function waitMessage() {
        // ... (생략, 원본 문서 코드 참조)
    }

    // 한 턴의 대화를 처리하는 함수
    async function handleTurn() {
        // ... (생략, 원본 문서 코드 참조)
    }

    const session = await ai.live.connect({
        model: model,
        callbacks: {
            onopen: () => console.debug('Opened'),
            onmessage: (message) => responseQueue.push(message),
            onerror: (e) => console.debug('Error:', e.message),
            onclose: (e) => console.debug('Close:', e.reason),
        },
        config: config,
    });

    // 오디오 파일 읽기 및 변환
    const fileBuffer = fs.readFileSync("sample.wav");
    const wav = new WaveFile();
    wav.fromBuffer(fileBuffer);
    wav.toSampleRate(16000);
    wav.toBitDepth("16");
    const base64Audio = wav.toBase64();

    // 오디오 데이터 전송
    session.sendRealtimeInput({
        audio: {
            data: base64Audio,
            mimeType: "audio/pcm;rate=16000"
        }
    });

    const turns = await handleTurn();

    // 수신된 오디오 데이터 합치기
    const combinedAudio = turns.reduce((acc, turn) => {
        if (turn.data) {
            const buffer = Buffer.from(turn.data, 'base64');
            const intArray = new Int16Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / Int16Array.BYTES_PER_ELEMENT);
            return acc.concat(Array.from(intArray));
        }
        return acc;
    }, []);

    // .wav 파일로 저장
    const audioBuffer = new Int16Array(combinedAudio);
    const wf = new WaveFile();
    wf.fromScratch(1, 24000, '16', audioBuffer);
    fs.writeFileSync('audio_response.wav', wf.toBuffer());
    console.log("Audio response saved to audio_response.wav");

    session.close();
}

main().catch(console.error);
```
