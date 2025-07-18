import { PersonaState } from '../types/state.js';
/**
 * 면접에 필요한 데이터(페르소나, 질문 등)를 데이터베이스나 다른 소스에서
 * 가져오는 책임을 가진 서비스 클래스입니다.
 */
export declare class InterviewDataService {
    /**
     * 기본 페르소나 정보를 가져옵니다.
     * @returns {Promise<PersonaState>} 페르소나 상태 객체
     */
    fetchPersona(): Promise<PersonaState>;
    /**
     * 기본 질문 목록을 가져옵니다.
     * @returns {Promise<Record<string, any>[]>} 질문 객체의 배열
     */
    fetchQuestionPool(): Promise<Record<string, any>[]>;
}
//# sourceMappingURL=InterviewDataService.d.ts.map