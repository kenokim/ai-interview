import { HumanMessage } from "@langchain/core/messages";
import { InterviewGraph } from "../langgraph/InterviewGraph.js";
export class InterviewService {
    sessions;
    interviewGraph;
    constructor() {
        this.sessions = new Map();
        this.interviewGraph = new InterviewGraph();
    }
    async startInterview(body) {
        const sessionId = `session_${Date.now()}`;
        const newInterview = this.interviewGraph.compile();
        this.sessions.set(sessionId, newInterview);
        console.log("면접을 시작합니다...");
        console.log("Received startInterview body:", body);
        const initialState = {
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
        return this.formatResponse(sessionId, response, "start");
    }
    async triggerInterview(body) {
        const { session_id: sessionId, event_type, event_id, user_id, metadata } = body;
        if (this.sessions.has(sessionId)) {
            // Idempotency check
            console.log(`[${sessionId}] 중복 트리거 이벤트를 받았습니다. 무시합니다.`);
            const existingGraph = this.sessions.get(sessionId);
            const currentState = await existingGraph.invoke({}, { configurable: { thread_id: sessionId } });
            return this.formatResponse(sessionId, currentState, "trigger");
        }
        const newInterview = this.interviewGraph.compile();
        this.sessions.set(sessionId, newInterview);
        console.log(`선제적 면접을 트리거합니다. 이벤트: ${event_type}`);
        const initialState = {
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
        return this.formatResponse(sessionId, finalState, "trigger");
    }
    async sendMessage(body) {
        const { sessionId, message } = body;
        const interview = this.sessions.get(sessionId);
        if (!interview) {
            throw new Error("Session not found");
        }
        console.log(`[${sessionId}] Received message: "${message}"`);
        // 1. 현재 상태를 먼저 가져옵니다.
        const currentState = await interview.invoke({}, { configurable: { thread_id: sessionId } });
        console.log(`[${sessionId}] Current state before update:`, JSON.stringify(currentState, null, 2));
        // 2. 현재 상태에 새 메시지를 추가합니다.
        const newMessages = [...currentState.messages, new HumanMessage(message)];
        const response = await interview.invoke({
            // 모든 상태 필드를 명시적으로 다시 전달하여 유실을 방지합니다.
            user_context: currentState.user_context,
            persona: currentState.persona,
            guardrails: currentState.guardrails,
            proactive: currentState.proactive,
            flow_control: currentState.flow_control,
            task: currentState.task,
            evaluation: currentState.evaluation,
            messages: newMessages, // messages 필드만 업데이트
        }, {
            configurable: { thread_id: sessionId },
        });
        console.log(`[${sessionId}] State after invoke:`, JSON.stringify(response, null, 2));
        return this.formatResponse(sessionId, response, "message");
    }
    async getSessionStatus(sessionId) {
        const interview = this.sessions.get(sessionId);
        if (!interview) {
            throw new Error("Session not found");
        }
        const state = await interview.invoke({}, {
            configurable: { thread_id: sessionId },
        });
        return this.formatResponse(sessionId, state, "status");
    }
    async endInterview(body) {
        const { sessionId } = body;
        const interview = this.sessions.get(sessionId);
        if (!interview) {
            throw new Error("Session not found");
        }
        // 정리나 최종 평가를 수행할 수 있습니다
        const response = await interview.invoke({
            messages: [new HumanMessage("면접을 종료합니다.")],
            flow_control: {
                next_worker: "farewell_agent"
            },
            task: {
                interview_stage: "Finished"
            }
        }, {
            configurable: { thread_id: sessionId },
        });
        this.sessions.delete(sessionId);
        return this.formatResponse(sessionId, response, "end");
    }
    formatResponse(sessionId, state, type) {
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
                };
            case "start":
                return baseResponse;
            case "message":
                return baseResponse;
            case "status":
                return baseResponse;
            case "end":
                return {
                    ...baseResponse,
                    message: "Interview ended successfully.",
                };
            default:
                return baseResponse;
        }
    }
    listSessions() {
        const sessionIds = Array.from(this.sessions.keys());
        return {
            sessions: sessionIds.map((sessionId) => ({
                sessionId: sessionId,
            })),
            totalSessions: sessionIds.length,
        };
    }
}
export const interviewService = new InterviewService();
//# sourceMappingURL=InterviewService.js.map