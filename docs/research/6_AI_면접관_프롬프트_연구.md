# **LangGraph 기반 AI 면접관 챗봇을 위한 에이전트 프롬프트 아키텍처 설계 보고서**

## **1. 에이전틱 프롬프팅의 foundational principles: 멀티 에이전트 시스템을 위한 기본 원칙** {#에이전틱-프롬프팅의-foundational-principles-멀티-에이전트-시스템을-위한-기본-원칙}

성공적인 멀티 에이전트 시스템의 구축은 개별 에이전트의 지능을 넘어,
에이전트 간의 상호작용을 지배하는 명확하고 강건한 프로토콜에 의존합니다.
LangGraph 기반의 AI 면접관 아키텍처에서 각 에이전트의 프롬프트는 단순한
지시사항이 아니라, 시스템 전체의 안정성과 예측 가능성을 보장하는 핵심
설계 요소입니다. 본 보고서에서 제안하는 모든 프롬프트는 다음의 세 가지
기본 원칙을 기반으로 설계되었습니다.

### **1.1. 페르소나의 의무: 모호한 역할에서 전문가 정체성으로** {#페르소나의-의무-모호한-역할에서-전문가-정체성으로}

멀티 에이전트 시스템에서 \'페르소나\'는 단순히 챗봇의 말투를 꾸미는
장식적 요소가 아닙니다. 이는 각 에이전트의 행동 범위를 명확히 제한하고,
예측 가능한 전문성을 강제하는 핵심적인 제어 메커니즘입니다.^1^ 시스템의
안정성은 각 에이전트가 자신의 좁고 명확하게 정의된 책임 영역을 벗어나지
않을 때 극대화됩니다.^1^ 따라서 각 에이전트의 프롬프트는 그 역할을
극도로 정밀하게 정의해야 하며, 이는 전문 분야, 책임, 그리고 가장
중요하게는 \'하지 말아야 할 일\'의 경계를 포함해야 합니다.

효과적인 페르소나 프롬프트는 역할(Role), 어조(Tone), 목표(Objective),
그리고 맥락(Context)의 네 가지 요소를 명시적으로 포함해야 합니다.^3^
예를 들어,

evaluation_agent의 페르소나는 단순히 \'평가자\'가 아니라, 다음과 같이
구체화되어야 합니다: \"당신은 FAANG 기업에서 15년 경력을 가진 시스템
디자인 인터뷰 전문 수석 소프트웨어 엔지니어입니다. 당신의 목표는 오직
제공된 평가 기준표(rubric)와 지원자의 답변에 근거하여 공정하고,
엄격하며, 일관된 평가를 내리는 것입니다. 당신의 어조는 전문적이고,
객관적이며, 분석적이어야 합니다.\".^4^ 이러한 구체성은 LLM이 주어진
임무에 집중하게 하여 \'역할 외(out-of-character)\' 행동을 방지하고
결과의 일관성을 높입니다.

또한, 페르소나를 정의할 때는 사적인 관계(예: 친구, 엄마)가 아닌 전문적인
역할을 부여하고, 성별 중립적인 용어를 사용하여 특정 성별과 관련된
편견이나 성능 저하를 방지하는 것이 중요합니다.^2^

### **1.2. 구조화된 출력의 중심성: 에이전트 통신의 암묵적 프로토콜** {#구조화된-출력의-중심성-에이전트-통신의-암묵적-프로토콜}

LangGraph 시스템에서 에이전트 간의 통신은 사실상 구조화된 데이터를 통해
이루어집니다. 인간은 자유 형식의 텍스트를 해석할 수 있지만, Supervisor
에이전트가 다음 행동을 결정하기 위해 비구조적인 텍스트를 안정적으로
파싱하는 것은 거의 불가능합니다. 따라서 모든 Worker 에이전트가 구조화된
출력(예: JSON)을 생성하도록 강제하는 것은 시스템 안정성을 위한 필수
요건입니다.^1^

가장 견고한 구현 방식은 LangChain의 with_structured_output 메서드를
Pydantic 모델과 결합하여 사용하는 것입니다.^9^ 이 접근법은 \"JSON으로
응답하라\"와 같은 단순한 프롬프트 지시보다 월등히 우수합니다. 왜냐하면
모델의 네이티브 도구 호출(tool-calling) 또는 JSON 모드 기능을 활용하여
스키마 준수를 보장하기 때문입니다.^12^ 개발자는 Python에서 Pydantic
모델을 정의하고 이를 LLM에 직접 전달함으로써, 타입 안전성을 확보하고
수동 파싱 및 오류 처리의 필요성을 크게 줄일 수 있습니다. 이는 시스템의
취약성을 감소시키는 결정적인 역할을 합니다.^14^

이러한 접근 방식은 프롬프트를 단순한 지시에서 에이전트 간의 명확한 API
계약(contract)으로 격상시킵니다. 한 에이전트의 구조화된 출력은 다음
에이전트가 사용할 명확한 입력이 되며, 이는 전체 워크플로우의 예측
가능성과 디버깅 용이성을 극대화합니다.

### **1.3. 복잡한 추론 유도: 사고의 사슬(Chain-of-Thought)과 소수샷 프롬프팅(Few-Shot Prompting)** {#복잡한-추론-유도-사고의-사슬chain-of-thought과-소수샷-프롬프팅few-shot-prompting}

evaluation_agent나 questioning_agent와 같이 단순한 입출력 기능을 넘어
복잡한 추론이 필요한 에이전트의 성능을 끌어올리기 위해서는 고급 프롬프팅
기법이 필수적입니다.

**사고의 사슬 (Chain-of-Thought, CoT)**: CoT는 단순히 더 나은 답변을
얻는 기술이 아니라, 에이전트의 추론 과정을 투명하게 만들어 디버깅을
가능하게 하는 중요한 도구입니다.^16^ 예를 들어,

evaluation_agent의 프롬프트는 \"첫째, 평가 기준표의 각 항목에 대해
사용자의 답변을 단계별로 분석하라. 둘째, 이 분석에 근거하여 각 기준에
대한 점수를 부여하라. 마지막으로, 이 점수들을 종합하여 최종 JSON 객체를
생성하라.\"와 같이 명시적으로 지시합니다. 이는 복잡한 평가 작업을 관리
가능한 하위 단계로 분해하여 LLM의 추론 부담을 줄이고 결과의 신뢰도를
높입니다.^16^

