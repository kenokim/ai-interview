import { StateGraph } from "@langchain/langgraph";
export const interviewStateGraph = {
    channels: {
        messages: {
            value: (x, y) => x.concat(y),
            default: () => [],
        },
        userContext: {
            value: (x, y) => ({ ...x, ...y }),
            default: () => ({
                jobRole: "ai_agent",
                experience: "junior",
                interviewType: "technical",
            }),
        },
        interview_stage: {
            value: (x, y) => y,
            default: () => "Greeting",
        },
        questions_asked: {
            value: (x, y) => x.concat(y),
            default: () => [],
        },
        current_question: {
            value: (x, y) => y,
            default: () => undefined,
        },
        last_evaluation: {
            value: (x, y) => y,
            default: () => undefined,
        },
        next: {
            value: (x, y) => y,
            default: () => "supervisor",
        },
        trigger_context: {
            value: (x, y) => y,
            default: () => undefined,
        }
    },
};
export const InterviewStateAnnotation = new StateGraph(interviewStateGraph);
//# sourceMappingURL=state.js.map