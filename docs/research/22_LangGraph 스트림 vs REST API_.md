# **대화형 AI 에이전트를 위한 아키텍처 패러다임: LangGraph.js를 활용한 WebSocket 및 REST API 구현 방식 비교 분석** {#대화형-ai-에이전트를-위한-아키텍처-패러다임-langgraph.js를-활용한-websocket-및-rest-api-구현-방식-비교-분석}

## **섹션 1: AI 에이전트 오케스트레이션의 기초 개념**

정교한 AI 에이전트 애플리케이션을 구축하기 위해서는 기반 기술에 대한
명확한 이해가 선행되어야 합니다. 본 섹션에서는 LangGraph, REST,
WebSocket이라는 세 가지 핵심 기술의 근본적인 원칙과 특성을 심도 있게
분석하여, 이후 이어질 아키텍처 비교 분석의 토대를 마련하고자 합니다. 각
기술의 본질을 파악하는 것은 이들을 조합했을 때 발생하는 시너지와
아키텍처적 마찰을 이해하는 데 필수적입니다.

### **1.1 LangGraph 패러다임: 상태 기반 에이전트의 오케스트레이션** {#langgraph-패러다임-상태-기반-에이전트의-오케스트레이션}

LangGraph는 LangChain이 개발한 오픈 소스 AI 에이전트 프레임워크로,
복잡한 생성형 AI 에이전트 워크플로우를 구축, 배포 및 관리하기 위해
설계되었습니다.^1^ LangGraph의 핵심은 단순한 순차적 호출의 연속이
아니라, 복잡한 추론과 행동의 순환(loop)을 모델링하는 상태
기반(stateful)의 순환 그래프(cyclical graph)를 구축하는 데 있습니다.^2^
이는 \"장기 실행되는 상태 기반 워크플로우(long-running, stateful
workflow)\"를 위한 프레임워크라는 정의로 요약될 수 있습니다.^4^

#### **StateGraph와 상태의 중심성**

LangGraph의 가장 기본적인 구성 요소는 StateGraph이며, 이는 각
노드(node)를 거치며 전달되고 업데이트되는 상태 객체(state object)에 의해
정의됩니다.^5^ 이 상태는 에이전트의 \"메모리 뱅크\" 또는 \"디지털
노트북\"과 같은 역할을 수행하며, 그래프가 실행되는 동안 처리된 모든 가치
있는 정보를 기록하고 추적합니다.^2^ 각 노드의 역할은 현재 상태를
입력받아 연산을 수행하고, 그 결과로 상태를 업데이트하는 것입니다. 이러한
상태 기반의 접근 방식은 LangGraph를 정의하는 가장 중요한 특징이며, 이전
단계의 정보를 유지하여 계산이 진행됨에 따라 연속적이고 맥락에 맞는 정보
처리를 가능하게 합니다.

#### **노드와 엣지**

LangGraph에서 노드는 AI 워크플로우 내의 개별 구성 요소 또는 에이전트를
나타냅니다.^2^ 노드는 LLM 호출, 도구 실행, 사용자 입력 수신 등 구체적인
계산 단계를 의미합니다. 반면, 엣지(edge)는 노드 간의 흐름과 논리를
정의합니다. 특히 조건부 엣지(conditional edge)는 이전 노드의 출력에 따라
다음에 실행될 노드를 동적으로 결정함으로써, \"에이전트 런타임에
필수적인\" 순환 구조를 가능하게 합니다.^2^ 이러한 구조는 개발자에게 제어
가능한 인지 아키텍처(controllable cognitive architecture)를 제공하여,
단일 에이전트, 다중 에이전트, 계층적, 순차적 등 다양한 제어 흐름을
설계할 수 있게 합니다.^7^

이처럼 LangGraph는 본질적으로 상태를 유지하며 연속적으로 실행되는
프로세스를 위해 설계되었습니다. 이러한 근본적인 설계 철학은 어떤 통신
프로토콜과 결합되느냐에 따라 그 잠재력이 극대화되거나 제약될 수 있으며,
이는 아키텍처 선택의 핵심적인 고려 사항이 됩니다.

### **1.2 RESTful 접근 방식: 무상태 요청-응답** {#restful-접근-방식-무상태-요청-응답}

REST(Representational State Transfer)는 웹 서비스를 구축하기 위한
아키텍처 스타일 중 하나로, 표준 HTTP 동사(GET, POST, PUT, DELETE 등)를
사용하여 자원(resource)을 조작합니다.^8^ REST의 가장 중요한 철학적
기반은 바로 무상태성(statelessness)입니다.

#### **무상태성**

REST 아키텍처에서 클라이언트가 서버로 보내는 각 요청은 이전 요청과
완전히 독립적이며, 요청을 처리하는 데 필요한 모든 정보를 자체적으로
포함해야 합니다.^8^ 서버는 여러 요청에 걸쳐 클라이언트의 세션 상태를
유지하지 않습니다. 이 특성은 REST의 확장성을 보장하는 핵심 요소로, 로드
밸런서 뒤에 있는 어떤 서버 인스턴스라도 특정 클라이언트의 요청을 처리할
수 있게 만들어 수평적 확장을 용이하게 합니다.^11^

#### **통신 모델**

REST의 통신 모델은 클라이언트가 요청을 보내고 서버가 응답하는
단방향(client-initiated) 동기식(synchronous) 모델을 엄격하게
따릅니다.^8^ 서버가 클라이언트에게 먼저 데이터를 푸시(push)할 수 있는
내장된 메커니즘이 존재하지 않으며, 모든 통신은 클라이언트의 요청으로
시작되어야 합니다.

이러한 특성은 LangGraph의 상태 기반 실행 모델과 근본적인 아키텍처적
불일치를 야기합니다. REST의 무상태성은 LangGraph가 유지하려는 연속적인
상태 흐름을 단절시키며, 이는 2장에서 논의될 여러 가지 기술적 과제의
원인이 됩니다.

### **1.3 WebSocket 접근 방식: 상태 기반 양방향 통신** {#websocket-접근-방식-상태-기반-양방향-통신}

WebSocket(ws) 프로토콜은 단일 TCP 연결을 통해 영구적이고
전이중(full-duplex), 즉 양방향 통신 채널을 제공하기 위해
설계되었습니다.^8^ 이는 REST와는 근본적으로 다른 통신 패러다임을
제시합니다.

#### **상태 기반 연결**

REST와 달리, WebSocket 연결은 최초의 HTTP 핸드셰이크를 통해 한 번만
설정되며, 이후 세션이 지속되는 동안 계속 열려 있습니다. 이를 통해
클라이언트와 서버는 연결이 유지되는 동안 상태를 기억하고 추적할 수
있습니다.^8^ 이 상태 기반 연결은 LangGraph의 상태 유지 요구사항과
자연스럽게 부합합니다.

#### **실시간 및 저지연성**

WebSocket은 반복적인 HTTP 핸드셰이크와 헤더 전송의 오버헤드를
제거함으로써, 채팅, 온라인 게임, 실시간 금융 데이터 피드와 같은 저지연
실시간 애플리케이션에 최적화되어 있습니다.^8^ 서버는 클라이언트의 요청
없이도 언제든지 데이터를 클라이언트로 푸시할 수 있어, 진정한 의미의
실시간 상호작용을 구현할 수 있습니다.

