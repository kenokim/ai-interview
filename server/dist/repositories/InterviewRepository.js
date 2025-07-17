export class InterviewRepository {
    interviewSessions = new Map();
    interviewGraphs = new Map();
    // Session management
    saveSession(sessionId, state) {
        this.interviewSessions.set(sessionId, state);
    }
    getSession(sessionId) {
        return this.interviewSessions.get(sessionId);
    }
    deleteSession(sessionId) {
        const sessionExists = this.interviewSessions.has(sessionId);
        this.interviewSessions.delete(sessionId);
        this.interviewGraphs.delete(sessionId);
        return sessionExists;
    }
    sessionExists(sessionId) {
        return this.interviewSessions.has(sessionId);
    }
    getAllSessions() {
        return Array.from(this.interviewSessions.entries()).map(([sessionId, state]) => ({
            sessionId,
            stage: state.task.interview_stage,
            turnCount: state.evaluation.turn_count,
            messageCount: state.messages.length
        }));
    }
    getTotalSessionCount() {
        return this.interviewSessions.size;
    }
    // Graph management
    saveGraph(sessionId, graph) {
        this.interviewGraphs.set(sessionId, graph);
    }
    getGraph(sessionId) {
        return this.interviewGraphs.get(sessionId);
    }
    // Utility methods
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    // Clean up expired sessions (can be extended for production)
    cleanupExpiredSessions(maxAge = 3600000) {
        const now = Date.now();
        let cleanedCount = 0;
        for (const [sessionId, state] of this.interviewSessions.entries()) {
            const sessionTimestamp = parseInt(sessionId.split('_')[1]);
            if (now - sessionTimestamp > maxAge) {
                this.deleteSession(sessionId);
                cleanedCount++;
            }
        }
        return cleanedCount;
    }
}
// Singleton instance
export const interviewRepository = new InterviewRepository();
//# sourceMappingURL=InterviewRepository.js.map