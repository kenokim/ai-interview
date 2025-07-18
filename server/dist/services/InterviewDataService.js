/**
 * 면접에 필요한 데이터(페르소나, 질문 등)를 데이터베이스나 다른 소스에서
 * 가져오는 책임을 가진 서비스 클래스입니다.
 */
export class InterviewDataService {
    /**
     * 기본 페르소나 정보를 가져옵니다.
     * @returns {Promise<PersonaState>} 페르소나 상태 객체
     */
    async fetchPersona() {
        // 향후에는 이 부분에서 DB를 조회하여 동적으로 페르소나를 가져옵니다.
        return {
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
        };
    }
    /**
     * 기본 질문 목록을 가져옵니다.
     * @returns {Promise<Record<string, any>[]>} 질문 객체의 배열
     */
    async fetchQuestionPool() {
        // 향후에는 이 부분에서 DB를 조회하여 직무나 경력에 맞는 질문 목록을 가져옵니다.
        return [
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
        ];
    }
}
//# sourceMappingURL=InterviewDataService.js.map