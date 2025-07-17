import { InterviewStateType } from '../types/state.js';
export declare class InterviewRepository {
    private interviewSessions;
    private interviewGraphs;
    saveSession(sessionId: string, state: InterviewStateType): void;
    getSession(sessionId: string): InterviewStateType | undefined;
    deleteSession(sessionId: string): boolean;
    sessionExists(sessionId: string): boolean;
    getAllSessions(): Array<{
        sessionId: string;
        stage: string;
        turnCount: number;
        messageCount: number;
    }>;
    getTotalSessionCount(): number;
    saveGraph(sessionId: string, graph: any): void;
    getGraph(sessionId: string): any;
    generateSessionId(): string;
    cleanupExpiredSessions(maxAge?: number): number;
}
export declare const interviewRepository: InterviewRepository;
//# sourceMappingURL=InterviewRepository.d.ts.map