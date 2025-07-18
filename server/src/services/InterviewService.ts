import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { Runnable, RunnableConfig } from "@langchain/core/runnables";
import {
  InterviewStateType,
} from "../types/state.js";
import {
  StartInterviewRequest,
  SendMessageRequest,
  EndInterviewRequest,
  TriggerInterviewRequest,
  StartInterviewResponse,
  TriggerInterviewResponse,
  SendMessageResponse,
  SessionStatusResponse,
  EndInterviewResponse,
  SessionsListResponse,
} from "../types/api.js";
import { InterviewGraph } from "../langgraph/InterviewGraph.js";

export class InterviewService {
  private sessions: Map<string, Runnable<any, any>>;
  private interviewGraph: InterviewGraph;

  constructor() {
    this.sessions = new Map();
    this.interviewGraph = new InterviewGraph();
  }

  public async startInterview(body: StartInterviewRequest) {
    const sessionId = `session_${Date.now()}`;
    const newInterview = this.interviewGraph.compile();
    this.sessions.set(sessionId, newInterview);
    console.log("🚀 Starting interview...");

    const initialState: InterviewStateType = {
      messages: [new HumanMessage({ content: "안녕하세요, 면접을 시작하겠습니다." })],
      userContext: {
        jobRole: body.jobRole,
        experience: body.experience,
        interviewType: body.interviewType,
        resume: body.resume,
        jobDescription: body.jobDescription,
        userName: body.userName,
      },
      interview_stage: "Greeting",
      questions_asked: [],
      next: "supervisor",
    };

    const response = await newInterview.invoke(initialState, {
      configurable: { thread_id: sessionId },
    });

    return this.formatResponse(sessionId, response, "start") as StartInterviewResponse;
  }

  public async triggerInterview(body: TriggerInterviewRequest) {
    const { session_id: sessionId, event_type, event_id, user_id, metadata } = body;
    if (this.sessions.has(sessionId)) {
      // Idempotency check
      console.log(`[${sessionId}] Received duplicate trigger event, ignoring.`);
      const existingGraph = this.sessions.get(sessionId)!;
      const currentState = await existingGraph.invoke({}, { configurable: { thread_id: sessionId } });
      return this.formatResponse(sessionId, currentState, "trigger") as TriggerInterviewResponse;
    }

    const newInterview = this.interviewGraph.compile();
    this.sessions.set(sessionId, newInterview);
    console.log(`🚀 Triggering proactive interview for event: ${event_type}`);

    const initialState: InterviewStateType = {
      messages: [],
      userContext: {
        jobRole: metadata?.job_role || "ai_agent",
        experience: metadata?.experience || "junior",
        interviewType: metadata?.interview_type || "technical",
        userName: user_id,
      },
      interview_stage: "Greeting",
      questions_asked: [],
      next: "supervisor",
      trigger_context: {
        event_type,
        event_id,
        metadata,
      },
    };

    const finalState = await newInterview.invoke(initialState, {
      configurable: { thread_id: sessionId },
    });

    return this.formatResponse(sessionId, finalState, "trigger") as TriggerInterviewResponse;
  }

  public async sendMessage(body: SendMessageRequest) {
    const { sessionId, message } = body;
    const interview = this.sessions.get(sessionId);
    if (!interview) {
      throw new Error("Session not found");
    }

    const response = await interview.invoke(
      {
        messages: [new HumanMessage(message)],
        interview_stage: "Answering"
      },
      {
        configurable: { thread_id: sessionId },
      }
    );

    return this.formatResponse(sessionId, response, "message") as SendMessageResponse;
  }

  public async getSessionStatus(sessionId: string) {
    const interview = this.sessions.get(sessionId);
    if (!interview) {
      throw new Error("Session not found");
    }
    const state = await interview.invoke({}, {
      configurable: { thread_id: sessionId },
    });
    return this.formatResponse(sessionId, state, "status") as SessionStatusResponse;
  }

  public async endInterview(body: EndInterviewRequest) {
    const { sessionId } = body;
    const interview = this.sessions.get(sessionId);
    if (!interview) {
      throw new Error("Session not found");
    }
    
    // You might want to do some cleanup or final evaluation here
    const response = await interview.invoke(
        {
            messages: [new HumanMessage("면접을 종료합니다.")],
            next: "supervisor",
            interview_stage: "Finished"
        },
        {
          configurable: { thread_id: sessionId },
        }
      );
    this.sessions.delete(sessionId);
    return this.formatResponse(sessionId, response, "end") as EndInterviewResponse;
  }

  private formatResponse(
    sessionId: string, 
    state: InterviewStateType, 
    type: "start" | "trigger" | "message" | "status" | "end"
    ) {
    const lastMessage = state.messages[state.messages.length - 1];
    const messageContent = lastMessage?.content?.toString() ?? "";

    const baseResponse = {
        sessionId,
        message: messageContent,
        stage: state.interview_stage,
        messageCount: state.messages.length,
        userContext: state.userContext,
        lastEvaluation: state.last_evaluation,
        questionsAsked: state.questions_asked.length,
      };

    switch (type) {
        case "trigger":
            return {
                status: "triggered",
                sessionId,
                message: messageContent || "Interview triggered. Waiting for user to start.",
              } as TriggerInterviewResponse;
        case "start":
            return baseResponse as StartInterviewResponse;
        case "message":
            return baseResponse as SendMessageResponse;
        case "status":
            return baseResponse as SessionStatusResponse;
        case "end":
            return {
                ...baseResponse,
                message: "Interview ended successfully.",
            } as EndInterviewResponse
        default:
            return baseResponse;
    }
  }

  public listSessions(): SessionsListResponse {
    const sessionIds = Array.from(this.sessions.keys());
    return {
        sessions: sessionIds.map((sessionId) => ({
            sessionId: sessionId,
          })),
        totalSessions: sessionIds.length,
    }
  }
}

export const interviewService = new InterviewService(); 