결론적으로, WebSocket의 상태 기반, 영구적, 양방향 통신 특성은 장기
실행되는 대화형 에이전트의 요구사항을 정확히 반영하므로, LangGraph의
자연스러운 아키텍처 파트너로 자리매김합니다.

애플리케이션의 아키텍처를 선택하는 것은 단순히 전송 계층을 결정하는
문제를 넘어, 애플리케이션의 \*시간적 본질(temporal nature)\*을 정의하는
근본적인 선택입니다. REST는 각 상호작용을 개별적이고 원자적인
트랜잭션으로 취급합니다. 반면, WebSocket은 전체 사용자 세션을 단일하고
연속적인 대화로 간주합니다. LangGraph가 \"장기 실행되는 상태 기반
에이전트\" ^4^를 위해 설계되었다는 점을 고려할 때, 그 본질은 WebSocket의
연속적인 대화 모델과 훨씬 더 깊은 수준에서 공명합니다. LangGraph
에이전트의 실행은 생각, 도구 호출, 관찰, 새로운 생각 등 여러 단계를 거쳐
시간에 따라 전개되는 하나의 프로세스입니다. 무상태적인 REST API는 이
연속적인 프로세스를

/invoke, /get_status, /get_result와 같은 일련의 단절된 요청으로
분해하여, 매 상호작용마다 애플리케이션이 컨텍스트를 다시 설정하도록
강요합니다. 반면, 영구적인 WebSocket 연결은 에이전트 실행의 전체 기간에
직접 매핑되는 안정적인 채널을 제공합니다. 즉, \'연결\' 자체가 \'실행\'의
컨텍스트가 됩니다. 따라서 프로토콜 선택은 개발자가 에이전트의 작업을
일련의 독립적인 과업(REST)으로 볼 것인지, 아니면 하나의 일관된
프로세스(WebSocket)로 볼 것인지를 결정하며, 후자가 LangGraph의 설계
의도를 더 정확하게 반영합니다.

## **섹션 2: REST 기반 아키텍처: \"블랙박스\" 에이전트**

전통적인 REST API를 통해 LangGraph 에이전트를 노출하는 방식은 구현의
단순성 때문에 매력적으로 보일 수 있습니다. 그러나 이 아키텍처는
LangGraph가 제공하는 대화형 기능과 투명성의 잠재력을 대부분 제한하며,
에이전트를 사용자가 내부를 들여다볼 수 없는 \"블랙박스\"로 만듭니다. 본
섹션에서는 REST 기반 아키텍처의 구현 방식, 기능적 한계, 그리고 이것이
사용자 경험에 미치는 영향을 상세히 분석합니다.

### **2.1 시스템 아키텍처 및 데이터 흐름** {#시스템-아키텍처-및-데이터-흐름}

REST 기반 LangGraph 애플리케이션의 일반적인 아키텍처는 클라이언트, 로드
밸런서, Express.js와 같은 웹 프레임워크로 구성된 애플리케이션 서버,
그리고 상태 저장을 위한 별도의 영속성 계층(예: PostgreSQL, Redis)으로
구성됩니다. 이 구조에서 데이터 흐름은 본질적으로 비동기적이며
폴링(polling)에 의존합니다.

**데이터 흐름:**

1.  **호출 (Invoke):** 클라이언트는 초기 입력을 담아 서버의 POST /invoke
    > 엔드포인트로 요청을 보냅니다.

2.  **비동기 작업 시작:** 서버는 요청을 받고 LangGraph의 app.invoke()
    > 메서드를 호출하여 에이전트 실행을 시작합니다.^14^ 이 작업은
    > 비동기적으로 백그라운드에서 실행되는 장기 실행 프로세스입니다.

3.  **즉각적인 응답:** 서버는 작업을 시작했다는 의미로 202 Accepted 상태
    > 코드와 함께 고유한 thread_id를 즉시 클라이언트에게 반환합니다.

4.  **상태 영속화:** LangGraph 프로세스는 백그라운드에서 실행되며, 각
    > 단계(step)가 끝날 때마다 현재 상태를 반드시 영속성 계층에 저장해야
    > 합니다. 이는 LangGraph의 Checkpointer를 통해 이루어집니다. REST는
    > 무상태(stateless)이므로, 요청 간에 상태를 유지할 방법이 없어 외부
    > 저장소에 의존할 수밖에 없습니다.

5.  **상태 폴링 (Polling):** 클라이언트는 앞서 받은 thread_id를 사용하여
    > GET /state/:thread_id 엔드포인트를 주기적으로(예: 1-2초마다)
    > 호출하여 작업의 진행 상태를 확인해야 합니다.

6.  **상태 조회 및 반환:** 서버는 폴링 요청을 받을 때마다 영속성
    > 계층에서 해당 thread_id의 최신 상태를 조회하여 클라이언트에게
    > 반환합니다.

7.  **종료 확인:** 클라이언트는 폴링을 통해 받은 상태 정보에 그래프가
    > END 노드에 도달했음을 나타내는 표시가 있을 때까지 이 과정을
    > 반복합니다.

이러한 폴링 기반 아키텍처는 REST의 근본적인 한계에서 비롯됩니다. 서버가
클라이언트에게 능동적으로 데이터를 푸시할 수 없기 때문에, 클라이언트가
지속적으로 서버의 상태를 확인해야만 하는 구조입니다.

### **2.2 TypeScript 구현 패턴 (Express.js)** {#typescript-구현-패턴-express.js}

TypeScript와 Express.js를 사용하여 REST 기반 서버를 구축하는 패턴은
다음과 같이 개념적으로 구현될 수 있습니다.

#### **서버 측 코드 (express.ts)** {#서버-측-코드-express.ts}

서버는 /invoke와 /state/:thread_id 두 개의 주요 엔드포인트를 구현해야
합니다. 상태를 요청 간에 유지하기 위해 MemorySaver와 같은 인메모리
Checkpointer나, 프로덕션 환경에서는 데이터베이스와 연동된 Checkpointer를
사용해야 합니다.

> TypeScript

// express-server.ts  
import express from \'express\';  
import { StateGraph } from \'@langchain/langgraph\';  
import { MemorySaver } from \'@langchain/langgraph/memory\';  
import { v4 as uuidv4 } from \'uuid\';  
  
//\... \[6\]  
// const workflow = new StateGraph(AgentState)\...  
  
const checkpointer = new MemorySaver();  
const app = workflow.compile({ checkpointer });  
  
const server = express();  
server.use(express.json());  
  
// 1. Invoke Endpoint  
server.post(\'/invoke\', async (req, res) =\> {  
const { input } = req.body;  
const threadId = uuidv4();  
  
// Start the graph execution in the background, but don\'t wait for
it.  
app.invoke({ messages: \[new HumanMessage(input)\] }, { configurable: {
thread_id: threadId } });  
  
// Immediately respond with the thread_id  
res.status(202).json({ thread_id: threadId });  
});  
  
