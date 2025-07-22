import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { Runnable, RunnableConfig } from "@langchain/core/runnables";
import { CompiledGraph } from "@langchain/langgraph";
import {
  InterviewStateType
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
    console.log("면접을 시작합니다...");
    console.log("Received startInterview body:", body);

    const initialState: InterviewStateType = {
      messages: [], // Supervisor가 면접 시작을 감지하도록 빈 배열로 초기화합니다.
      user_context: {
        user_id: body.userName || `user_${Date.now()}`,
        profile: {
          jobRole: body.jobRole,
          experience: body.experience,
          interviewType: body.interviewType,
          resume: body.resume,
          jobDescription: body.jobDescription,
          userName: body.userName,
        }
      },
      persona: {
        name: "InterviewerAI",
        role: "AI 기술 면접관",
        backstory: "사용자의 성공적인 기술 면접 경험을 돕기 위해 설계된 AI 에이전트입니다.",
        style_guidelines: ["전문적이고 친절한 어조를 유지합니다."],
      },
      flow_control: {
        // Supervisor가 모든 라우팅을 결정하도록 비워둡니다.
      },
      task: {
        interview_stage: "Greeting",
        question_pool: [],
        questions_asked: [],
        current_difficulty: 50,
      },
      evaluation: {
        turn_count: 0,
      }
    };

    console.log("Generated initialState:", JSON.stringify(initialState, null, 2));

    const response = await newInterview.invoke(initialState, {
      configurable: { thread_id: sessionId },
    });

    return this.formatResponse(sessionId, response, "start") as StartInterviewResponse;
  }

  public async triggerInterview(body: TriggerInterviewRequest) {
    const { session_id: sessionId, event_type, event_id, user_id, metadata } = body;
    if (this.sessions.has(sessionId)) {
      // Idempotency check
      console.log(`[${sessionId}] 중복 트리거 이벤트를 받았습니다. 무시합니다.`);
      const existingGraph = this.sessions.get(sessionId)!;
      const currentState = await existingGraph.invoke({}, { configurable: { thread_id: sessionId } });
      return this.formatResponse(sessionId, currentState, "trigger") as TriggerInterviewResponse;
    }

    const newInterview = this.interviewGraph.compile();
    this.sessions.set(sessionId, newInterview);
    console.log(`선제적 면접을 트리거합니다. 이벤트: ${event_type}`);

    const initialState: InterviewStateType = {
      messages: [],
      user_context: {
        user_id: user_id,
        profile: {
          jobRole: metadata?.job_role || "ai_agent",
          experience: metadata?.experience || "junior",
          interviewType: metadata?.interview_type || "technical",
          userName: user_id,
        }
      },
      persona: {
        name: "InterviewerAI",
        role: "AI 기술 면접관",
        backstory: "사용자의 성공적인 기술 면접 경험을 돕기 위해 설계된 AI 에이전트입니다.",
        style_guidelines: ["전문적이고 친절한 어조를 유지합니다."],
      },
      proactive: {
        trigger_event_type: event_type,
        trigger_event_id: event_id,
        metadata: metadata || {},
      },
      flow_control: {
        // Let supervisor decide
      },
      task: {
        interview_stage: "Greeting",
        question_pool: [],
        questions_asked: [],
        current_difficulty: 50,
      },
      evaluation: {
        turn_count: 0,
      }
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

    console.log(`[${sessionId}] Received message: "${message}"`);

    // LangGraph 문서 근거: "Manually retrieve and update the original state"
    // invoke({})는 상태를 초기화하므로 사용하지 않습니다.
    // 대신 새 메시지만 전달하여 LangGraph의 reducer 함수가 올바르게 작동하도록 합니다.
    const response = await interview.invoke(
      {
        messages: [new HumanMessage(message)], // 새 메시지만 전달
      },
      {
        configurable: { thread_id: sessionId },
      }
    );

    console.log(`[${sessionId}] Final user_context in response:`, JSON.stringify(response.user_context, null, 2));
    console.log(`[${sessionId}] State after invoke:`, JSON.stringify(response, null, 2));
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
    
    // 정리나 최종 평가를 수행할 수 있습니다
    const response = await interview.invoke(
        {
            messages: [new HumanMessage("면접을 종료합니다.")],
            flow_control: {
              next_worker: "farewell_agent"
            },
            task: {
              interview_stage: "Finished"
            }
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
        stage: state.task.interview_stage,
        messageCount: state.messages.length,
        userContext: {
          jobRole: state.user_context.profile?.jobRole || "",
          experience: state.user_context.profile?.experience || "",
          interviewType: state.user_context.profile?.interviewType || "",
          resume: state.user_context.profile?.resume,
          jobDescription: state.user_context.profile?.jobDescription,
          userName: state.user_context.profile?.userName,
        },
        lastEvaluation: state.task.agent_outcome,
        questionsAsked: state.task.questions_asked.length,
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