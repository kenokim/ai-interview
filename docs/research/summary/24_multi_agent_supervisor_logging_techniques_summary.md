## 멀티에이전트 슈퍼바이저 로깅 및 관찰 가능성 요약

### 개요
멀티에이전트 슈퍼바이저 아키텍처에서는 에이전트 간 상호작용과 분산된 추론 과정이 복잡하게 전개된다. 단일 입출력 로깅을 넘어 요청의 전체 여정과 각 의사결정 맥락을 추적하는 프로덕션 등급 관찰 가능성이 필수다.

### 핵심 로깅 원칙
- 구조화된 로깅(JSON 우선): 문자열 로그 대신 키/값 필드 중심 JSON 이벤트로 기록한다.
- 상관관계 ID 전파: 사용자 요청 시작 시 correlationId 생성, supervisor → worker → tool 전 구간에 자동 전파한다.
- 자식 로거와 컨텍스트: 요청 범위의 자식 로거를 만들고 agent.name, tool.name 등 맥락 필드를 바인딩한다.
- 전략적 로그 레벨: trace/debug(프롬프트·완성), info(주요 이벤트), warn(지연·재시도), error/fatal(실패)로 일관되게 사용한다.
- 민감정보 마스킹: 토큰·PII는 redact 설정으로 제거한다.

### 워커 노드 로깅 가이드
- 필수 필드: timestamp, level, correlationId, agent.name, event, message
- 선택 필드: tool.name, latencyMs, inputSize, outputSize, error, retryCount, decision
- 권장 이벤트: agent.started, agent.tool_call, agent.tool_result, agent.completed, agent.error

### 구현 권장 사항(Node.js/TS)
- 로거: Pino 권장. 개발 환경은 pino-pretty, 프로덕션은 pino/file 또는 외부 전송 사용.
- 전송 분리: NODE_ENV에 따라 전송·포매터 분리, 앱 이벤트 루프 차단 방지.
- 예외 로깅: error 객체를 구조화해 스택과 컨텍스트 포함.

### OpenTelemetry 추적
- 개념: Trace(요청 여정), Span(단일 작업), Attributes(맥락 메타데이터)
- 사용자 정의 속성 예: agent.name, tool.name, supervisor.decision, prompt.template, llm.model_name, llm.cost, latency.ms
- 효과: 로그와 결합 시 원인 분석, 성능 병목 식별, 비용 추적을 정밀하게 수행.

### 플랫폼 전략
- LangSmith: 개발·디버깅용 추적 시각화, 평가, 프롬프트 반복에 최적.
- Datadog: 프로덕션 성능·비용·이상 감지, APM 상관관계에 강함.
- Grafana/Loki 스택: 자체 호스팅, 비용 최적화, 높은 사용자 정의성.
- 하이브리드: 개발 내부 루프는 LangSmith, 운영 외부 루프는 Datadog/Grafana를 병행.

### 단계별 로드맵
1단계 통제 확보: Pino 구조화 로그, correlationId 강제. 기본 디버깅 가능.
2단계 이유 이해: LangSmith 통합, 에이전트 궤적 시각화·평가.
3단계 자신감 운영: OpenTelemetry 계측, Datadog/Grafana로 추적·메트릭 전송.

### 체크리스트
- 모든 로그가 JSON이며 필수 필드를 포함하는가
- correlationId가 전 구간에 전파되는가
- 워커 시작/도구 호출/완료/오류 이벤트가 일관된 스키마로 기록되는가
- 로그 레벨·레다ction·전송이 환경별로 적절한가
- OTel 스팬 속성으로 에이전트 문맥을 보강하는가