// 2. State Polling Endpoint  
server.get(\'/state/:thread_id\', async (req, res) =\> {  
const { thread_id } = req.params;  
  
try {  
const currentState = await app.getState({ configurable: { thread_id }
});  
if (currentState) {  
res.status(200).json(currentState);  
} else {  
res.status(404).json({ error: \'Thread not found\' });  
}  
} catch (e) {  
res.status(500).json({ error: \'Failed to retrieve state\' });  
}  
});  
  
server.listen(8080, () =\> {  
console.log(\'REST server listening on port 8080\');  
});

#### **클라이언트 측 코드**

클라이언트(예: React, Vue)는 invoke를 호출한 후, setInterval이나
재귀적인 setTimeout을 사용하여 state 엔드포인트를 폴링해야 합니다.

> TypeScript

// client.ts  
async function startAgent(prompt: string) {  
const invokeResponse = await fetch(\'http://localhost:8080/invoke\', {  
method: \'POST\',  
headers: { \'Content-Type\': \'application/json\' },  
body: JSON.stringify({ input: prompt }),  
});  
  
const { thread_id } = await invokeResponse.json();  
console.log(\`Agent started with thread_id: \${thread_id}\`);  
  
// Start polling for the result  
const pollInterval = setInterval(async () =\> {  
const stateResponse = await
fetch(\`http://localhost:8080/state/\${thread_id}\`);  
  
if (stateResponse.status === 200) {  
const state = await stateResponse.json();  
console.log(\'Current state:\', state.values);  
  
// Check for the end condition (e.g., the final message is present)  
const finalMessage =
state.values.messages\[state.values.messages.length - 1\];  
if (finalMessage.type === \'ai\' && state.next.length === 0) { //
Assuming empty \'next\' means END  
console.log(\'Agent finished. Final answer:\', finalMessage.content);  
clearInterval(pollInterval);  
}  
} else {  
console.error(\'Polling failed.\');  
clearInterval(pollInterval);  
}  
}, 2000); // Poll every 2 seconds  
}

### **2.3 기능적 역량 및 사용자 경험** {#기능적-역량-및-사용자-경험}

이 아키텍처는 특정 유스케이스에는 적합하지만, 대화형 AI 에이전트가
추구하는 경험과는 거리가 멉니다.

#### **비동기 작업 실행**

REST 기반 접근 방식은 \"실행 후 잊어버리는(fire-and-forget)\" 형태의
비동기 작업에 가장 적합합니다.^15^ 예를 들어, \"시장 조사 보고서를
생성해줘\"와 같이 사용자가 작업을 시작시킨 후 최종 결과물만 받으면 되는
경우에 유용합니다. 클라이언트는 작업 ID를 받아두고 나중에 결과를
확인하러 오면 됩니다.

#### **\"블랙박스\" 효과**

이 아키텍처의 가장 큰 단점은 사용자에게 에이전트의 처리 과정을 전혀
보여주지 못한다는 점입니다. 사용자는 로딩 스피너를 보다가, 어느 순간
최종 결과물을 받게 됩니다. 그 사이에 일어나는 도구 호출, LLM의 추론
과정, 오류 수정과 같은 중간 단계들은 완전히 가려집니다.^16^ 이는
에이전트의 상태를 투명하게 보여주도록 설계된 LangGraph의 철학 ^2^과
정면으로 배치됩니다. 사용자는 에이전트가 \"왜\" 그런 결론에 도달했는지
전혀 알 수 없으며, 이는 신뢰도 하락으로 이어질 수 있습니다.

#### **불편한 인간 개입(Human-in-the-Loop, HITL)**

HITL 기능을 구현하는 것은 REST 아키텍처에서 매우 비효율적이고
복잡합니다. 그래프가 인간의 입력을 기다리는 지점에서 멈추고, 그 상태를
데이터베이스에 저장해야 합니다. 클라이언트는 폴링을 통해 \"인간 입력
필요\"라는 상태를 확인하고, UI에 입력 필드를 표시합니다. 사용자가 입력을
제출하면, 클라이언트는 또 다른 POST /resume/:thread_id와 같은
엔드포인트로 요청을 보내야 합니다. 이 모든 과정은 지연 시간이 길고, 상태
관리가 복잡하며, 사용자 경험을 심각하게 저해합니다.

REST 아키텍처를 선택하는 것은 HTTP의 무상태성과 LangGraph의 상태 기반
모델 사이의 간극을 메우기 위해 개발자에게 상당한 부담을 지우는
결정입니다. LangGraph의 StateGraph는 한 단계에서 다음 단계로 상태가
원활하게 전달될 것을 요구합니다.^5^ 그러나 REST API 호출은 상태를
저장하지 않으므로 ^10^, 여러 REST 상호작용에 걸쳐 다단계 그래프를
실행하려면 상태가 반드시 서버 메모리 외부로 이전되어야 합니다. 이는 결국
PostgreSQL이나 Redis와 같은 데이터베이스에 의해 지원되는 Checkpointer의
사용을 강제합니다.^7^ 개발자는 이제 이 데이터베이스를 설정, 관리,
확장해야 하는 추가적인 책임을 지게 됩니다. 이는 아키텍처 복잡성과 잠재적
장애 지점을 증가시키는 요인입니다.

더욱 실질적인 제약은 LangChain의 공식 배포 라이브러리인 langserve가 현재
LangGraph를 지원하지 않는다는 점입니다.^14^

langserve는 Runnable 객체를 REST API로 배포하기 위해 설계되었지만,
문서에서는 명시적으로 \"현재 LangGraph와 통합되지 않는다\"고 밝히고
있습니다.^14^ 이는 REST 경로를 선택한 개발자가 표준화된 배포 도구를
사용할 수 없으며, Express.js와 같은 프레임워크를 사용하여 자신만의 REST
래퍼를 처음부터 구축해야 함을 의미합니다. 이는 개발 노력을 증가시키고
LangChain 생태계가 권장하는 경로에서 벗어나게 만듭니다. 이로 인해 REST
아키텍처는 LangGraph의 잠재력을 완전히 발휘하지 못하는, 제한적인
\"블랙박스\" 에이전트를 만드는 데 그치게 됩니다.

## **섹션 3: WebSocket 기반 아키텍처: \"글래스박스\" 에이전트**

WebSocket 기반 아키텍처는 LangGraph의 실시간성, 투명성, 그리고
상호작용성을 온전히 구현하여, 에이전트의 내부 작동을 들여다볼 수 있는
\"글래스박스(Glass Box)\"를 제공합니다. 이 접근 방식은 LangGraph의 설계
철학과 완벽하게 부합하며, 사용자에게 역동적이고 몰입감 있는 경험을
선사합니다. 본 섹션에서는 WebSocket 아키텍처가 어떻게 LangGraph의
잠재력을 최대한 발휘하게 하는지 상세히 탐구합니다.

### **3.1 시스템 아키텍처 및 데이터 흐름** {#시스템-아키텍처-및-데이터-흐름-1}

WebSocket 기반 시스템의 아키텍처는 클라이언트가 서버의 ws:// 또는 wss://
엔드포인트와 영구적인 연결을 설정하는 것을 중심으로 구성됩니다. 이
구조에서도 내구성을 위해 영속성 계층(Checkpointer)이 존재할 수 있지만,
실시간 통신 흐름 자체는 이 계층에 직접 의존하지 않습니다.

**데이터 흐름:**

1.  **연결 설정:** 클라이언트는 서버의 WebSocket 엔드포인트에 연결을
    > 요청하여 단일의 영구적인 통신 채널을 설정합니다.

2.  **호출 메시지 전송:** 클라이언트는 초기 입력을 담은 \"invoke\"
    > 메시지를 설정된 소켓을 통해 서버로 전송합니다.

3.  **스트리밍 시작:** 서버는 해당 클라이언트 연결에서 메시지를
    > 수신하고, LangGraph의 app.astream() 또는 app.streamEvents()
    > 메서드를 호출하여 스트리밍을 시작합니다.^16^

4.  **실시간 청크(Chunk) 처리:** 서버는 async for\...of 루프에 진입하여
    > astream()이 생성하는 각 데이터 청크(chunk)를 반복 처리합니다.

5.  **데이터 푸시:** 서버는 스트림에서 생성된 각 청크를 지체 없이 해당
    > 클라이언트의 열린 WebSocket 연결을 통해 즉시 전달(push)합니다.

6.  **실시간 UI 업데이트:** 클라이언트의 onmessage 이벤트 핸들러는
    > 서버로부터 실시간으로 청크를 수신하고, 이를 파싱하여 UI를
    > 즉각적으로 업데이트합니다. 이 연결은 그래프 실행이 종료되거나
    > 사용자가 연결을 끊을 때까지 유지됩니다.

이 모델은 폴링의 필요성을 완전히 제거하고, 서버가 주도하여 데이터를
푸시함으로써 진정한 실시간 상호작용을 가능하게 합니다.

### **3.2 LangGraph 스트리밍 잠재력의 극대화: astream과 streamMode** {#langgraph-스트리밍-잠재력의-극대화-astream과-streammode}

WebSocket 아키텍처의 핵심은 LangGraph가 제공하는 astream() 메서드와 그
옵션인 streamMode 매개변수를 활용하는 것입니다.^19^ 이

streamMode는 \"글래스박스\"가 어떤 정보를, 얼마나 상세하게 보여줄지를
결정하는 제어판과 같습니다. 개발자는 각 모드가 제공하는 데이터의 종류와
구조를 정확히 이해함으로써 특정 UI 기능을 구현할 수 있습니다.

이 강력하지만 복잡할 수 있는 API를 명확히 이해하기 위해, 각 스트리밍
모드의 특성과 활용 사례를 다음 표에 정리했습니다. 이 표는 여러 문서에
흩어져 있는 정보 ^19^를 통합하여 개발자에게 직접적이고 실행 가능한
가이드를 제공합니다. 예를 들어, \"현재 어떤 도구가 실행 중인지
보여주기\"나 \"LLM의 최종 답변을 토큰 단위로 스트리밍하기\"와 같은
기능을 구현하려면 어떤 스트림에서 필요한 데이터를 얻을 수 있는지 알아야
합니다. 이 표는 각

streamMode를 산출되는 데이터 구조, 목적, 그리고 이를 통해 구현 가능한 UI
기능과 직접 연결하여 그 가치를 극대화합니다.

#### **표 1: LangGraph.js 스트리밍 모드 상세 분석** {#표-1-langgraph.js-스트리밍-모드-상세-분석}

| streamMode         | 산출되는 청크 데이터 구조  | 설명 및 목적                                                                                                                                             | 구현 가능한 기능 예시                                                                                                                      |
|--------------------|----------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| **updates**        | { \[nodeName\]: update }   | 각 노드가 실행을 완료할 때 반환하는 상태의 \*변경분(delta)\*만을 스트리밍합니다. 무엇이 방금 일어났는지에 초점을 맞춘 효율적인 방식입니다.^19^           | **에이전트 경로 시각화:** \"현재 \'search\' 도구 실행 중\...\", \"도구 \'search\'가 결과를 반환했습니다.\"와 같은 실시간 상태 메시지 표시. |
| **values**         | {\...fullState}            | 각 단계 이후의 *전체* 상태 객체를 스트리밍합니다. 포괄적이지만 데이터 양이 많을 수 있습니다. 전체 컨텍스트가 필요한 디버깅이나 특정 UI에 유용합니다.^19^ | **상태 검사기 UI:** 디버깅을 위해 그래프의 전체 상태를 실시간으로 보여주는 개발자용 패널.                                                  |
| **messages**       | AIMessageChunk             | 상태에 새로운 AIMessage가 추가될 때, 그 내용을 토큰 단위로 스트리밍합니다. 채팅과 같은 사용자 경험에 완벽하게 부합합니다.^19^                            | **\"ChatGPT 스타일\" 타이핑 효과:** 에이전트의 최종 답변을 단어 단위로 점진적으로 렌더링.                                                  |
| **debug / events** | { event, name, data,\... } | 가장 상세한 모드. on_llm_start, on_tool_end 등 기저의 LangChain 프리미티브에서 발생하는 세분화된 생명주기 이벤트를 스트리밍합니다.^20^                   | **고급 관찰 가능성(Observability):** LangSmith와 유사하게, 애플리케이션 UI 내에서 전체 실행 과정을 단계별로 상세히 기록하는 로그.          |

### **3.3 고급 실시간 기능 구현** {#고급-실시간-기능-구현}

WebSocket과 LangGraph의 스트리밍 기능을 결합하면 REST 아키텍처에서는
구현하기 어렵거나 불가능한 다양한 고급 기능을 실현할 수 있습니다.

#### **에이전트 경로 시각화**

streamMode: \"updates\"를 사용하면, UI는 수신되는 청크를 기반으로
에이전트의 행동 흐름을 실시간으로 사용자에게 보여줄 수 있습니다. 예를
들어, \"생각 중\...\", \"도구 tavily_search_results_json 호출 중\...\",
\"도구 출력 처리 중\...\", \"최종 답변 생성 중.\"과 같은 메시지를
순차적으로 표시하여 사용자가 에이전트의 작업 과정을 이해하고 신뢰하게
만들 수 있습니다.^7^

#### **토큰 단위 생성**

streamMode: \"messages\"를 활용하면, UI는 AIMessageChunk.content를
지속적으로 화면에 추가하여 친숙한 스트리밍 텍스트 효과를 만들어냅니다.
이는 사용자가 느끼는 체감 지연 시간을 극적으로 줄여주어 사용자 경험을
크게 향상시킵니다.^20^

#### **원활한 인간 개입 (HITL)**

영구적인 WebSocket 연결은 HITL을 매우 우아하게 만듭니다. 그래프가 인간의
입력을 필요로 하는 노드에 도달하면, 실행은 자연스럽게 대기 상태에
들어갑니다. 서버는 소켓을 통해 { \"type\": \"human_input_required\",
\"prompt\": \"\...\" }와 같은 특정 이벤트를 클라이언트로 보냅니다.
클라이언트는 이 프롬프트를 사용자에게 표시하고, 사용자의 답변을 *동일한
소켓*을 통해 다시 서버로 전송합니다. 서버는 이 응답을 그래프의 상태에
주입하여 실행을 재개합니다. 이는 REST의 폴링 기반 접근 방식보다 훨씬
우수한 사용자 경험을 제공합니다.^725^

### **3.4 TypeScript 구현 패턴 (Express.js + ws 라이브러리)** {#typescript-구현-패턴-express.js-ws-라이브러리}

Express.js와 ws 라이브러리를 사용한 WebSocket 서버의 TypeScript 구현
예시는 다음과 같습니다.

#### **서버 측 코드 (server.ts)** {#서버-측-코드-server.ts}

서버는 WebSocket 연결을 관리하고, 들어오는 메시지에 따라 LangGraph
스트림을 시작하며, 생성된 청크를 해당 클라이언트로 다시 전송하는 역할을
합니다.^26^

> TypeScript

// websocket-server.ts  
import express from \'express\';  
import http from \'http\';  
import { WebSocketServer, WebSocket } from \'ws\';  
import { StateGraph } from \'@langchain/langgraph\';  
//\... (AgentState, nodes, workflow definition)  
  
const appGraph = workflow.compile();  
  
const server = http.createServer(express());  
const wss = new WebSocketServer({ server });  
  
wss.on(\'connection\', (ws: WebSocket) =\> {  
console.log(\'Client connected\');  
  
ws.on(\'message\', async (message: string) =\> {  
try {  
const { input, thread_id } = JSON.parse(message);  
  
// Use multiple stream modes to power a rich UI  
const stream = appGraph.stream(  
{ messages: \[new HumanMessage(input)\] },  
{  
configurable: { thread_id },  
streamMode: \[\"updates\", \"messages\"\]  
}  
);  
  
for await (const chunk of stream) {  
// Send each chunk to the client as it arrives  
ws.send(JSON.stringify(chunk));  
}  
  
// Signal the end of the stream  
ws.send(JSON.stringify({ event: \'end\' }));  
  
} catch (error) {  
console.error(\'Error processing message:\', error);  
ws.send(JSON.stringify({ error: \'An error occurred\' }));  
}  
});  
  
ws.on(\'close\', () =\> {  
console.log(\'Client disconnected\');  
});  
});  
  
server.listen(8080, () =\> {  
console.log(\'WebSocket server listening on port 8080\');  
});

#### **클라이언트 측 코드**

프론트엔드에서는 네이티브 WebSocket API를 사용하여 서버에 연결하고,
메시지를 보내고, onmessage 이벤트 리스너를 통해 실시간으로 들어오는
데이터를 처리합니다.

> TypeScript

// client.ts  
const socket = new WebSocket(\'ws://localhost:8080\');  
  
socket.onopen = () =\> {  
console.log(\'Connected to WebSocket server\');  
};  
  
function sendPrompt(prompt: string) {  
if (socket.readyState === WebSocket.OPEN) {  
const payload = {  
input: prompt,  
thread_id: \'some-unique-session-id\' // Manage session ID  
};  
socket.send(JSON.stringify(payload));  
}  
}  
  
socket.onmessage = (event) =\> {  
const chunk = JSON.parse(event.data);  
  
if (chunk.event === \'end\') {  
console.log(\'Stream finished.\');  
return;  
}  
  
if (chunk.messages) { // From \'messages\' streamMode  
// This is an AIMessageChunk, update the chat UI  
// Example: updateChatWindow(chunk.messages.content);  
console.log(\'Message chunk:\', chunk.messages.content);  
} else if (Object.keys(chunk)!== \'messages\') { // From \'updates\'
streamMode  
// This is a node update, update the status UI  
// Example: updateStatusPanel(\`Running node:
\${Object.keys(chunk)}\`);  
console.log(\'Update chunk:\', chunk);  
}  
};  
  
socket.onclose = () =\> {  
console.log(\'Disconnected from WebSocket server\');  
};

다양한 streamMode 옵션들은 상호 배타적인 것이 아니라, 풍부하고 다층적인
\"생성형 UI(Generative UI)\"를 구축하기 위한 조합 가능한 도구들입니다.
정교한 애플리케이션은 인터페이스의 여러 부분을 구동하기 위해 여러 스트림
유형을 동시에 소비할 가능성이 높습니다. 예를 들어, 사용자 인터페이스에
메인 채팅 창, \"상태\" 패널, 개발자 로그가 있다고 가정해 봅시다. 메인
채팅 창은 토큰 단위로 스트리밍되는 최종 답변이 필요하므로 streamMode:
\"messages\"가 완벽한 선택입니다. \"상태\" 패널은 에이전트의 현재 상위
수준 작업(예: \"웹 검색 중\...\")을 표시해야 하므로 streamMode:
\"updates\"가 이상적입니다. 개발자 로그는 모든 단일 이벤트에 대한 매우
상세한 추적이 필요하므로 streamMode: \"debug\"가 적합합니다. LangGraph는
여러 모드를 한 번에 스트리밍하는 것을 허용하며(streamMode:
\[\"messages\", \"updates\"\]) ^22^, 서버는 이 태그된 청크들을 수신하여
클라이언트로 라우팅할 수 있습니다. 그러면 클라이언트는 청크의

mode에 따라 다른 핸들러를 사용하여 다른 UI 구성 요소를 업데이트할 수
있습니다. 따라서 streamMode 기능은 단순히 한 가지 유형의 출력을 선택하는
것이 아니라, 에이전트의 복잡한 내부 프로세스를 개별적이고 소비 가능한
데이터 스트림으로 분해하여 포괄적이고 상호작용적인 사용자 경험으로
재조립할 수 있는 강력한 메커니즘입니다.

## **섹션 4: 비교 분석 및 의사결정 프레임워크**

지금까지의 분석을 바탕으로, REST와 WebSocket 아키텍처를 직접 비교하고,
특정 프로젝트 요구사항에 따라 최적의 경로를 선택할 수 있도록 명확한
의사결정 프레임워크를 제공합니다. 이 섹션은 두 접근 방식의 장단점을
종합하여 기술 리더가 정보에 입각한 아키텍처 결정을 내리는 데 도움을 주는
것을 목표로 합니다.

### **4.1 기능적 역량 매트릭스** {#기능적-역량-매트릭스}

두 아키텍처의 핵심적인 차이점을 한눈에 파악할 수 있도록 기능적,
아키텍처적 비교 매트릭스를 제시합니다. 이 표는 보고서 전체의 내용을
압축한 요약본으로, 기술 리더가 아키텍처 선택을 정당화하는 데 사용할 수
있는 핵심적인 자료입니다. 이는 \"기능상의 차이점\"에 대한 사용자의
근본적인 질문에 직접적으로 답합니다.

#### **표 2: 아키텍처 및 기능 비교 매트릭스**

| 기능 / 차원                  | LangGraph + REST API                                  | LangGraph + WebSocket                                  | 근거 및 핵심 자료                                                                                                                                    |
|------------------------------|-------------------------------------------------------|--------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| **실시간 UI 업데이트**       | **나쁨** (폴링 필요, 높은 지연 시간)                  | **우수** (서버 푸시, 낮은 지연 시간)                   | WebSocket은 실시간 통신을 위해 설계되었으며 ^11^, REST는 폴링과 같은 우회적인 방법이 필요합니다.^8^                                                  |
| **중간 단계 가시성**         | **없음** (\"블랙박스\")                               | **우수** (\"글래스박스\")                              | WebSocket은 에이전트의 추론과 행동을 실시간으로 스트리밍하여 투명성을 제공합니다.^7^ REST는 최종 결과만 제공합니다.                                  |
| **지연 시간 프로파일**       | **높음** (요청당 오버헤드)                            | **낮음** (영구 연결)                                   | WebSocket은 반복적인 HTTP 핸드셰이크와 헤더를 제거하여 오버헤드를 줄입니다.^8^                                                                       |
| **상태 동기화**              | **복잡함** (외부 DB 및 Checkpointer 필요)             | **단순함** (세션 내 상태가 연결에 귀속)                | REST는 무상태이므로 ^10^ 외부 상태 관리를 강제합니다. WebSocket은 상태 기반이므로 ^8^ LangGraph의 본질과 부합합니다.^2^                              |
| **구현 복잡성 (클라이언트)** | **단순함** (표준 fetch 호출 + 폴링 로직)              | **중간** (WebSocket 생명주기 관리)                     | 클라이언트는 WebSocket의 onopen, onmessage, onclose, onerror 이벤트를 처리해야 합니다.                                                               |
| **구현 복잡성 (서버)**       | **중간** (커스텀 REST 래퍼 및 DB 통합 필요)           | **중간** (WS 서버 및 연결 관리 필요)                   | langserve는 LangGraph를 지원하지 않으므로 ^14^ 양쪽 모두 커스텀 서버 코드가 필요합니다. WebSocket은 상태 기반 연결로 인해 더 복잡할 수 있습니다.^28^ |
| **확장성 모델**              | **단순함** (무상태 수평 확장)                         | **복잡함** (상태 기반 연결, \"스티키 세션\")           | REST의 무상태성은 로드 밸런싱을 단순하게 만듭니다.^8^ WebSocket은 상태 기반 연결을 확장하기 위해 신중한 인프라 설계가 필요합니다.^28^                |
| **인간 개입(HITL) 적합성**   | **매우 나쁨** (비효율적, 높은 지연 시간, 복잡한 흐름) | **우수** (원활함, 낮은 지연 시간, 자연스러운 상호작용) | 양방향 WebSocket 채널은 사용자 입력으로 실행을 일시 중지하고 재개하는 데 이상적입니다.^25^                                                           |

### **4.2 확장성, 보안, 인프라 트레이드오프** {#확장성-보안-인프라-트레이드오프}

아키텍처 선택은 기능적 측면을 넘어 운영 및 인프라에 대한 깊은 고려를
필요로 합니다.

#### **확장성**

REST의 무상태 특성은 단순한 로드 밸런서 뒤에서 수평적으로 쉽게 확장할 수
있다는 큰 장점을 가집니다.^8^ 어떤 서버 인스턴스든 들어오는 요청을
처리할 수 있기 때문입니다. 반면, WebSocket의 확장은 훨씬 더 복잡합니다.
각 연결은 상태를 유지하므로, 특정 클라이언트의 모든 메시지가 동일한 서버
인스턴스로 라우팅되도록 보장해야 합니다. 이를 위해 \"스티키 세션(sticky
sessions)\"을 지원하는 로드 밸런서나, Redis Pub/Sub과 같은
백플레인(backplane)을 사용하여 모든 서버 인스턴스가 메시지를
브로드캐스트하고 올바른 클라이언트에게 전달할 수 있도록 하는 아키텍처가
필요합니다.^28^ 이는 상당한 인프라 복잡성을 추가하는 요인입니다.

#### **보안**

REST API는 OAuth, 헤더의 JWT 토큰 등 성숙하고 잘 알려진 HTTP 보안 패턴을
활용할 수 있습니다.^30^ WebSocket 보안은 초기 핸드셰이크 과정에서 인증을
신중하게 처리해야 합니다. 예를 들어, 업그레이드 요청 시 쿼리 파라미터나
쿠키를 통해 인증 토큰을 전달하고 서버에서 검증하는 방식이 일반적입니다.
또한, 다른 사이트에서 악의적인 연결을 시도하는 것을 막기 위해

Origin 헤더를 검증하는 것이 필수적입니다.^31^ 두 아키텍처 모두 프로덕션
환경에서는 반드시 암호화된 통신(

https 및 wss)을 사용해야 합니다.

### **4.3 오류 처리 및 복원력** {#오류-처리-및-복원력}

애플리케이션의 안정성은 오류를 어떻게 처리하고 복구하는지에 달려
있습니다.

#### **REST**

REST에서 오류는 요청별로 처리되며, 표준 HTTP 상태 코드(예: 400 Bad
Request, 500 Internal Server Error)를 통해 전달됩니다. 만약 장기 실행
작업이 백그라운드에서 실패하면, 클라이언트는 다음 폴링 요청을 보낼
때까지 실패 사실을 알 수 없습니다. 이는 오류 발견과 사용자에게 알리는
과정에 지연을 발생시킵니다.

#### **WebSocket**

WebSocket에서는 연결 자체가 실패할 수 있으며, 이 경우 클라이언트 측에서
자동으로 재연결을 시도하는 로직이 필요합니다.^30^ LangGraph 내부에서
발생하는 오류(예: 도구 호출 실패)는 노드 내에서

try\...catch 블록으로 처리될 수 있습니다.^32^ 이렇게 처리된 오류는
스트림을 통해 특정 오류 메시지(예:

{ \"type\": \"error\", \"message\": \"Tool execution failed\" })로
클라이언트에 실시간으로 전파될 수 있습니다. 이를 통해 UI는 사용자에게 더
즉각적이고 우아하게 오류 상황을 알릴 수 있습니다. 스트림 자체가 오류를
발생시키며 종료될 수도 있으며, 이는 서버의 async for 루프에서
try\...catch로 감싸 처리해야 합니다.

### **4.4 하이브리드 아키텍처: 실용적인 프로덕션 접근 방식** {#하이브리드-아키텍처-실용적인-프로덕션-접근-방식}

실제 프로덕션 애플리케이션에서는 순수한 REST나 순수한 WebSocket
아키텍처보다는 두 가지를 혼합한 하이브리드 모델이 가장 실용적이고 강력한
해결책이 될 수 있습니다. 이는 각 기술의 강점을 극대화하고 약점을
보완하는 접근 방식입니다.

#### **REST의 역할**

- **상태 비저장(Stateless) 작업:** 사용자 인증(POST /login), 이전 대화
  > 목록 조회(GET /threads), 사용자 프로필 관리(PUT /profile)와 같은
  > 전형적인 CRUD(Create, Read, Update, Delete) 작업에 REST를
  > 사용합니다. 이러한 작업들은 REST가 가장 잘 처리하는 영역입니다.^11^

#### **WebSocket의 역할**

- **핵심 대화형 에이전트 세션:** 사용자가 인증을 마치고 실제 대화
  > 페이지에 진입하면, WebSocket 연결을 설정합니다. 이후의 모든 실시간
  > 대화, 에이전트의 추론 과정 스트리밍, HITL 상호작용은 이 WebSocket
  > 연결을 통해 이루어집니다. 이는 \"글래스박스\"의 모든 이점을 활용하는
  > 방법입니다.

이 하이브리드 모델은 \"적재적소에 올바른 도구를 사용한다\"는 엔지니어링
원칙을 따릅니다. 이를 통해 확장성이 필요한 부분은 REST로 처리하고,
고도의 상호작용성이 필요한 부분은 WebSocket으로 처리하여, 견고하고 확장
가능하며 기능이 풍부한 애플리케이션을 구축할 수 있습니다.

## **섹션 5: 권장 사항 및 결론**

본 보고서는 LangGraph.js를 기반으로 한 AI 에이전트 애플리케이션 구축 시
REST API와 WebSocket이라는 두 가지 주요 아키텍처 패러다임을 심층적으로
분석했습니다. 분석 결과를 바탕으로, 아키텍트와 개발자가 자신의
프로젝트에 가장 적합한 경로를 선택할 수 있도록 명확한 의사결정
프레임워크와 최종 권장 사항을 제시합니다.

### **5.1 의사결정 프레임워크: 당신의 경로 선택하기** {#의사결정-프레임워크-당신의-경로-선택하기}

어떤 아키텍처를 선택할지는 애플리케이션의 핵심 요구사항과 목표 사용자
경험에 따라 결정되어야 합니다. 다음 프레임워크는 이러한 결정을 돕기 위해
설계되었습니다.

#### **LangGraph + REST API 아키텍처를 선택해야 하는 경우:** {#langgraph-rest-api-아키텍처를-선택해야-하는-경우}

- **애플리케이션이 비대화형 백엔드 프로세스일 때:** 예를 들어, 매일 밤
  > 특정 주제에 대한 보고서를 생성하여 저장하는 시스템과 같이 사용자와의
  > 실시간 상호작용이 필요 없는 경우에 적합합니다.

- **에이전트의 최종 결과물만이 가치가 있을 때:** 중간 과정의 투명성이나
  > 추론 과정에 대한 가시성 없이, 완성된 결과만 필요한 경우 이
  > 아키텍처로 충분합니다.

- **사용자 경험이 \"제출 후 대기\" 모델을 허용할 때:** 사용자가 요청을
  > 제출하고, 상당한 시간이 지난 후에 결과를 확인하는 비동기 작업 흐름이
  > 비즈니스 요구사항에 부합하는 경우 선택할 수 있습니다.

- **운영 전문성이 단순한 무상태 서비스에 집중되어 있을 때:** 팀이
  > 영구적인 연결을 관리하는 복잡성을 피하고, 기존의 수평적으로 확장
  > 가능한 무상태 서비스 운영 경험을 활용하고자 할 때 실용적인 선택이 될
  > 수 있습니다.

#### **LangGraph + WebSocket 아키텍처를 선택해야 하는 경우:** {#langgraph-websocket-아키텍처를-선택해야-하는-경우}

- **애플리케이션이 사용자와 직접 상호작용할 때:** 챗봇, 대화형 연구
  > 보조원, 코딩 코파일럿 등 사용자와의 실시간 대화가 핵심인 모든
  > 애플리케이션에 필수적입니다.

- **에이전트의 추론 과정에 대한 투명성이 필요할 때:** 사용자가
  > 에이전트의 \"생각의 흐름\"을 보고 신뢰를 구축해야 하는 경우,
  > WebSocket을 통한 중간 단계 스트리밍은 매우 효과적입니다.

- **저지연의 \"ChatGPT와 같은\" 사용자 경험이 최우선 순위일 때:** 체감
  > 속도를 극대화하고 사용자의 몰입감을 높이는 것이 중요한 경쟁력인
  > 경우, WebSocket은 대체 불가능한 선택입니다.

- **인간 개입(Human-in-the-Loop, HITL)이 핵심 기능일 때:** 에이전트가
  > 작업 도중 사용자의 확인이나 추가 정보를 필요로 하는 기능을 원활하게
  > 구현하고자 할 때, WebSocket의 양방향 통신은 가장 자연스럽고 효율적인
  > 해결책을 제공합니다.

- **에이전트의 상태에 실시간으로 반응하는 \"생성형 UI\"를 구축할 때:**
  > 에이전트의 내부 상태 변화에 따라 동적으로 변화하는 UI를 만들고자
  > 한다면, WebSocket을 통한 상태 스트리밍이 필수적입니다.

### **5.2 최종 결론** {#최종-결론}

본 분석을 통해 내린 최종 결론은 다음과 같습니다. REST API는 기술적으로
LangGraph 에이전트를 노출시킬 수는 있지만, 이는 LangGraph의 본질적인
역량을 근본적으로 제약하는 결과를 낳습니다. REST 아키텍처는 동적이고
투명한 프로세스를 정적이고 불투명한 \"블랙박스\"로 변질시키며,
LangGraph의 핵심 설계 철학에 역행합니다.

따라서, 현대적인 대화형 AI 애플리케이션을 LangGraph로 구축하기 위한
**정석적인(canonical) 접근 방식은 WebSocket 아키텍처**입니다. 이
아키텍처는 프레임워크의 상태 기반, 스트리밍 우선(streaming-first) 특성과
직접적이고 우아하게 연결됩니다. 이를 통해 실시간 시각화에서부터 원활한
인간 상호작용에 이르기까지 LangGraph가 제공하는 모든 스펙트럼의 기능을
온전히 활용할 수 있습니다.

결론적으로, 통신 프로토콜의 선택은 사소한 구현의 디테일이 아닙니다. 이는
애플리케이션 전체의 사용자-에이전트 관계를 정의하는 **결정적인 아키텍처
선택**입니다. 사용자와 에이전트가 \'대화\'를 나누는 모든 시나리오에서,
WebSocket은 기술적으로 우월할 뿐만 아니라, LangGraph의 잠재력을 최대한
이끌어내는 유일하고도 강력하게 권장되는 경로입니다.

#### 참고 자료

1.  www.ibm.com, 8월 4, 2025에 액세스,
    > [[https://www.ibm.com/think/topics/langgraph#:\~:text=LangGraph%2C%20created%20by%20LangChain%2C%20is,a%20scalable%20and%20efficient%20manner.]{.underline}](https://www.ibm.com/think/topics/langgraph#:~:text=LangGraph%2C%20created%20by%20LangChain%2C%20is,a%20scalable%20and%20efficient%20manner.)

2.  What is LangGraph? - IBM, 8월 4, 2025에 액세스,
    > [[https://www.ibm.com/think/topics/langgraph]{.underline}](https://www.ibm.com/think/topics/langgraph)

3.  LangGraph Tutorial: What Is LangGraph and How to Use It? - DataCamp,
    > 8월 4, 2025에 액세스,
    > [[https://www.datacamp.com/tutorial/langgraph-tutorial]{.underline}](https://www.datacamp.com/tutorial/langgraph-tutorial)

4.  LangGraph - GitHub Pages, 8월 4, 2025에 액세스,
    > [[https://langchain-ai.github.io/langgraph/]{.underline}](https://langchain-ai.github.io/langgraph/)

5.  Managing Agent Steps - LangGraph, 8월 4, 2025에 액세스,
    > [[https://www.baihezi.com/mirrors/langgraph/how-tos/managing-agent-steps/index.html]{.underline}](https://www.baihezi.com/mirrors/langgraph/how-tos/managing-agent-steps/index.html)

6.  How to manage agent steps, 8월 4, 2025에 액세스,
    > [[https://langchain-ai.github.io/langgraphjs/how-tos/managing-agent-steps/]{.underline}](https://langchain-ai.github.io/langgraphjs/how-tos/managing-agent-steps/)

7.  LangGraph - LangChain, 8월 4, 2025에 액세스,
    > [[https://www.langchain.com/langgraph]{.underline}](https://www.langchain.com/langgraph)

8.  WebSocket vs REST: Key differences and which to use - Ably, 8월 4,
    > 2025에 액세스,
    > [[https://ably.com/topic/websocket-vs-rest]{.underline}](https://ably.com/topic/websocket-vs-rest)

9.  What is the difference between RESTful APIs and WebSockets? -
    > Polygon.io, 8월 4, 2025에 액세스,
    > [[https://polygon.io/knowledge-base/article/what-is-the-difference-between-restful-apis-and-websockets]{.underline}](https://polygon.io/knowledge-base/article/what-is-the-difference-between-restful-apis-and-websockets)

10. Websocket vs REST API. 7 Significant Differences - Wallarm, 8월 4,
    > 2025에 액세스,
    > [[https://www.wallarm.com/what/websocket-vs-rest-api]{.underline}](https://www.wallarm.com/what/websocket-vs-rest-api)

11. REST API vs WebSocket API: Choosing the Right Tool for the Job \| by
    > Priyanshu Rajput, 8월 4, 2025에 액세스,
    > [[https://medium.com/@priyanshu011109/rest-api-vs-websocket-api-choosing-the-right-tool-for-the-job-cee42dcac52c]{.underline}](https://medium.com/@priyanshu011109/rest-api-vs-websocket-api-choosing-the-right-tool-for-the-job-cee42dcac52c)

12. Difference between Rest API and Web Socket API - GeeksforGeeks, 8월
    > 4, 2025에 액세스,
    > [[https://www.geeksforgeeks.org/computer-networks/difference-between-rest-api-and-web-socket-api/]{.underline}](https://www.geeksforgeeks.org/computer-networks/difference-between-rest-api-and-web-socket-api/)

13. Rest API Vs HTTP API Vs WebSocket API - DEV Community, 8월 4, 2025에
    > 액세스,
    > [[https://dev.to/akhil_mittal/rest-api-vs-http-api-vs-websocket-api-55ci]{.underline}](https://dev.to/akhil_mittal/rest-api-vs-http-api-vs-websocket-api-55ci)

14. Conceptual guide \| 🦜️ LangChain, 8월 4, 2025에 액세스,
    > [[https://python.langchain.com/docs/concepts/]{.underline}](https://python.langchain.com/docs/concepts/)

15. How do I use LangChain with RESTful APIs? - Milvus, 8월 4, 2025에
    > 액세스,
    > [[https://milvus.io/ai-quick-reference/how-do-i-use-langchain-with-restful-apis]{.underline}](https://milvus.io/ai-quick-reference/how-do-i-use-langchain-with-restful-apis)

16. Streaming - ️ LangChain, 8월 4, 2025에 액세스,
    > [[https://python.langchain.com/docs/concepts/streaming/]{.underline}](https://python.langchain.com/docs/concepts/streaming/)

17. How to Access Intermediate Steps of Langchain Agent React in
    > Real-Time While Waiting for Final Response? - Stack Overflow, 8월
    > 4, 2025에 액세스,
    > [[https://stackoverflow.com/questions/78699723/how-to-access-intermediate-steps-of-langchain-agent-react-in-real-time-while-wai]{.underline}](https://stackoverflow.com/questions/78699723/how-to-access-intermediate-steps-of-langchain-agent-react-in-real-time-while-wai)

18. How to stream runnables \| 🦜️ LangChain, 8월 4, 2025에 액세스,
    > [[https://python.langchain.com/docs/how_to/streaming/]{.underline}](https://python.langchain.com/docs/how_to/streaming/)

19. Streaming - LangChain.js, 8월 4, 2025에 액세스,
    > [[https://js.langchain.com/docs/concepts/streaming/]{.underline}](https://js.langchain.com/docs/concepts/streaming/)

20. langgraphjs-examples/streaming_messages/README.md at main - GitHub,
    > 8월 4, 2025에 액세스,
    > [[https://github.com/bracesproul/langgraphjs-examples/blob/main/streaming_messages/README.md]{.underline}](https://github.com/bracesproul/langgraphjs-examples/blob/main/streaming_messages/README.md)

21. Streaming API - GitHub Pages, 8월 4, 2025에 액세스,
    > [[https://langchain-ai.github.io/langgraph/cloud/how-tos/streaming/]{.underline}](https://langchain-ai.github.io/langgraph/cloud/how-tos/streaming/)

22. Stream outputs - GitHub Pages, 8월 4, 2025에 액세스,
    > [[https://langchain-ai.github.io/langgraph/how-tos/streaming/]{.underline}](https://langchain-ai.github.io/langgraph/how-tos/streaming/)

23. LangGraph.js, 8월 4, 2025에 액세스,
    > [[https://langchain-ai.github.io/langgraphjs/]{.underline}](https://langchain-ai.github.io/langgraphjs/)

24. Streaming Support in LangChain, 8월 4, 2025에 액세스,
    > [[https://blog.langchain.com/streaming-support-in-langchain/]{.underline}](https://blog.langchain.com/streaming-support-in-langchain/)

25. langchain-serve/examples/websockets/hitl/README.md at main - GitHub,
    > 8월 4, 2025에 액세스,
    > [[https://github.com/jina-ai/langchain-serve/blob/main/examples/websockets/hitl/README.md]{.underline}](https://github.com/jina-ai/langchain-serve/blob/main/examples/websockets/hitl/README.md)

26. wll8/express-ws: Quickly implement websocket API in express. -
    > GitHub, 8월 4, 2025에 액세스,
    > [[https://github.com/wll8/express-ws]{.underline}](https://github.com/wll8/express-ws)

27. websockets/ws: Simple to use, blazing fast and thoroughly tested
    > WebSocket client and server for Node.js - GitHub, 8월 4, 2025에
    > 액세스,
    > [[https://github.com/websockets/ws]{.underline}](https://github.com/websockets/ws)

28. WebSocket vs REST API: The Ultimate Communication Protocol for
    > Real-Time Apps, 8월 4, 2025에 액세스,
    > [[https://www.go-globe.com/websocket-vs-rest-api-comparison-guide]{.underline}](https://www.go-globe.com/websocket-vs-rest-api-comparison-guide)

29. What are the pitfalls of using Websockets in place of RESTful
    > HTTP? - Stack Overflow, 8월 4, 2025에 액세스,
    > [[https://stackoverflow.com/questions/29925955/what-are-the-pitfalls-of-using-websockets-in-place-of-restful-http]{.underline}](https://stackoverflow.com/questions/29925955/what-are-the-pitfalls-of-using-websockets-in-place-of-restful-http)

30. Websocket vs REST when sending data to server - Stack Overflow, 8월
    > 4, 2025에 액세스,
    > [[https://stackoverflow.com/questions/45460734/websocket-vs-rest-when-sending-data-to-server]{.underline}](https://stackoverflow.com/questions/45460734/websocket-vs-rest-when-sending-data-to-server)

31. REST vs WebSockets The Ultimate Guide to Choosing Your Communication
    > Protocol, 8월 4, 2025에 액세스,
    > [[https://apidog.com/blog/rest-vs-websockets/]{.underline}](https://apidog.com/blog/rest-vs-websockets/)

32. Error handling for LangChain/LangGraph? - Reddit, 8월 4, 2025에
    > 액세스,
    > [[https://www.reddit.com/r/LangChain/comments/1k3vyky/error_handling_for_langchainlanggraph/]{.underline}](https://www.reddit.com/r/LangChain/comments/1k3vyky/error_handling_for_langchainlanggraph/)

33. How to handle tool calling errors, 8월 4, 2025에 액세스,
    > [[https://langchain-ai.github.io/langgraphjs/how-tos/tool-calling-errors/]{.underline}](https://langchain-ai.github.io/langgraphjs/how-tos/tool-calling-errors/)

34. Is it good practice to use web sockets alongside a rest API? :
    > r/webdev - Reddit, 8월 4, 2025에 액세스,
    > [[https://www.reddit.com/r/webdev/comments/15e2iff/is_it_good_practice_to_use_web_sockets_alongside/]{.underline}](https://www.reddit.com/r/webdev/comments/15e2iff/is_it_good_practice_to_use_web_sockets_alongside/)