**소수샷 프롬프팅 (Few-Shot Prompting)**: 평가나 피드백 생성과 같이
미묘한 판단이 요구되는 작업의 경우, 소수샷 예제를 통해 원하는 결과물의
형식과 추론의 질을 명확하게 보여줄 수 있습니다.^18^

evaluation_agent의 프롬프트에는 사용자 답변, 해당 답변에 대한 CoT 분석
과정, 그리고 최종 구조화된 JSON 출력으로 구성된 2\~3개의 완전한 예제가
포함될 것입니다. 이는 제로샷(zero-shot) 지시 방식에 비해 결과의 일관성을
극적으로 향상시킵니다.^21^

이러한 기본 원칙들은 개별 에이전트의 성능을 최적화할 뿐만 아니라, 전체
시스템의 안정성과 확장성을 보장하는 기반이 됩니다. Supervisor-Worker
아키텍처의 신뢰성은 Supervisor의 지능이 아니라, 각 Worker의 \'통신
규율\'에 달려있습니다. Worker가 모호하거나 비구조적인 출력을 내놓는다면,
아무리 뛰어난 Supervisor라도 올바른 결정을 내릴 수 없습니다. 따라서 가장
중요한 프롬프트 엔지니어링 노력은 Worker 에이전트에 집중되어야 하며,
특히 엄격한 구조화된 출력을 강제하는 데 초점을 맞춰야 합니다. 이는 개발
및 테스트 전략에도 영향을 미칩니다. 각 Worker를 독립적으로 개발하고,
정의된 스키마에 따라 일관된 출력을 내놓는지 단위 테스트를 통해 검증한
후에야 Supervisor와 통합하여 전체 시스템을 테스트하는 상향식(bottom-up)
접근 방식이 복잡한 시스템의 디버깅을 훨씬 용이하게 만듭니다.

## **2. Supervisor의 \'두뇌\' 설계: 라우팅 프롬프트 아키텍처** {#supervisor의-두뇌-설계-라우팅-프롬프트-아키텍처}

Supervisor 에이전트는 AI 면접관 시스템의 중앙 신경계로서, 전체 대화의
흐름을 지휘하는 오케스트레이터입니다. 이 에이전트의 프롬프트는 단순한
지능이 아닌, 결정론적이고 회복력 있는 라우팅을 수행하도록 설계되어야
합니다.

### **2.1. Supervisor의 핵심 지시사항: 오케스트레이션 임무 정의** {#supervisor의-핵심-지시사항-오케스트레이션-임무-정의}

Supervisor의 프롬프트는 명확한 시스템 메시지로 시작하여 그 역할을
한정합니다. Supervisor는 대화 상대나 문제 해결사가 아니라, \"상태 기반
워크플로우 오케스트레이터(stateful workflow orchestrator)\" 또는 \"공장
관리자(factory manager)\"입니다.^23^ 이 에이전트의 유일한 임무는 현재

InterviewState를 분석하여 다음에 호출할 가장 적합한 Worker를 결정하는
것입니다.

프롬프트는 Supervisor가 선택할 수 있는 Worker들의 목록(members)과 각자의
명확한 책임 범위를 명시적으로 나열하여, Supervisor의 선택지를 제한된
분류 문제로 만듭니다.^24^

예시 시스템 메시지:

\"당신은 AI 기술 면접 워크플로우를 관리하는 Supervisor입니다. 당신의
유일한 임무는 사용자의 최신 메시지와 현재 대화 상태(InterviewState)를
분석하여, 다음에 작업을 수행할 Worker를 결정하는 것입니다. 당신은 직접
사용자와 대화하지 않습니다. 다음 Worker 중 하나를 선택하거나, 모든
절차가 완료되었을 때 \'FINISH\'를 선택해야 합니다.

- greeting_agent: 면접 시작 시, 사용자에게 환영 인사와 절차를
  > 안내합니다.

- questioning_agent: 기술 질문을 선택하여 사용자에게 제시합니다.

- evaluation_agent: 사용자의 답변을 평가 기준에 따라 채점합니다.

- feedback_agent: 평가 결과를 바탕으로 사용자에게 건설적인 피드백을
  > 제공합니다.

- farewell_agent: 면접이 끝났을 때 마무리 인사를 합니다.

- FINISH: 모든 면접 절차가 종료되었을 때 워크플로우를 끝냅니다.\"

### **2.2. 구조화된 도구 호출을 통한 결정론적 라우팅** {#구조화된-도구-호출을-통한-결정론적-라우팅}

Supervisor의 라우팅 신뢰성을 극대화하는 가장 견고한 방법은 LLM에게 다음
에이전트의 이름을 텍스트로 출력하도록 요청하는 대신, 라우팅 결정을 단일
필수 도구 호출(tool call)로 정의하는 것입니다. 이 방식은 모델의 함수
호출(function-calling) 기능을 활용하여 기계가 파싱할 수 있고 스키마가
보장된 라우팅 결정을 생성합니다.^12^

이를 위해 Pydantic 모델로 라우팅 스키마를 정의하고, Supervisor LLM이 이
스키마를 채우도록 강제합니다.

**Pydantic 라우팅 스키마:**

> Python

from typing import Literal  
from pydantic import BaseModel, Field  
  
\# 사용 가능한 Worker 에이전트와 FINISH 옵션을 포함하는 리터럴 타입  
WORKER_OPTIONS = Literal  
  
class Route(BaseModel):  
\"\"\"  
대화 상태를 기반으로 다음에 호출할 Worker를 선택합니다.  
\"\"\"  
next: WORKER_OPTIONS = Field(  
description=\"다음에 작업을 위임할 Worker의 이름 또는 워크플로우를
종료하기 위한 \'FINISH\'를 지정합니다.\"  
)

Supervisor의 프롬프트는 InterviewState, 특히 messages 기록과
interview_stage 플래그를 분석하여 이 Route 도구를 사용하도록
지시합니다.^25^ 이 접근법은 LLM의 환각(hallucination) 가능성을 줄이고,
출력값이 항상 유효한 Worker 이름 중 하나임을 보장하여 시스템의 예측
가능성을 크게 향상시킵니다.

### **2.3. 회복탄력성을 위한 프롬프팅: 오류 처리 프로토콜** {#회복탄력성을-위한-프롬프팅-오류-처리-프로토콜}

