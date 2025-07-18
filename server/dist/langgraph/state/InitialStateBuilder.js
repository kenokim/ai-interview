import { HumanMessage } from '@langchain/core/messages';
/**
 * 면접의 초기 상태 객체를 생성하는 책임을 가진 클래스입니다.
 * InterviewDataService로부터 데이터를 받아 상태를 조립합니다.
 */
export class InitialStateBuilder {
    dataService;
    constructor(dataService) {
        this.dataService = dataService;
    }
    /**
     * 모든 구성 요소를 조합하여 완전한 초기 상태 객체를 빌드합니다.
     * @param {Partial<InterviewStateType>} initialContext - API 요청 등 외부에서 제공된 초기 컨텍스트
     * @returns {Promise<InterviewStateType>} 완전한 초기 상태 객체
     */
    async build(initialContext) {
        const persona = await this.dataService.fetchPersona();
        const questionPool = await this.dataService.fetchQuestionPool();
        const state = {
            user_context: initialContext?.user_context || {
                user_id: "default_user",
                profile: {
                    name: "Test User",
                    experience_level: "mid-level",
                    tech_stack: ["JavaScript", "React", "Node.js"],
                    preferred_language: "JavaScript"
                }
            },
            messages: [new HumanMessage("안녕하세요, 면접을 시작하겠습니다.")],
            persona: initialContext?.persona || persona,
            guardrails: {
                is_safe: true,
                fallback_count: 0
            },
            proactive: {
                trigger_event_type: "interview_start",
                trigger_event_id: "default",
                metadata: {}
            },
            flow_control: {
                next_worker: undefined
            },
            task: {
                interview_stage: "Greeting",
                question_pool: questionPool,
                questions_asked: [],
                current_question: undefined,
                current_answer: undefined,
                agent_outcome: undefined,
                tool_outputs: undefined
            },
            evaluation: {
                turn_count: 0,
                last_user_feedback: undefined,
                task_successful: undefined,
                final_evaluation_summary: undefined,
                last_evaluation: undefined
            },
            next: 'supervisor',
            ...initialContext
        };
        return state;
    }
}
//# sourceMappingURL=InitialStateBuilder.js.map