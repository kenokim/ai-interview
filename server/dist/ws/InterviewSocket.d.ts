import { WebSocketServer } from 'ws';
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
export declare class InterviewSocket {
    private readonly path;
    register(wss: WebSocketServer): void;
}
//# sourceMappingURL=InterviewSocket.d.ts.map