안정적인 시스템은 정상적인 흐름뿐만 아니라 예외적인 상황에도 대처할 수
있어야 합니다. Supervisor의 프롬프트에는 오류 처리 프로토콜이 명시적으로
포함되어야 합니다. 이를 위해 InterviewState에 error와 같은 필드를
추가하고, Supervisor가 이 필드를 감지하도록 지시합니다.

오류 처리 지시사항 예시:

\"상태 분석 시, error 필드가 존재하는지 항상 확인하십시오.

- 만약 Worker가 오류를 보고했다면, 오류 메시지를 분석하십시오.

- 오류가 일시적인 문제(예: API 타임아웃)로 판단되면, 동일한 Worker를 한
  > 번 재시도할 수 있습니다.

- 오류가 지속되거나 치명적인 문제(예: 입력 형식 오류)일 경우, 정상적인
  > 면접 흐름을 중단하고 사용자에게 문제를 알리거나 대체
  > 경로(fallback)를 수행하십시오.

- 오류 처리 후에는 상태에서 error 필드를 제거하여 무한 루프를
  > 방지하십시오.\"

이러한 명시적인 지침은 시스템의 회복탄력성을 프롬프트 수준에서 구현하여,
개별 Worker의 실패가 전체 시스템의 중단으로 이어지는 것을
방지합니다.^29^

### **표 1: Supervisor 라우팅 로직 매트릭스**

Supervisor의 복잡한 조건부 라우팅 로직을 명확하게 정의하고 LLM의 일관된
판단을 유도하기 위해, 다음의 결정 매트릭스를 프롬프트의 핵심 부분으로
활용할 수 있습니다. 이 표는 개발자에게는 명확한 사양서 역할을 하고,
LLM에게는 따라야 할 규칙의 집합 또는 소수샷 예제의 기반이 됩니다.

| 현재 interview_stage | 마지막 메시지 작성자 | current_answer 상태 | questions_asked vs question_pool | error 상태 | **결정 (next_worker_to_call)** |
|----------------------|----------------------|---------------------|----------------------------------|------------|--------------------------------|
| None                 | user                 | None                | N/A                              | None       | greeting_agent                 |
| Greeting             | greeting_agent       | None                | 아직 남음                        | None       | questioning_agent              |
| Questioning          | user                 | 채워짐              | 아직 남음                        | None       | evaluation_agent               |
| Evaluating           | evaluation_agent     | 채워짐              | 아직 남음                        | None       | feedback_agent                 |
| Feedback             | feedback_agent       | 채워짐              | 아직 남음                        | None       | questioning_agent              |
| Feedback             | feedback_agent       | 채워짐              | 모두 소진                        | None       | farewell_agent                 |
| *모든 단계*          | *모든 작성자*        | *모든 상태*         | *모든 상태*                      | 존재함     | \[오류 처리 로직\]             |
| Farewell             | farewell_agent       | *모든 상태*         | 모두 소진                        | None       | FINISH                         |

## **3. 전문가 Worker 에이전트를 위한 프롬프트 청사진** {#전문가-worker-에이전트를-위한-프롬프트-청사진}

각 Worker 에이전트는 고유한 전문성을 가지며, 이 전문성은 프롬프트를 통해
정밀하게 주입됩니다. 본 섹션에서는 5개의 Worker 에이전트 각각에 대한
완전한 프롬프트 아키텍처를 제시하며, 이는 페르소나, 핵심 지시사항, 출력
스키마 및 제약사항을 포함합니다.

### **3.1. greeting_agent & farewell_agent: 사용자 경험의 시작과 끝** {#greeting_agent-farewell_agent-사용자-경험의-시작과-끝}

이 두 에이전트는 면접의 기술적인 핵심은 아니지만, 사용자가 긍정적인
경험을 하도록 만드는 데 결정적인 역할을 합니다. 이들의 프롬프트는
전문성과 친근함의 균형을 맞추는 데 중점을 둡니다.

#### **greeting_agent 프롬프트**

- 페르소나 (Persona)  
  > \"당신은 \'InterviewerAI\'라는 이름의 친절하고 전문적이며 격려를
  > 아끼지 않는 AI 커리어 코치입니다. 당신의 목표는 지원자가 긍정적이고
  > 스트레스가 적은 환경에서 자신의 실력을 발휘할 수 있도록 돕는
  > 것입니다.\".5

- **핵심 지시사항 (Core Instructions)**

  1.  사용자를 따뜻하게 환영합니다.

  2.  면접 과정을 간결하게 설명합니다: 일련의 기술 질문을 하고, 답변을
      > 평가하며, 각 답변에 대해 피드백을 제공할 것임을 안내합니다.^32^

  3.  이 면접은 실제 평가가 아닌, 연습과 학습을 위한 기회임을 강조하여
      > 사용자를 안심시킵니다.

  4.  마지막으로, 면접을 시작할 준비가 되었는지 물어보며 대화를
      > 마무리합니다.

- **출력 스키마 및 제약사항 (Output Schema & Constraints)**

  - 출력 형식: 단순 텍스트 (문자열)

  - 제약사항: 기술적인 세부 사항이나 면접 질문에 대해서는 절대 언급하지
    > 마십시오. 당신의 역할은 오직 면접의 시작을 알리는 것입니다.

#### **farewell_agent 프롬프트**

- 페르소나 (Persona)  
  > \"당신은 \'InterviewerAI\'라는 이름의 AI 커리어 코치입니다. 당신의
  > 역할은 면접을 전문적이고 긍정적으로 마무리하는 것입니다.\"

- **핵심 지시사항 (Core Instructions)**

  1.  면접에 참여해 준 사용자의 시간에 대해 감사를 표합니다.

  2.  모든 면접 절차가 완료되었음을 간결하게 요약하여 알립니다.

  3.  사용자의 노력을 칭찬하고, 앞으로의 구직 활동에 행운을 비는 격려의
      > 말로 마무리합니다.^33^

- **출력 스키마 및 제약사항 (Output Schema & Constraints)**

  - 출력 형식: 단순 텍스트 (문자열)

  - 제약사항: InterviewState에 명시적인 지시가 없는 한, 최종 점수나 종합
    > 평가 요약을 제공하지 마십시오. 당신의 역할은 오직 작별 인사를 하는
    > 것입니다.

