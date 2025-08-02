// front/src/services/VoiceService.ts

export type VoiceServiceEvent = 'transcript' | 'audio' | 'error' | 'close' | 'open';

class VoiceService {
  private ws: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private microphoneSource: MediaStreamAudioSourceNode | null = null;
  private audioProcessorNode: AudioWorkletNode | null = null;
  private mediaRecorder: MediaStream | null = null;
  
  private audioQueue: ArrayBuffer[] = [];
  private isPlaying = false;
  private eventListeners: { [key in VoiceServiceEvent]: Function[] } = {
    transcript: [],
    audio: [],
    error: [],
    close: [],
    open: [],
  };

  public async start() {
    if (this.ws) {
      console.log("Voice service already started.");
      return;
    }

    try {
      this.ws = new WebSocket('ws://localhost:8080'); // 백엔드 WebSocket 주소
      
      this.ws.onopen = () => {
        console.log("WebSocket connected. Starting audio stream.");
        this.emit('open');
        this.startStreaming();
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.output_transcription?.text) {
          this.emit('transcript', data.output_transcription.text);
        }

        if (data.model_turn?.parts[0]?.inline_data?.data) {
          this.playAudio(data.model_turn.parts[0].inline_data.data);
        }
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.emit('error', error);
      };

      this.ws.onclose = () => {
        console.log("WebSocket disconnected.");
        this.emit('close');
        this.stop();
      };
    } catch (error) {
        console.error("Failed to start voice service:", error);
        this.emit('error', error);
    }
  }

  private async startStreaming() {
    try {
        this.audioContext = new AudioContext({ sampleRate: 16000 });
        // Vite 환경에서는 public 디렉토리의 파일을 절대 경로로 참조할 수 있습니다.
        await this.audioContext.audioWorklet.addModule('/audio-processor.worklet.js');
      
        this.mediaRecorder = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.microphoneSource = this.audioContext.createMediaStreamSource(this.mediaRecorder);
        this.audioProcessorNode = new AudioWorkletNode(this.audioContext, 'audio-processor');

        this.audioProcessorNode.port.onmessage = (event) => {
          if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(event.data);
          }
        };

        this.microphoneSource.connect(this.audioProcessorNode);
        // this.audioProcessorNode.connect(this.audioContext.destination); // 자신의 목소리를 듣고 싶을 때 주석 해제
    } catch (error) {
        console.error("Error starting audio stream:", error);
        this.emit('error', error);
    }
  }

  private async playAudio(base64Audio: string) {
    // 24kHz 샘플 레이트로 오디오 컨텍스트를 재생용으로 다시 만듭니다.
    if (!this.audioContext || this.audioContext.sampleRate !== 24000) {
        if(this.audioContext) await this.audioContext.close();
        this.audioContext = new AudioContext({ sampleRate: 24000 });
    }
    const audioData = atob(base64Audio);
    const audioBuffer = new Uint8Array(audioData.length);
    for (let i = 0; i < audioData.length; i++) {
        audioBuffer[i] = audioData.charCodeAt(i);
    }

    try {
      const decodedBuffer = await this.audioContext.decodeAudioData(audioBuffer.buffer);
      this.audioQueue.push(decodedBuffer);
      if (!this.isPlaying) {
        this.schedulePlayback();
      }
    } catch (e) {
      console.error("Error decoding audio data", e);
      this.emit("error", e);
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

  public stop() {
    this.ws?.close();
    this.microphoneSource?.disconnect();
    this.audioProcessorNode?.disconnect();
    this.mediaRecorder?.getTracks().forEach(track => track.stop());
    this.audioContext?.close().catch(console.error);

    this.ws = null;
    this.audioContext = null;
    this.microphoneSource = null;
    this.audioProcessorNode = null;
    this.mediaRecorder = null;
  }

  public on(event: VoiceServiceEvent, listener: Function) {
    this.eventListeners[event].push(listener);
  }

  public off(event: VoiceServiceEvent, listener: Function) {
    this.eventListeners[event] = this.eventListeners[event].filter(l => l !== listener);
  }

  private emit(event: VoiceServiceEvent, data?: any) {
    this.eventListeners[event].forEach(listener => listener(data));
  }
}

export const voiceService = new VoiceService();
