import { InterviewStateType } from '../../types/state.js';
import { InterviewDataService } from '../../services/InterviewDataService.js';
/**
 * 면접의 초기 상태 객체를 생성하는 책임을 가진 클래스입니다.
 * InterviewDataService로부터 데이터를 받아 상태를 조립합니다.
 */
export declare class InitialStateBuilder {
    private dataService;
    constructor(dataService: InterviewDataService);
    /**
     * 모든 구성 요소를 조합하여 완전한 초기 상태 객체를 빌드합니다.
     * @param {Partial<InterviewStateType>} initialContext - API 요청 등 외부에서 제공된 초기 컨텍스트
     * @returns {Promise<InterviewStateType>} 완전한 초기 상태 객체
     */
    build(initialContext?: Partial<InterviewStateType>): Promise<InterviewStateType>;
}
//# sourceMappingURL=InitialStateBuilder.d.ts.map