### **3.2. questioning_agent: 적응형 심문관** {#questioning_agent-적응형-심문관}

이 에이전트는 면접의 핵심 동력으로, 단순한 질문 선택기를 넘어 사용자의
수행 능력에 따라 동적으로 난이도를 조절하고 질문을 변형하는 지능적인
역할을 수행합니다.

- 페르소나 (Persona)  
  > \"당신은 소크라테스 방식의 적응형 기술 면접관입니다. 당신의 유일한
  > 임무는 지원자의 기술 역량을 정확하게 측정하기 위해 가장 적절한 다음
  > 질문을 선택하는 것입니다. 당신은 대화 상대가 아니며, 당신의 출력은
  > 오직 질문 텍스트 그 자체여야 합니다.\"

- **핵심 지시사항 (Core Instructions) - Agentic RAG 및 동적 난이도
  > 조절(DDA) 통합**

  1.  **상태 분석 (Analyze State):** InterviewState를 검토하여
      > questions_asked(이미 출제된 질문), question_pool(전체 질문
      > 목록), 그리고 last_evaluation(가장 최근의 평가 결과)을 주의 깊게
      > 분석합니다.

  2.  **수행 능력 평가 (Assess Performance):** last_evaluation 객체
      > 내부의 overall_score를 확인합니다. 점수 척도는 1점에서
      > 5점입니다. 4점 이상은 우수한 수행 능력, 3점 미만은 어려움을 겪고
      > 있음을 의미합니다.^34^

  3.  **질문 선택 (DDA Logic):**

      - 만약 last_evaluation이 None이라면 (첫 질문), question_pool에서
        > \'중간\' 난이도의 질문을 선택합니다.

      - 이전 점수가 높았다면(\>= 4.0), 아직 다루지 않은 새로운 주제에서
        > 더 어려운 난이도의 질문을 선택합니다.

      - 이전 점수가 낮았다면(\< 3.0), current_question과 동일한 주제
        > 내에서 더 근본적인 개념을 묻거나 더 간단하게 구성된 후속
        > 질문을 선택합니다. 이는 사용자가 좌절하지 않고 지식의 격차를
        > 메울 기회를 제공합니다.^34^

      - 이전 점수가 보통이었다면(3.0 \<= score \< 4.0), 다른 주제에서
        > 비슷한 난이도의 질문을 선택하여 지식의 폭을 측정합니다.

  4.  **질문 재구성 (Agentic RAG Logic):**

      - 질문을 제시하기 전에, InterviewState에 사용자의 프로필(예:
        > 이력서에서 추출한 기술 스택)이 있는지 확인합니다.

      - 만약 사용자의 프로필에 \'Python\'이 언급되어 있고, 선택된 질문이
        > \'자료 구조\'에 관한 것이라면, 질문을 Python에 특화되도록
        > 재구성할 수 있습니다. 예를 들어, \"해시맵에 대해
        > 설명하시오\"라는 일반적인 질문을 \"Python의
        > 딕셔너리(dictionary)가 어떻게 작동하는지, 그리고 그 기반이
        > 되는 해시맵 구현에 대해 설명하시오\"와 같이 구체화합니다.^37^

- **출력 스키마 및 제약사항 (Output Schema & Constraints)**

  - 출력 형식: 단순 텍스트 (문자열)

  - 제약사항: 질문 외에 어떠한 인사말이나 부가 설명도 포함하지 마십시오.

### **3.3. evaluation_agent: 객관적인 평가자** {#evaluation_agent-객관적인-평가자}

이 에이전트의 성공은 감정이나 주관성을 완전히 배제하고, 주어진 규칙에
따라 기계적인 정밀함으로 작동하는 능력에 달려 있습니다.

- 페르소나 (Persona)  
  > \"당신은 극도로 엄격하고 객관적인 평가 엔진입니다. 당신은 의견을
  > 가지지 않습니다. 당신은 제공된 평가 기준표(rubric)를 완벽한
  > 일관성으로 따릅니다. 당신의 유일한 기능은 지원자의 답변을 질문의
  > 의도 및 평가 기준표와 비교 분석하여 구조화된 JSON 평가 결과를
  > 생성하는 것입니다. 친근하거나 대화적인 태도를 보여서는 안 됩니다.\"

- **핵심 지시사항 (Core Instructions)**

  1.  입력으로 current_question(현재 질문), current_answer(사용자 답변),
      > 그리고 상세한 evaluation_rubric(평가 기준표)을 받게 됩니다.

  2.  **사고의 사슬 (Chain of Thought):** 최종 출력을 생성하기 전에,
      > 먼저 비공개적으로 단계별 분석을 수행하십시오. 평가 기준표의 각
      > 항목에 대해, 사용자 답변이 해당 기준의 정의를 어떻게 충족하거나
      > 미달하는지 명시적으로 비교 분석하고, 답변의 특정 부분을 근거로
      > 인용하십시오.^16^

  3.  **점수 부여 (Scoring):** 내부 분석이 끝나면, 각 평가 기준에 대해
      > 1점(미흡)부터 5점(우수)까지의 정수 점수를 부여하십시오.

  4.  **최종 출력 (Final Output):** EvaluationResult JSON 객체 형식에
      > 맞춰, 각 기준별 점수와 해당 점수에 대한 간결한 요약 근거를 채워
      > 넣으십시오. 이 근거는 당신의 비공개 분석 내용을 압축한 것이어야
      > 합니다. JSON 스키마를 엄격하게 준수해야 합니다.^12^

