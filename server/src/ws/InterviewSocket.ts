import { WebSocketServer, WebSocket } from 'ws';
import { interviewService } from "../services/InterviewService.js";

/**
 * InterviewSocket
 * WebSocket handler 전용 클래스
 * - 경로: /ws/interview
 * - 프로토콜:
 *   클라이언트 → 서버
 *     { type: 'init', sessionId }
 *     { type: 'user', text }
 *   서버 → 클라이언트
 *     { type: 'chunk', chunk }          // LangGraph stream 청크
 *     { type: 'response', data }        // sendMessage 결과
 *     { type: 'error', message }
 */
export class InterviewSocket {
  private readonly path = '/ws/interview';

  public register(wss: WebSocketServer) {
    wss.on('connection', (ws: WebSocket, req) => {
      console.log(`🔗 [WS] 연결 요청 URL: ${req.url}`);
      if (req.url !== this.path) {
        console.log(`❌ [WS] 경로 불일치: ${req.url} !== ${this.path}`);
        return;
      }

      const clientIp = req.socket.remoteAddress;
      console.log(`🎙️ [WS] 인터뷰 소켓 연결 - ${clientIp}`);
      let sessionId: string | null = null;
      let streamIterator: AsyncIterableIterator<any> | undefined;

      const startStream = async () => {
        if (!sessionId) {
          console.log(`⚠️ [WS] sessionId가 없어서 스트림 시작 불가`);
          return;
        }
        console.log(`🔄 [WS][${sessionId}] 스트림 구독 시작`);
        try {
          const iter = interviewService.streamUpdates(sessionId);
          streamIterator = iter;
          console.log(`✅ [WS][${sessionId}] 스트림 이터레이터 생성 성공`);
          for await (const chunk of iter) {
            const [mode] = chunk;
            console.log(`📦 [WS][${sessionId}] 수신 chunk: ${mode}`);
            ws.send(JSON.stringify({ type: 'chunk', chunk }));
          }
          console.log(`🔚 [WS][${sessionId}] 스트림 종료 (정상)`);
        } catch (err) {
          console.error(`❌ [WS][${sessionId}] 스트림 오류:`, err);
          ws.close();
        }
      };

      ws.on('message', async (raw) => {
        console.log(`📨 [WS] Raw message received: ${raw.toString()}`);
        try {
          const msg = JSON.parse(raw.toString());
          console.log(`📋 [WS] Parsed message:`, msg);
          switch (msg.type) {
            case 'init':
              sessionId = msg.sessionId;
              console.log(`🆔 [WS] 세션 초기화: ${sessionId}`);
              startStream();
              break;
            case 'user':
              if (!sessionId) {
                console.log(`❌ [WS] sessionId가 없어서 메시지 처리 불가`);
                break;
              }
              console.log(`💬 [WS][${sessionId}] 사용자: ${msg.text}`);
              try {
                const resp = await interviewService.sendMessage({ sessionId, message: msg.text });
                console.log(`🤖 [WS][${sessionId}] LangGraph 응답: ${resp.message}`);
                const responsePayload = { type: 'response', data: resp };
                console.log(`📤 [WS][${sessionId}] 응답 전송:`, responsePayload);
                ws.send(JSON.stringify(responsePayload));
                console.log(`✅ [WS][${sessionId}] 응답 전송 완료`);
              } catch (error) {
                console.error(`❌ [WS][${sessionId}] 메시지 처리 중 오류:`, error);
                ws.send(JSON.stringify({ type: 'error', message: 'Message processing failed' }));
              }
              break;
            default:
              ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
          }
        } catch (err) {
          console.error(`❌ [WS][${sessionId}] 메시지 처리 오류:`, err);
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
        }
      });

      ws.on('close', () => {
        streamIterator?.return?.();
        console.log(`🔌 [WS][${sessionId}] 인터뷰 소켓 종료`);
      });
    });
  }
}