import { WebSocket } from 'ws';
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
    path = '/ws/interview';
    register(wss) {
        wss.on('connection', (ws, req) => {
            console.log(`🔗 [WS] 연결 요청 URL: ${req.url}`);
            if (req.url !== this.path) {
                console.log(`❌ [WS] 경로 불일치: ${req.url} !== ${this.path}`);
                return;
            }
            const clientIp = req.socket.remoteAddress;
            console.log(`🎙️ [WS] 인터뷰 소켓 연결 - ${clientIp}`);
            let sessionId = null;
            let streamIterator;
            let testTimer;
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
                }
                catch (err) {
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
                            // 테스트: 10초마다 서버가 임의 메시지 전송
                            if (!testTimer) {
                                // 10초마다 LangGraph에게 메시지를 요청해서 클라이언트로 전송 (테스트)
                                testTimer = setInterval(async () => {
                                    if (ws.readyState !== WebSocket.OPEN || !sessionId)
                                        return;
                                    try {
                                        // LangGraph 워크플로우에 "(서버 자동 메시지)"라는 텍스트를 사용자 입력으로 보낸다.
                                        const response = await interviewService.sendMessage({ sessionId, message: '(서버 자동 메시지, 면접자에게 아무 말이나 하세요. 면접자가 말이 없으면 재촉하세요.)' });
                                        // sendMessage 는 최종 메시지를 반환하므로 'response' 타입으로 그대로 전달
                                        const wsPayload = { type: 'response', data: response };
                                        ws.send(JSON.stringify(wsPayload));
                                    }
                                    catch (err) {
                                        console.error(`❌ [WS][${sessionId}] 자동 메시지 전송 실패:`, err);
                                    }
                                }, 10000);
                            }
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
                            }
                            catch (error) {
                                console.error(`❌ [WS][${sessionId}] 메시지 처리 중 오류:`, error);
                                ws.send(JSON.stringify({ type: 'error', message: 'Message processing failed' }));
                            }
                            break;
                        default:
                            ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
                    }
                }
                catch (err) {
                    console.error(`❌ [WS][${sessionId}] 메시지 처리 오류:`, err);
                    ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
                }
            });
            ws.on('close', () => {
                streamIterator?.return?.();
                if (testTimer)
                    clearInterval(testTimer);
                console.log(`🔌 [WS][${sessionId}] 인터뷰 소켓 종료`);
            });
        });
    }
}
//# sourceMappingURL=InterviewSocket.js.map