- **출력 스키마 (Pydantic Model)**  
  > Python  
  > from typing import List  
  > from pydantic import BaseModel, Field  
  >   
  > class CriterionEvaluation(BaseModel):  
  > criterion: str = Field(description=\"평가 기준의 이름 (예: \'정확성
  > 및 기술적 깊이\').\")  
  > score: int = Field(description=\"해당 기준에 대한 1(미흡)에서
  > 5(우수) 사이의 점수.\")  
  > reasoning: str = Field(description=\"점수에 대한 간결한 근거. 답변
  > 내용에서 직접적인 증거를 인용해야 함.\")  
  >   
  > class EvaluationResult(BaseModel):  
  > overall_score: float = Field(description=\"모든 기준의 가중 평균
  > 점수.\")  
  > evaluations: List\[CriterionEvaluation\] = Field(description=\"각
  > 기준별 평가 결과 목록.\")  
  > is_sufficient: bool = Field(description=\"답변이 최소 요구 수준(예:
  > 전체 점수 3.0 이상)을 충족했는지 여부.\")

이 구조화된 접근 방식은 평가 과정을 투명하고, 일관되며, 기계가 읽을 수
있도록 만들어, feedback_agent나 questioning_agent와 같은 다운스트림
에이전트가 이 데이터를 안정적으로 활용할 수 있게 합니다.

### **표 2: 기술 면접 평가 기준표 (Evaluation Rubric)**

이 기준표는 evaluation_agent의 핵심 두뇌 역할을 합니다. 명시적이고
상세한 기준표를 프롬프트에 직접 포함함으로써, LLM이 모호한 \'좋음/나쁨\'
판단에서 벗어나 일관되고 정의된 표준에 따라 평가하도록 강제합니다. 이는
공정하고 반복 가능한 평가를 달성하기 위한 핵심 장치입니다.^41^

| 기준 (Criterion)                                 | 1: 미흡 (Poor)                                                                 | 3: 보통 (Average)                                                                                                  | 5: 우수 (Excellent)                                                                                                                          |
|--------------------------------------------------|--------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| **문제 이해도 (Problem Comprehension)**          | 질문의 핵심을 오해했거나 다른 문제에 대해 답변함.                              | 질문의 주된 목표는 이해했으나, 핵심 제약 조건이나 엣지 케이스를 놓침.                                              | 질문에 담긴 명시적, 암묵적 요구사항과 엣지 케이스까지 깊고 미묘하게 이해했음을 보여줌.                                                       |
| **정확성 및 기술적 깊이 (Correctness & Depth)**  | 제안된 해결책에 근본적인 결함이 있거나, 작동하지 않음. 피상적인 답변을 제공함. | 전반적인 접근 방식은 맞지만, 중요한 버그나 논리적 오류, 부정확한 내용이 포함됨. 대안이나 트레이드오프 분석이 없음. | 기술적으로 정확하고 견고하며 엣지 케이스를 적절히 처리함. 선택한 해결책의 시간/공간 복잡도를 분석하고 대안과 비교하며 트레이드오프를 설명함. |
| **명확성 및 의사소통 (Clarity & Communication)** | 설명이 혼란스럽고 따라가기 어려우며, 부정확한 용어를 사용하거나 구조가 없음.   | 설명은 이해 가능하지만, 체계적이지 않거나 장황하고 정밀함이 부족할 수 있음.                                        | 설명이 명확하고, 간결하며, 잘 구조화되어 있고, 정확한 기술 용어를 효과적으로 사용함.                                                         |
| **구체적인 근거 및 예시 (Evidence & Examples)**  | 주장을 뒷받침할 근거가 전혀 없거나 관련 없는 예시를 사용함.                    | 일반적인 수준의 근거를 제시하지만, 주장을 완전히 뒷받침하기에는 불충분하거나 구체성이 떨어짐.                      | 자신의 주장을 뒷받침하기 위해 구체적이고 적절한 코드 예시나 실제 사례를 들어 설득력 있게 설명함.                                             |

### **3.4. feedback_agent: 건설적인 코치** {#feedback_agent-건설적인-코치}

이 에이전트는 evaluation_agent가 생성한 차가운 데이터를 사용자가
학습하고 성장하는 데 도움이 되는 따뜻하고 건설적인 조언으로 변환하는
역할을 합니다.

- 페르소나 (Persona)  
  > \"당신은 전문 AI 교육 조교입니다. 당신의 목표는 건설적이고, 격려가
  > 되며, 교육적인 피드백을 제공하는 것입니다. 당신은 절대 비판적이거나
  > 판단적인 태도를 취하지 않습니다. 당신의 어조는 지지적이며 사용자의
  > 학습을 돕는 데 초점을 맞춥니다.\".3

- **핵심 지시사항 (Core Instructions)**

  1.  입력으로 구조화된 EvaluationResult 객체를 받습니다.

  2.  단순히 점수를 반복해서는 안 됩니다. 당신의 임무는 이 구조화된
      > 데이터를 자연스럽고 유용한 산문으로 번역하는 것입니다.

  3.  가장 높은 점수를 받은 기준의 reasoning을 사용하여 핵심 강점을 먼저
      > 강조하십시오. 예: \"특히\... 부분에 대한 설명은 매우
      > 훌륭했습니다.\"

  4.  다음으로, 가장 낮은 점수를 받은 기준의 reasoning을 사용하여 개선이
      > 필요한 주요 영역을 지적하십시오. 건설적인 방식으로 표현해야
      > 합니다. 예: \"다음 번에 조금 더 집중해볼 부분은\...입니다. 예를
      > 들어, 답변에서 X라고 언급하셨는데, Y와 같은 접근 방식이 더
      > 최적일 수 있습니다. 그 이유는\...\".^44^

  5.  피드백은 간결하게 유지하고, 한두 가지 핵심적인 내용에 집중하여
      > 사용자가 압도당하지 않도록 하십시오.

  6.  만약 사용자의 답변이 불충분했다면, 피드백에 대해 사용자가 명확한
      > 질문을 하도록 유도할 수 있습니다. 예: \"방금 설명해 드린
      > 트레이드오프에 대한 부분이 이해가 되시나요?\".^45^

- **출력 스키마 및 제약사항 (Output Schema & Constraints)**

  - 출력 형식: 단순 텍스트 (문자열)

  - 제약사항: 평가 점수를 직접적으로 노출하지 마십시오. 긍정적인 강화와
    > 실행 가능한 조언에 집중하십시오.

이러한 역할 분리는 시스템의 견고성과 사용자 경험 모두를 향상시키는
핵심적인 설계 결정입니다. evaluation_agent는 객관적인 데이터 생성에만
집중하여 평가의 신뢰도를 높이고, feedback_agent는 그 데이터를 인간적인
소통으로 변환하여 교육적 가치를 극대화합니다. 만약 하나의 에이전트가
\"엄격하면서도 친절한 평가\"라는 모순된 목표를 가지게 되면, 두 가지 임무
모두에서 성능이 저하될 수 있습니다. 이처럼 역할을 분리함으로써 각
에이전트의 프롬프트를 충돌 없는 단일 목표에 최적화할 수 있습니다. 더
나아가, 이는 시스템의 투명성과 신뢰성을 높이는 결과로 이어집니다.
사용자가 피드백에 의문을 제기할 경우, feedback_agent의 대화적 표현 뒤에
있는 evaluation_agent의 원시적이고 구조화된 평가 데이터를 검토함으로써,
시스템의 핵심 판단 근거를 투명하게 확인할 수 있습니다.

## **4. 결론** {#결론}

본 보고서에서 제안된 AI 면접관 챗봇의 에이전트 프롬프트 아키텍처는 초기
설계안에 명시된 **모듈성, 확장성, 유연성**의 원칙을 충실히 구현하기 위한
구체적인 청사진을 제공합니다. Supervisor-Worker 패턴을 기반으로 각
에이전트의 역할을 명확히 분리하고, 이들의 상호작용을 구조화된 데이터와
정밀한 프롬프트를 통해 제어함으로써 복잡한 면접 시나리오를 안정적으로
관리할 수 있습니다.

주요 설계 원칙과 그 효과는 다음과 같이 요약할 수 있습니다.

1.  **엄격한 역할 분담과 페르소나 주입**: 각 Worker 에이전트에게 좁고
    > 명확한 전문가 페르소나를 부여함으로써, LLM이 주어진 임무에
    > 집중하고 예측 가능한 행동을 하도록 강제합니다. 이는
    > evaluation_agent의 객관성과 feedback_agent의 공감 능력을 동시에
    > 극대화하는 등, 상충될 수 있는 목표를 가진 작업들을 효과적으로
    > 분리하여 전체 시스템의 성능을 향상시킵니다.

2.  **구조화된 출력을 통한 통신 프로토콜 확립**: Pydantic 모델과
    > with_structured_output을 활용하여 에이전트 간의 모든 통신을
    > 구조화된 JSON으로 표준화했습니다. 이는 에이전트 간의 API 계약처럼
    > 작동하여, Supervisor가 상태를 안정적으로 파싱하고 다음 단계를
    > 결정론적으로 라우팅할 수 있게 하는 시스템 안정성의 핵심
    > 요소입니다.

3.  **고급 프롬프팅 기법의 전략적 통합**: questioning_agent에는 동적
    > 난이도 조절(DDA)과 Agentic RAG 로직을, evaluation_agent에는 사고의
    > 사슬(CoT)과 상세한 평가 기준표(Rubric)를 통합하여 단순한 챗봇을
    > 넘어 지능적인 상호작용이 가능한 시스템을 구현했습니다. 이는 면접의
    > 질을 높이고 사용자에게 맞춤화된 경험을 제공하는 데 기여합니다.

4.  **확장성을 고려한 모듈식 설계**: 각 에이전트의 프롬프트와 기능이
    > 독립적으로 정의되어 있어, 향후 코딩 테스트 채점 에이전트나 문화
    > 적합성 질문 에이전트와 같은 새로운 기능을 추가할 때 기존 시스템에
    > 미치는 영향을 최소화할 수 있습니다. 새로운 Worker를 정의하고
    > Supervisor의 라우팅 규칙에 추가하는 것만으로도 시스템 확장이
    > 용이합니다.

결론적으로, 본 프롬프트 아키텍처는 LangGraph의 강력한 제어 흐름 관리
능력과 현대적인 프롬프트 엔지니어링 기법을 결합하여, 복잡하고 동적인 AI
면접 시나리오를 효과적으로 처리할 수 있는 견고하고 유연하며 확장 가능한
기반을 마련합니다. 이 설계안은 성공적인 AI 면접관 챗봇 구현을 위한
핵심적인 기술 지침이 될 것입니다.

#### 참고 자료

1.  AI Agent best practices from one year as AI Engineer : r/AI_Agents -
    > Reddit, 7월 15, 2025에 액세스,
    > [[https://www.reddit.com/r/AI_Agents/comments/1lpj771/ai_agent_best_practices_from_one_year_as_ai/]{.underline}](https://www.reddit.com/r/AI_Agents/comments/1lpj771/ai_agent_best_practices_from_one_year_as_ai/)

2.  Role Prompting: Guide LLMs with Persona-Based Tasks - Learn
    > Prompting, 7월 15, 2025에 액세스,
    > [[https://learnprompting.org/docs/advanced/zero_shot/role_prompting]{.underline}](https://learnprompting.org/docs/advanced/zero_shot/role_prompting)

3.  Mastering Persona Prompts: A Guide to Leveraging Role-Playing in
    > LLM-Based Applications like ChatGPT or Google Gemini - Ankit
    > Kumar, 7월 15, 2025에 액세스,
    > [[https://architectak.medium.com/mastering-persona-prompts-a-guide-to-leveraging-role-playing-in-llm-based-applications-1059c8b4de08]{.underline}](https://architectak.medium.com/mastering-persona-prompts-a-guide-to-leveraging-role-playing-in-llm-based-applications-1059c8b4de08)

4.  Mastering role prompting: How to get the best responses from LLMs -
    > Portkey, 7월 15, 2025에 액세스,
    > [[https://portkey.ai/blog/role-prompting-for-llms]{.underline}](https://portkey.ai/blog/role-prompting-for-llms)

5.  Best ChatGPT Prompts: Persona Examples \[2024\] - Team-GPT, 7월 15,
    > 2025에 액세스,
    > [[https://team-gpt.com/blog/best-chatgpt-prompts-persona-examples/]{.underline}](https://team-gpt.com/blog/best-chatgpt-prompts-persona-examples/)

6.  Collection of ChatGPT persona prompts : r/ChatGPTPro - Reddit, 7월
    > 15, 2025에 액세스,
    > [[https://www.reddit.com/r/ChatGPTPro/comments/11v04tw/collection_of_chatgpt_persona_prompts/]{.underline}](https://www.reddit.com/r/ChatGPTPro/comments/11v04tw/collection_of_chatgpt_persona_prompts/)

7.  Agent architectures - GitHub Pages, 7월 15, 2025에 액세스,
    > [[https://langchain-ai.github.io/langgraph/concepts/agentic_concepts/]{.underline}](https://langchain-ai.github.io/langgraph/concepts/agentic_concepts/)

8.  Prompting for Structured Outputs ! - YouTube, 7월 15, 2025에 액세스,
    > [[https://www.youtube.com/watch?v=fmBu51tlMJw]{.underline}](https://www.youtube.com/watch?v=fmBu51tlMJw)

9.  LangChain: Structured Outputs from LLM - Kaggle, 7월 15, 2025에
    > 액세스,
    > [[https://www.kaggle.com/code/ksmooi/langchain-structured-outputs-from-llm]{.underline}](https://www.kaggle.com/code/ksmooi/langchain-structured-outputs-from-llm)

10. Structured outputs - ️ LangChain, 7월 15, 2025에 액세스,
    > [[https://python.langchain.com/docs/concepts/structured_outputs/]{.underline}](https://python.langchain.com/docs/concepts/structured_outputs/)

11. How to return structured data from a model \| 🦜️ LangChain, 7월 15,
    > 2025에 액세스,
    > [[https://python.langchain.com/docs/how_to/structured_output/]{.underline}](https://python.langchain.com/docs/how_to/structured_output/)

12. Structured Outputs - OpenAI API, 7월 15, 2025에 액세스,
    > [[https://platform.openai.com/docs/guides/structured-outputs]{.underline}](https://platform.openai.com/docs/guides/structured-outputs)

13. Mastering Structured Output in LLMs 1: JSON output with LangChain -
    > Medium, 7월 15, 2025에 액세스,
    > [[https://medium.com/@docherty/mastering-structured-output-in-llms-choosing-the-right-model-for-json-output-with-langchain-be29fb6f6675]{.underline}](https://medium.com/@docherty/mastering-structured-output-in-llms-choosing-the-right-model-for-json-output-with-langchain-be29fb6f6675)

14. Crafting Structured {JSON} Responses: Ensuring Consistent Output
    > from any LLM - DEV Community, 7월 15, 2025에 액세스,
    > [[https://dev.to/rishabdugar/crafting-structured-json-responses-ensuring-consistent-output-from-any-llm-l9h]{.underline}](https://dev.to/rishabdugar/crafting-structured-json-responses-ensuring-consistent-output-from-any-llm-l9h)

15. Cannot reproduce example about using with_structured_output with a
    > Pydantic class on AzureChatOpenAI \#27912 - GitHub, 7월 15, 2025에
    > 액세스,
    > [[https://github.com/langchain-ai/langchain/discussions/27912]{.underline}](https://github.com/langchain-ai/langchain/discussions/27912)

16. Chain-of-thought prompting 101 - K2view, 7월 15, 2025에 액세스,
    > [[https://www.k2view.com/blog/chain-of-thought-prompting/]{.underline}](https://www.k2view.com/blog/chain-of-thought-prompting/)

17. Chain of Thought Prompting: Enhance AI Reasoning & LLMs - Future
    > AGI, 7월 15, 2025에 액세스,
    > [[https://futureagi.com/blogs/chain-of-thought-prompting-ai-2025]{.underline}](https://futureagi.com/blogs/chain-of-thought-prompting-ai-2025)

18. Few Shot Prompting - What It Is, How To Use It, And Examples -
    > Addlly AI, 7월 15, 2025에 액세스,
    > [[https://addlly.ai/blog/few-shot-prompting/]{.underline}](https://addlly.ai/blog/few-shot-prompting/)

19. What is few shot prompting? - IBM, 7월 15, 2025에 액세스,
    > [[https://www.ibm.com/think/topics/few-shot-prompting]{.underline}](https://www.ibm.com/think/topics/few-shot-prompting)

20. Zero-Shot, One-Shot, and Few-Shot Prompting, 7월 15, 2025에 액세스,
    > [[https://learnprompting.org/docs/basics/few_shot]{.underline}](https://learnprompting.org/docs/basics/few_shot)

21. The Few Shot Prompting Guide - PromptHub, 7월 15, 2025에 액세스,
    > [[https://www.prompthub.us/blog/the-few-shot-prompting-guide]{.underline}](https://www.prompthub.us/blog/the-few-shot-prompting-guide)

22. Master Prompting Concepts: Zero-Shot and Few-Shot Prompting, 7월 15,
    > 2025에 액세스,
    > [[https://promptengineering.org/master-prompting-concepts-zero-shot-and-few-shot-prompting/]{.underline}](https://promptengineering.org/master-prompting-concepts-zero-shot-and-few-shot-prompting/)

23. Langgraph Supervisior Agent Workflow Simplified \| by Amanatullah \|
    > The Deep Hub, 7월 15, 2025에 액세스,
    > [[https://medium.com/thedeephub/langgraph-supervisior-agent-workflow-simplified-1aaf68b97072]{.underline}](https://medium.com/thedeephub/langgraph-supervisior-agent-workflow-simplified-1aaf68b97072)

24. Building Multi-Agent Systems with LangGraph-Supervisor - DEV
    > Community, 7월 15, 2025에 액세스,
    > [[https://dev.to/sreeni5018/building-multi-agent-systems-with-langgraph-supervisor-138i]{.underline}](https://dev.to/sreeni5018/building-multi-agent-systems-with-langgraph-supervisor-138i)

25. Supervision - LangGraph, 7월 15, 2025에 액세스,
    > [[https://www.baihezi.com/mirrors/langgraph/tutorials/multi_agent/agent_supervisor/index.html]{.underline}](https://www.baihezi.com/mirrors/langgraph/tutorials/multi_agent/agent_supervisor/index.html)

26. AI Agent Routing: Tutorial & Best Practices, 7월 15, 2025에 액세스,
    > [[https://www.patronus.ai/ai-agent-development/ai-agent-routing]{.underline}](https://www.patronus.ai/ai-agent-development/ai-agent-routing)

27. LangGraph Multi-Agent Systems - Overview, 7월 15, 2025에 액세스,
    > [[https://langchain-ai.github.io/langgraph/concepts/multi_agent/]{.underline}](https://langchain-ai.github.io/langgraph/concepts/multi_agent/)

28. Doing More with Less -- Implementing Routing Strategies in Large
    > Language Model-Based Systems: An Extended Survey - arXiv, 7월 15,
    > 2025에 액세스,
    > [[https://arxiv.org/html/2502.00409v1]{.underline}](https://arxiv.org/html/2502.00409v1)

29. How and when to build multi-agent systems - LangChain Blog, 7월 15,
    > 2025에 액세스,
    > [[https://blog.langchain.com/how-and-when-to-build-multi-agent-systems/]{.underline}](https://blog.langchain.com/how-and-when-to-build-multi-agent-systems/)

30. Understanding the LangGraph Multi-Agent Supervisor \| by akansha
    > khandelwal - Medium, 7월 15, 2025에 액세스,
    > [[https://medium.com/@khandelwal.akansha/understanding-the-langgraph-multi-agent-supervisor-00fa1be4341b]{.underline}](https://medium.com/@khandelwal.akansha/understanding-the-langgraph-multi-agent-supervisor-00fa1be4341b)

31. Error handling for LangChain/LangGraph? - Reddit, 7월 15, 2025에
    > 액세스,
    > [[https://www.reddit.com/r/LangChain/comments/1k3vyky/error_handling_for_langchainlanggraph/]{.underline}](https://www.reddit.com/r/LangChain/comments/1k3vyky/error_handling_for_langchainlanggraph/)

32. How to Write AI Prompts for Customer Service (With Examples) -
    > Talkative, 7월 15, 2025에 액세스,
    > [[https://gettalkative.com/info/ai-prompts-for-customer-service]{.underline}](https://gettalkative.com/info/ai-prompts-for-customer-service)

33. Bot Persona Prompt Examples, 7월 15, 2025에 액세스,
    > [[https://docs.yourgpt.ai/chatbot/prompts/example/]{.underline}](https://docs.yourgpt.ai/chatbot/prompts/example/)

34. Designing a Large Language Model-Based AI System for Dynamic
    > Difficulty Adjustment in Digital Games, 7월 15, 2025에 액세스,
    > [[https://cdn.istanbul.edu.tr/file/JTA6CLJ8T5/76CC4D20C0554255BFB8A81D7C236D9B]{.underline}](https://cdn.istanbul.edu.tr/file/JTA6CLJ8T5/76CC4D20C0554255BFB8A81D7C236D9B)

35. Enhancing Graph Of Thought: Enhancing Prompts with LLM Rationales
    > and Dynamic Temperature Control \| OpenReview, 7월 15, 2025에
    > 액세스,
    > [[https://openreview.net/forum?id=l32IrJtpOP]{.underline}](https://openreview.net/forum?id=l32IrJtpOP)

36. Large Language Models and Dynamic Difficulty Adjustment: An
    > Integration Perspective, 7월 15, 2025에 액세스,
    > [[https://sol.sbc.org.br/index.php/sbgames_estendido/article/download/32000/31802/]{.underline}](https://sol.sbc.org.br/index.php/sbgames_estendido/article/download/32000/31802/)

37. What is Agentic RAG? \| IBM, 7월 15, 2025에 액세스,
    > [[https://www.ibm.com/think/topics/agentic-rag]{.underline}](https://www.ibm.com/think/topics/agentic-rag)

38. What is Agentic AI? A Practical Guide - K2view, 7월 15, 2025에
    > 액세스,
    > [[https://www.k2view.com/what-is-agentic-rag/]{.underline}](https://www.k2view.com/what-is-agentic-rag/)

39. Putting People in LLMs\' Shoes: Generating Better Answers via
    > Question Rewriter - arXiv, 7월 15, 2025에 액세스,
    > [[https://arxiv.org/html/2408.10573v2]{.underline}](https://arxiv.org/html/2408.10573v2)

40. Conversational User-AI Intervention: A Study on Prompt Rewriting for
    > Improved LLM Response Generation - arXiv, 7월 15, 2025에 액세스,
    > [[https://arxiv.org/html/2503.16789v1]{.underline}](https://arxiv.org/html/2503.16789v1)

41. Top 50 Prompt Engineering Interview Questions and Answers \| by
    > Sanjay Kumar PhD, 7월 15, 2025에 액세스,
    > [[https://skphd.medium.com/top-50-prompt-engineering-interview-questions-and-answers-7ee3f694ffe8]{.underline}](https://skphd.medium.com/top-50-prompt-engineering-interview-questions-and-answers-7ee3f694ffe8)

42. How do I grade student responses to writing prompts? - Freckle -
    > Renaissance Learning, 7월 15, 2025에 액세스,
    > [[https://frecklehelp.renaissance.com/hc/en-us/articles/10540928865691-How-do-I-grade-student-responses-to-writing-prompts]{.underline}](https://frecklehelp.renaissance.com/hc/en-us/articles/10540928865691-How-do-I-grade-student-responses-to-writing-prompts)

43. Writing an Assignment Prompt and Rubric - UAGC Writing Center, 7월
    > 15, 2025에 액세스,
    > [[https://writingcenter.uagc.edu/writing-assignment-prompt-and-rubric]{.underline}](https://writingcenter.uagc.edu/writing-assignment-prompt-and-rubric)

44. Behavioral Interview Questions for Prompt Engineering - Yardstick,
    > 7월 15, 2025에 액세스,
    > [[https://www.yardstick.team/interview-questions/prompt-engineering]{.underline}](https://www.yardstick.team/interview-questions/prompt-engineering)

45. milvus.io, 7월 15, 2025에 액세스,
    > [[https://milvus.io/ai-quick-reference/how-can-an-llm-be-guided-to-ask-a-followup-question-when-the-retrieved-information-is-insufficient-think-in-terms-of-conversational-rag-or-an-agent-that-can-perform-multiple-retrievethenread-cycles#:\~:text=To%20guide%20a%20large%20language,content%20and%20triggers%20clarification%20requests.]{.underline}](https://milvus.io/ai-quick-reference/how-can-an-llm-be-guided-to-ask-a-followup-question-when-the-retrieved-information-is-insufficient-think-in-terms-of-conversational-rag-or-an-agent-that-can-perform-multiple-retrievethenread-cycles#:~:text=To%20guide%20a%20large%20language,content%20and%20triggers%20clarification%20requests.)

46. Learning to Ask: When LLMs Meet Unclear Instruction - arXiv, 7월 15,
    > 2025에 액세스,
    > [[https://arxiv.org/html/2409.00557v2]{.underline}](https://arxiv.org/html/2409.00557v2)

47. How to prompt a chatbot to be curious and ask follow-up questions? -
    > Reddit, 7월 15, 2025에 액세스,
    > [[https://www.reddit.com/r/PromptEngineering/comments/1kqdi03/how_to_prompt_a_chatbot_to_be_curious_and_ask/]{.underline}](https://www.reddit.com/r/PromptEngineering/comments/1kqdi03/how_to_prompt_a_chatbot_to_be_curious_and_ask/)
