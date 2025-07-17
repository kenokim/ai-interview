import { interviewRepository } from '../repositories/InterviewRepository.js';
import { createInterviewGraph, startInterview, processUserInput } from '../langgraph/interviewer.js';
export class InterviewService {
    async startInterview(request) {
        const { jobRole, experience, interviewType, resume, jobDescription, userName } = request;
        // Generate session ID
        const sessionId = interviewRepository.generateSessionId();
        // Create interview graph
        const graph = createInterviewGraph();
        interviewRepository.saveGraph(sessionId, graph);
        // Prepare initial state with user context
        const initialState = {
            user_context: {
                user_id: sessionId,
                profile: {
                    name: userName || "Anonymous",
                    experience_level: experience,
                    tech_stack: [jobRole],
                    preferred_language: "JavaScript"
                }
            }
        };
        // Start the interview
        const state = await startInterview(graph, initialState);
        interviewRepository.saveSession(sessionId, state);
        // Get the initial AI message
        const lastMessage = state.messages[state.messages.length - 1];
        return {
            sessionId,
            message: typeof lastMessage.content === 'string' ? lastMessage.content : JSON.stringify(lastMessage.content),
            stage: state.task.interview_stage,
            turnCount: state.evaluation.turn_count,
            userContext: {
                jobRole,
                experience,
                interviewType,
                resume: resume || null,
                jobDescription: jobDescription || null,
                userName: userName || null
            }
        };
    }
    async sendMessage(request) {
        const { sessionId, message } = request;
        // Get session data
        const currentState = interviewRepository.getSession(sessionId);
        const graph = interviewRepository.getGraph(sessionId);
        if (!currentState || !graph) {
            throw new Error('Interview session not found');
        }
        // Process user input
        const updatedState = await processUserInput(graph, currentState, message);
        interviewRepository.saveSession(sessionId, updatedState);
        // Get AI response
        const aiResponse = updatedState.messages[updatedState.messages.length - 1];
        return {
            message: typeof aiResponse.content === 'string' ? aiResponse.content : JSON.stringify(aiResponse.content),
            stage: updatedState.task.interview_stage,
            turnCount: updatedState.evaluation.turn_count,
            messageCount: updatedState.messages.length,
            currentQuestion: updatedState.task.current_question,
            questionsAsked: updatedState.task.questions_asked.length,
            lastEvaluation: updatedState.evaluation.last_evaluation ? {
                score: updatedState.evaluation.last_evaluation.overall_score,
                evaluations: updatedState.evaluation.last_evaluation.evaluations,
                is_sufficient: updatedState.evaluation.last_evaluation.is_sufficient
            } : undefined,
            interviewProgress: {
                stage: updatedState.task.interview_stage,
                totalQuestions: updatedState.task.question_pool.length,
                questionsAsked: updatedState.task.questions_asked.length,
                isComplete: updatedState.task.interview_stage === "Finished"
            }
        };
    }
    getSessionStatus(sessionId) {
        const state = interviewRepository.getSession(sessionId);
        if (!state) {
            throw new Error('Interview session not found');
        }
        return {
            stage: state.task.interview_stage,
            turnCount: state.evaluation.turn_count,
            messageCount: state.messages.length,
            lastEvaluation: state.evaluation.last_evaluation ? {
                score: state.evaluation.last_evaluation.overall_score,
                evaluations: state.evaluation.last_evaluation.evaluations,
                is_sufficient: state.evaluation.last_evaluation.is_sufficient
            } : undefined
        };
    }
    endInterview(sessionId) {
        const state = interviewRepository.getSession(sessionId);
        if (!state) {
            throw new Error('Interview session not found');
        }
        // Clean up session data
        interviewRepository.deleteSession(sessionId);
        return {
            message: 'Interview session ended successfully',
            sessionSummary: {
                sessionId,
                totalTurns: state.evaluation.turn_count,
                totalMessages: state.messages.length,
                questionsAsked: state.task.questions_asked.length,
                stage: state.task.interview_stage,
                duration: Date.now() - parseInt(sessionId.split('_')[1])
            },
            finalEvaluation: state.evaluation.last_evaluation ? {
                score: state.evaluation.last_evaluation.overall_score,
                evaluations: state.evaluation.last_evaluation.evaluations,
                is_sufficient: state.evaluation.last_evaluation.is_sufficient
            } : undefined,
            interviewResults: {
                questionsAsked: state.task.questions_asked,
                finalSummary: state.evaluation.final_evaluation_summary,
                taskSuccessful: state.evaluation.task_successful,
                recommendations: state.evaluation.last_evaluation?.evaluations?.map(evaluation => ({
                    area: evaluation.criterion,
                    score: evaluation.score,
                    feedback: evaluation.reasoning
                })) || []
            }
        };
    }
    getAllSessions() {
        const sessions = interviewRepository.getAllSessions();
        return {
            sessions,
            totalSessions: sessions.length
        };
    }
    // Utility methods
    sessionExists(sessionId) {
        return interviewRepository.sessionExists(sessionId);
    }
    cleanupExpiredSessions(maxAge) {
        return interviewRepository.cleanupExpiredSessions(maxAge);
    }
}
// Singleton instance
export const interviewService = new InterviewService();
//# sourceMappingURL=InterviewService.js.map