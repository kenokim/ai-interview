import { StartInterviewRequest, SendMessageRequest, EndInterviewRequest, TriggerInterviewRequest, StartInterviewResponse, TriggerInterviewResponse, SendMessageResponse, SessionStatusResponse, EndInterviewResponse, SessionsListResponse } from "../types/api.js";
export declare class InterviewService {
    private sessions;
    private interviewGraph;
    constructor();
    startInterview(body: StartInterviewRequest): Promise<StartInterviewResponse>;
    triggerInterview(body: TriggerInterviewRequest): Promise<TriggerInterviewResponse>;
    sendMessage(body: SendMessageRequest): Promise<SendMessageResponse>;
    getSessionStatus(sessionId: string): Promise<SessionStatusResponse>;
    endInterview(body: EndInterviewRequest): Promise<EndInterviewResponse>;
    private formatResponse;
    listSessions(): SessionsListResponse;
}
export declare const interviewService: InterviewService;
//# sourceMappingURL=InterviewService.d.ts.map