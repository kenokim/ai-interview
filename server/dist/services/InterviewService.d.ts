import { StartInterviewRequest, SendMessageRequest, StartInterviewResponse, SendMessageResponse, SessionStatusResponse, EndInterviewResponse, SessionsListResponse } from '../types/api.js';
export declare class InterviewService {
    startInterview(request: StartInterviewRequest): Promise<StartInterviewResponse>;
    sendMessage(request: SendMessageRequest): Promise<SendMessageResponse>;
    getSessionStatus(sessionId: string): SessionStatusResponse;
    endInterview(sessionId: string): EndInterviewResponse;
    getAllSessions(): SessionsListResponse;
    sessionExists(sessionId: string): boolean;
    cleanupExpiredSessions(maxAge?: number): number;
}
export declare const interviewService: InterviewService;
//# sourceMappingURL=InterviewService.d.ts.map