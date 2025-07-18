import { interviewRepository } from '../repositories/InterviewRepository.js';
import { createInterviewGraph, startInterview, processUserInput } from '../langgraph/interviewer.js';
import { 
  StartInterviewRequest, 
  SendMessageRequest, 
  StartInterviewResponse,
  SendMessageResponse,
  SessionStatusResponse,
  EndInterviewResponse,
  SessionsListResponse 
} from '../types/api.js';

export class InterviewService {
  
  async startInterview(request: StartInterviewRequest): Promise<StartInterviewResponse> {
    const { jobRole, experience, interviewType, resume, jobDescription, userName } = request;
    
    // 세션 ID를 생성합니다.
    const sessionId = interviewRepository.generateSessionId();
    
    // 면접 그래프를 생성합니다.
    const graph = createInterviewGraph();
    interviewRepository.saveGraph(sessionId, graph);
    
    // 사용자 컨텍스트를 포함한 초기 상태를 준비합니다.
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
    
    // 면접을 시작합니다.
    const state = await startInterview(graph, initialState);
    interviewRepository.saveSession(sessionId, state);
    
    // AI의 첫 번째 메시지를 가져옵니다.
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

  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    const { sessionId, message } = request;
    
    // 세션 데이터를 가져옵니다.
    const currentState = interviewRepository.getSession(sessionId);
    const graph = interviewRepository.getGraph(sessionId);
    
    if (!currentState || !graph) {
      throw new Error('Interview session not found');
    }
    
    // 사용자 입력을 처리합니다.
    const updatedState = await processUserInput(graph, currentState, message);
    interviewRepository.saveSession(sessionId, updatedState);
    
    // AI의 응답을 가져옵니다.
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

  getSessionStatus(sessionId: string): SessionStatusResponse {
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

  endInterview(sessionId: string): EndInterviewResponse {
    const state = interviewRepository.getSession(sessionId);
    
    if (!state) {
      throw new Error('Interview session not found');
    }
    
    // 세션 데이터를 정리합니다.
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

  getAllSessions(): SessionsListResponse {
    const sessions = interviewRepository.getAllSessions();
    
    return {
      sessions,
      totalSessions: sessions.length
    };
  }

  // 유틸리티 메서드
  sessionExists(sessionId: string): boolean {
    return interviewRepository.sessionExists(sessionId);
  }

  cleanupExpiredSessions(maxAge?: number): number {
    return interviewRepository.cleanupExpiredSessions(maxAge);
  }
}

// 싱글턴 인스턴스
export const interviewService = new InterviewService(); 