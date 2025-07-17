import { Annotation } from "@langchain/langgraph";
// LangGraph State Annotation
export const InterviewStateAnnotation = Annotation.Root({
    user_context: Annotation({
        reducer: (prev, next) => ({ ...prev, ...next }),
        default: () => ({
            user_id: "default_user",
            profile: {
                name: "Test User",
                experience_level: "mid-level",
                tech_stack: ["JavaScript", "React", "Node.js"],
                preferred_language: "JavaScript"
            }
        })
    }),
    messages: Annotation({
        reducer: (prev, next) => prev.concat(next),
        default: () => []
    }),
    persona: Annotation({
        reducer: (prev, next) => ({ ...prev, ...next }),
        default: () => ({
            name: "Dr. Sarah Chen",
            role: "Senior Technical Interviewer",
            backstory: "A seasoned software engineer with 15+ years of experience in full-stack development and technical leadership.",
            style_guidelines: [
                "Ask follow-up questions to understand depth of knowledge",
                "Provide constructive feedback",
                "Maintain professional yet approachable tone",
                "Focus on problem-solving approach over memorized answers"
            ],
            current_mood: "professional"
        })
    }),
    guardrails: Annotation({
        reducer: (prev, next) => ({ ...prev, ...next }),
        default: () => ({
            is_safe: true,
            fallback_count: 0
        })
    }),
    proactive: Annotation({
        reducer: (prev, next) => ({ ...prev, ...next }),
        default: () => ({
            trigger_event_type: "interview_start",
            trigger_event_id: "default",
            metadata: {}
        })
    }),
    flow_control: Annotation({
        reducer: (prev, next) => ({ ...prev, ...next }),
        default: () => ({
            next_worker: undefined
        })
    }),
    task: Annotation({
        reducer: (prev, next) => ({ ...prev, ...next }),
        default: () => ({
            interview_stage: "Greeting",
            question_pool: [
                {
                    id: "js_closures",
                    text: "Can you explain what closures are in JavaScript and provide an example?",
                    category: "JavaScript",
                    difficulty: "medium",
                    expected_topics: ["lexical scoping", "function scope", "practical examples"]
                },
                {
                    id: "react_hooks",
                    text: "What are React Hooks and how do they differ from class components?",
                    category: "React",
                    difficulty: "medium",
                    expected_topics: ["useState", "useEffect", "lifecycle methods"]
                },
                {
                    id: "async_js",
                    text: "Explain the difference between Promises and async/await in JavaScript.",
                    category: "JavaScript",
                    difficulty: "medium",
                    expected_topics: ["asynchronous programming", "error handling", "syntax differences"]
                }
            ],
            questions_asked: [],
            current_question: undefined,
            current_answer: undefined,
            agent_outcome: undefined,
            tool_outputs: undefined
        })
    }),
    evaluation: Annotation({
        reducer: (prev, next) => ({ ...prev, ...next }),
        default: () => ({
            turn_count: 0,
            last_user_feedback: undefined,
            task_successful: undefined,
            final_evaluation_summary: undefined,
            last_evaluation: undefined
        })
    })
});
//# sourceMappingURL=state.js.map