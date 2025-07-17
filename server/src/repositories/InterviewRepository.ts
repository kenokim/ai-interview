import { InterviewStateType } from '../types/state.js';

export class InterviewRepository {
  private interviewSessions = new Map<string, InterviewStateType>();
  private interviewGraphs = new Map<string, any>();

  // Session management
  saveSession(sessionId: string, state: InterviewStateType): void {
    this.interviewSessions.set(sessionId, state);
  }

  getSession(sessionId: string): InterviewStateType | undefined {
    return this.interviewSessions.get(sessionId);
  }

  deleteSession(sessionId: string): boolean {
    const sessionExists = this.interviewSessions.has(sessionId);
    this.interviewSessions.delete(sessionId);
    this.interviewGraphs.delete(sessionId);
    return sessionExists;
  }

  sessionExists(sessionId: string): boolean {
    return this.interviewSessions.has(sessionId);
  }

  getAllSessions(): Array<{
    sessionId: string;
    stage: string;
    turnCount: number;
    messageCount: number;
  }> {
    return Array.from(this.interviewSessions.entries()).map(([sessionId, state]) => ({
      sessionId,
      stage: state.task.interview_stage,
      turnCount: state.evaluation.turn_count,
      messageCount: state.messages.length
    }));
  }

  getTotalSessionCount(): number {
    return this.interviewSessions.size;
  }

  // Graph management
  saveGraph(sessionId: string, graph: any): void {
    this.interviewGraphs.set(sessionId, graph);
  }

  getGraph(sessionId: string): any {
    return this.interviewGraphs.get(sessionId);
  }

  // Utility methods
  generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Clean up expired sessions (can be extended for production)
  cleanupExpiredSessions(maxAge: number = 3600000): number { // 1 hour default
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