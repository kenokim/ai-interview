import { StateGraph } from "@langchain/langgraph";
export const interviewStateGraph = {
    channels: {
        messages: {
            value: (x, y) => x.concat(y),
            default: () => [],
        },
        user_context: {
            value: (x, y) => ({ ...x, ...y }),
            default: () => ({ user_id: "" }),
        },
        persona: {
            value: (x, y) => y,
            default: () => ({
                name: "InterviewerAI",
                role: "AI 기술 면접관",
                backstory: "사용자의 성공적인 기술 면접 경험을 돕기 위해 설계된 AI 에이전트입니다.",
                style_guidelines: ["전문적이고 친절한 어조를 유지합니다."],
            })
        },
        guardrails: {
            value: (x, y) => ({ ...x, ...y }),
            default: () => ({
                is_safe: true,
                fallback_count: 0
            })
        },
        proactive: {
            value: (x, y) => y,
            default: () => undefined,
        },
        flow_control: {
            value: (x, y) => ({ ...x, ...y }),
            default: () => ({})
        },
        task: {
            value: (x, y) => ({ ...x, ...y }),
            default: () => ({
                interview_stage: "Greeting",
                question_pool: [],
                questions_asked: [],
                current_difficulty: 50,
            })
        },
        evaluation: {
            value: (x, y) => ({ ...x, ...y }),
            default: () => ({
                turn_count: 0,
            })
        },
    },
};
export const InterviewStateAnnotation = new StateGraph(interviewStateGraph);
//# sourceMappingURL=state.js.map