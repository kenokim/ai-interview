# **수동적 검색을 넘어 능동적 추론으로: Agentic RAG와 LangGraph를 활용한 구현에 대한 최종 가이드**

## **파트 1: Agentic RAG의 개념적 프레임워크**

### **섹션 1.1: 정보 검색의 재정의: Agentic RAG의 등장** {#섹션-1.1-정보-검색의-재정의-agentic-rag의-등장}

인공지능 분야에서 정보 검색 및 생성 기술은 검색 증강
생성(Retrieval-Augmented Generation, RAG)의 등장으로 큰 발전을
이루었습니다. 그러나 전통적인 RAG는 정해진 파이프라인에 따라 수동적으로
정보를 검색하고 생성하는 데 그쳤습니다. 이러한 한계를 극복하기 위해
등장한 새로운 패러다임이 바로 Agentic RAG입니다.^1^

#### **핵심 정의**

Agentic RAG는 자율적인 AI 에이전트가 정보 검색 및 생성 프로세스를
능동적이고 동적으로 조율하는 프레임워크를 의미합니다.^1^ 전통적인 RAG가

질의 -\> 검색 -\> 보강 -\> 생성이라는 단선적이고 예측 가능한 흐름을
따르는 반면 ^4^, Agentic RAG는 LLM(거대 언어 모델)을 단순한 응답
생성기에서 복잡하고 다단계 워크플로우를 계획하고 실행하는 추론 엔진으로
변모시킵니다.^2^ 이는 정적인 규칙 기반 질의 시스템에서 적응적이고
지능적인 문제 해결 방식으로의 전환을 의미합니다.^2^ 시스템의 역할 자체가
데이터를 처리하는 \'데이터 프로세서\'에서 지식을 활용해 문제를 해결하는
\'지식 노동자\'로 근본적으로 변화하는 것입니다. 전통적인 RAG의 가치가
검색된 데이터의 품질에 있다면, Agentic RAG의 가치는 어떤 도구를
사용할지, 질의를 어떻게 재작성할지, 추가 정보가 필요한지 등을 판단하는
에이전트의 \'결정\' 품질에 있습니다.^6^

#### **에이전트의 핵심: 계획, 메모리, 도구 사용**

AI 에이전트의 자율성은 세 가지 핵심 요소에 의해 구현됩니다.

- **계획(Planning):** 복잡한 작업을 더 작고 관리 가능한 하위 목표로
  > 분해하고, 다음 행동에 대해 추론하는 능력입니다.^8^ 여기에는 자기
  > 비판, 성찰, 그리고 질의 라우팅과 같은 고급 기능이 포함됩니다.^8^

- **메모리(Memory):** 이전 상호작용으로부터 정보를 유지하여 맥락을
  > 인지하고 시간의 흐름에 따라 학습하는 능력입니다. 이는 대화 기록과
  > 같은 단기 메모리와 과거 상호작용의 요약을 벡터 저장소에 저장하는
  > 것과 같은 장기 메모리를 모두 포함합니다.^2^

- **도구 사용(Tool Use):** API를 통해 외부 세계와 상호작용하는 능력으로,
  > 웹 검색, 계산, 또는 기업 내부 데이터베이스 접근과 같이 텍스트 생성을
  > 넘어서는 행동을 수행할 수 있게 합니다.^2^ 특히 함수 호출(Function
  > Calling) 기능이 탑재된 LLM은 이 능력을 구현하는 핵심 기술입니다.^8^

#### **에이전시의 엔진: 사고-행동-관찰 루프**

에이전트의 자율적 행동은 근본적인 운영 주기, 즉 \'사고-행동-관찰\'
루프에 의해 구동됩니다.^8^

1.  **사고(Thought):** 에이전트는 질의를 받고 최선의 행동 방침에 대해
    > 추론합니다.

2.  **행동(Action):** 에이전트는 특정 도구를 사용하는 등의 행동을
    > 결정하고 실행합니다.

3.  **관찰(Observation):** 에이전트는 행동의 결과를 관찰하고, 이 새로운
    > 정보를 다음 \'사고\' 단계에 반영합니다.

이 반복적인 순환 구조가 에이전트의 자율적 행동을 이끄는 메커니즘입니다.
이러한 패러다임의 전환은 시스템 설계, 평가, 그리고 MLOps에 깊은 영향을
미칩니다. 더 이상 최종 결과물의 정확성만을 평가하는 것이 아니라,
에이전트의 전체 추론 과정을 평가해야 합니다. LangSmith와 같이 에이전트의
행동에 대한 가시성을 제공하는 도구들이 중요해지는 이유가 바로 여기에
있습니다.^10^ 평가의 초점은 \"정답을 맞혔는가?\"에서 \"정답에 도달하기
위해 합리적인 과정을 따랐는가?\"로 이동합니다.^11^

### **섹션 1.2: 패러다임의 전환: Agentic RAG 대 전통적 RAG** {#섹션-1.2-패러다임의-전환-agentic-rag-대-전통적-rag}

Agentic RAG의 등장은 전통적인 RAG가 가진 내재적 한계에서 비롯되었습니다.
전통적인 RAG는 한 번의 검색으로 컨텍스트를 가져오는 \'원샷(one-shot)\'
솔루션이며 ^8^, 단일 지식 소스에 의존하고 ^2^, 스스로 결과를 검증할 수
없으며 ^2^, 복잡하고 다단계의 질의를 처리하는 데 어려움을 겪습니다.^13^
이로 인해 초기 검색 결과가 최적이 아닐 경우, 불완전한 답변이나
환각(hallucination)을 생성할 위험이 있었습니다.^4^

이러한 차이는 시스템의 역할을 \'수동적 조수\'에서 \'능동적 파트너\'로
전환시킵니다.^14^ 전통적인 RAG가 요청에 따라 정보를 검색하는 수동적
조수라면 ^14^, Agentic RAG는 주도권을 가지고 스스로 의사결정을 내리며
자율적으로 문제를 해결하는 능동적 파트너와 같습니다.^2^ 이는 사용자가
요청한 책을 찾아주는 사서와, 그 책을 분석하고 다른 정보와 교차 검증하며
추가 인터뷰까지 수행하는 사립 탐정의 차이와 비견될 수 있습니다.^13^

다음 표는 두 패러다임의 주요 차이점을 구조적으로 비교합니다. 이 비교는
Agentic RAG의 가치를 명확히 하고, 기술 선택 시 고려해야 할 핵심 요소를
제시합니다.

**표 1: RAG 패러다임 비교 분석**

| 기능            | 전통적 (Vanilla) RAG                                  | Agentic RAG                                                              |
|-----------------|-------------------------------------------------------|--------------------------------------------------------------------------|
| **워크플로우**  | 정적, 순차적, 원샷 (검색 → 생성) ^8^                  | 동적, 반복적, 다단계 (사고-행동-관찰 루프) ^8^                           |
| **추론**        | 제공된 컨텍스트 기반의 생성으로 제한됨                | 다단계 추론, 계획, 자기 교정, 질의 분해 ^7^                              |
| **도구 사용**   | 없음. 검색 도구로 제한됨 ^9^                          | 광범위함. 웹 검색, 계산기, API, 데이터베이스 등 사용 가능 ^2^            |
| **데이터 소스** | 일반적으로 단일, 사전 인덱싱된 벡터 저장소 ^2^        | 다중, 이기종 소스(DB, API, 웹)에 동적으로 접근 ^2^                       |
| **적응성**      | 반응적. 변화하는 맥락이나 부실한 검색에 적응 불가 ^2^ | 능동적이고 적응적. 재질의, 전략 변경, 정보 검증 가능 ^6^                 |
| **복잡성**      | 상대적으로 구현이 간단함 ^13^                         | 구현 및 관리가 더 복잡함 ^7^                                             |
| **사용 사례**   | FAQ 봇, 문서 기반의 단순 질의응답 ^14^                | 복잡한 리서치, 데이터 분석, 워크플로우 자동화, 실시간 의사결정 지원 ^11^ |

### **섹션 1.3: 아키텍처 청사진: 단일 라우터에서 다중 에이전트 시스템까지** {#섹션-1.3-아키텍처-청사진-단일-라우터에서-다중-에이전트-시스템까지}

Agentic RAG는 단일 에이전트의 간단한 구조부터 여러 에이전트가 협력하는
복잡한 시스템까지 다양한 아키텍처를 가질 수 있습니다.

#### **단일 에이전트 아키텍처 (라우터)**

가장 단순한 형태의 Agentic RAG로, 단일 에이전트가 \'라우터\' 역할을
수행합니다.^8^ 이 에이전트는 사용자 질의를 분석하여 어떤 도구나 데이터
소스를 사용할지 결정합니다. 예를 들어, 내부 지식에 대한 질문은 벡터
데이터베이스로, 최신 이벤트에 대한 질문은 웹 검색 API로 라우팅할 수
있습니다.^8^

#### **다중 에이전트 아키텍처 (오케스트레이터-워커)**

더 복잡한 시스템은 여러 에이전트가 협력하는 구조를 가집니다.^2^ 이는
일반적으로 \'오케스트레이터-워커(Orchestrator-Worker)\' 패턴을
따릅니다.^16^

- **오케스트레이터(또는 관리자) 에이전트:** 사용자 질의를 받아 하위
  > 작업으로 분해한 후, 이를 전문화된 워커 에이전트에게 위임합니다.^16^

- **워커 에이전트:** 특정 데이터베이스 검색, 법률 문서 분석, 코드 생성
  > 등 특정 기능에 전문화되어 있습니다.^3^ 이러한 분업 구조는 확장성,
  > 견고성, 그리고 전문성을 향상시킵니다.^18^

#### **고급 에이전트 패턴 (분류)**

에이전트 설계의 정교함이 발전함에 따라 다음과 같은 고급 패턴들이
등장했습니다.

- **질의 계획(Query Planning):** 에이전트가 실행 전에 어떤 도구를 어떤
  > 순서로 사용할지 명시하는 다단계 계획을 생성합니다.^15^

- **자기 성찰 RAG(Self-Reflective RAG):** 에이전트가 자신의 출력물을
  > 평가하여 부실한 검색이나 생성을 스스로 교정하는 피드백 루프를
  > 통합합니다. 질문을 다시 생성하거나 문서를 재검색할 수 있습니다.^5^

- **교정 RAG(Corrective RAG, CRAG):** 자기 성찰의 구체적인 구현
  > 방식으로, 검색 평가자가 문서의 관련성을 평가합니다. 문서가
  > 부적절하다고 판단되면 웹 검색이나 질의 재작성과 같은 교정 조치를
  > 촉발합니다.^10^

다음 표는 이러한 아키텍처 패턴들을 체계적으로 분류하여, 각 패턴의 기능과
이상적인 적용 시나리오를 제시합니다. 이는 특정 비즈니스 문제에 가장
적합한 아키텍처 솔루션을 선택하는 데 실질적인 도움을 줄 수 있습니다.

**표 2: Agentic RAG 아키텍처 패턴 분류**

| 아키텍처 패턴            | 주요 기능                                        | 핵심 구성 요소                              | 이상적인 사용 사례                                                      |
|--------------------------|--------------------------------------------------|---------------------------------------------|-------------------------------------------------------------------------|
| **에이전트 라우터**      | 질의에 가장 적합한 도구/데이터 소스 선택         | 단일 에이전트, 다중 도구/리트리버           | 다양한 유형의 정보(내부 vs. 웹)에 접근해야 하는 Q&A 시스템              |
| **질의 플래너**          | 복잡한 질의를 논리적인 단계 순서로 분해          | 플래너 에이전트, 실행 도구                  | 논리적 연산 순서가 필요한 다면적 질문에 대한 답변                       |
| **교정 RAG (CRAG)**      | 부실한 검색 결과를 평가하고 교정                 | 리트리버, 평가 노드, 재작성기/웹 검색       | 검색 정확도가 중요하고 데이터 소스가 노이즈가 많을 수 있는 애플리케이션 |
| **자기 성찰 RAG**        | 피드백 루프를 통해 검색과 생성을 반복적으로 개선 | 검색 및 생성 평가기, 순환 로직              | 사실 기반과 답변 품질 모두 검증이 필요한 고부가가치 생성 작업           |
| **다중 에이전트 시스템** | 전문화된 에이전트 팀을 조직하여 복잡한 문제 해결 | 오케스트레이터 에이전트, 전문 워커 에이전트 | 다양한 도메인을 포함하는 복잡한 연구 및 기업 규모의 워크플로우 자동화   |

## **파트 2: 구현 심층 분석: LangGraph로 Agentic RAG 구축하기**

이 파트는 LangGraph를 사용하여 점진적으로 정교한 Agentic RAG 시스템을
처음부터 구축하는 실습 중심의 코드 가이드입니다. 각 단계별로 상세한
설명과 주석을 제공하여 개념을 실제 코드로 전환하는 과정을 안내합니다.

### **섹션 2.1: LangGraph 기본: 에이전트 워크플로우의 구성 요소** {#섹션-2.1-langgraph-기본-에이전트-워크플로우의-구성-요소}

Agentic RAG와 같은 복잡한 시스템을 구축하기 위해서는 순환(loop), 상태
관리, 조건부 로직을 지원하는 프레임워크가 필수적입니다. LangGraph는
이러한 요구사항을 충족시키기 위해 특별히 설계되었습니다.

#### **왜 LangGraph인가?**

표준 LangChain 표현 언어(LCEL) 체인이 선형적인 데이터 흐름에 최적화된
반면, LangGraph는 에이전트의 반복적인 특성에 필수적인 순환(cycle)을
기본적으로 지원합니다.^5^ NetworkX에서 영감을 받은 그래프 기반
패러다임을 통해 상태, 노드, 그리고 조건부 엣지를 명시적으로 정의할 수
있어, 복잡하고 상태를 가지는(stateful) 워크플로우를 효과적으로 관리할 수
있습니다.^20^

#### **핵심 기본 요소**

LangGraph로 그래프를 구축하는 데 사용되는 주요 구성 요소는 다음과
같습니다.

- **상태 저장 그래프 (StateGraph):** 워크플로우 구조를 정의하는 핵심
  > 클래스입니다. 노드 간에 전달되는 상태 객체를 관리합니다.^10^

- **그래프 상태 (TypedDict):** 상태 객체의 스키마를 정의합니다.
  > typing.TypedDict를 사용하여 {\"question\": str, \"documents\":
  > list}와 같이 구조화된 상태를 만들 수 있습니다.^10^ 대화형 에이전트를
  > 위해서는 메시지 목록을 관리하는  
  > MessagesState가 주로 사용됩니다.^23^

- **노드(Nodes):** 그래프 내에서 작업 단위를 나타내는 파이썬 함수 또는
  > LangChain Runnable 객체입니다. (예: LLM 호출, 문서 검색).^21^

- **엣지(Edges):** 노드 간의 방향성 있는 연결입니다. add_edge는
  > 무조건적인 전환을, add_conditional_edges는 노드의 출력에 기반한 동적
  > 라우팅을 정의합니다.^21^

#### **상태 관리 및 영속성**

LangGraph는 워크플로우 전반에 걸쳐 상태를 관리하며, MemorySaver와 같은
checkpointer 객체를 사용하여 상태를 영속화할 수 있습니다. 이는 대화
기록을 유지해야 하는 메모리 기반의 대화형 에이전트를 구축하는 데 매우
중요합니다.^23^

### **섹션 2.2: 기본적인 Agentic RAG 워크플로우 구축하기** {#섹션-2.2-기본적인-agentic-rag-워크플로우-구축하기}

이 섹션에서는 질문에 직접 답하거나, 정보가 더 필요하다고 판단되면 검색
도구를 사용하도록 결정할 수 있는 기본적인 에이전트를 단계별로
구축합니다.

#### **1단계: 환경 및 도구 설정** {#단계-환경-및-도구-설정}

먼저 API 키를 설정하고, @tool 데코레이터를 사용하여 검색 도구를
정의합니다. 여기서는 Chroma와 OpenAI 임베딩을 사용해 간단한 벡터 저장소
리트리버를 생성합니다.^23^

> Python

import os  
from langchain_openai import ChatOpenAI, OpenAIEmbeddings  
from langchain_community.vectorstores import Chroma  
from langchain_core.tools import tool  
from langchain_community.document_loaders import WebBaseLoader  
from langchain.text_splitter import RecursiveCharacterTextSplitter  
  
\# API 키 설정  
os.environ = \"YOUR_OPENAI_API_KEY\"  
  
@tool  
def retrieve_context(query: str) -\> str:  
\"\"\"주어진 질문과 관련된 문서를 검색합니다.\"\"\"  
\# 예시로 LangChain 블로그 문서를 로드하고 인덱싱합니다.  
loader =
WebBaseLoader(\"https://blog.langchain.dev/agentic-rag-with-langgraph/\")  
docs = loader.load()  
text_splitter = RecursiveCharacterTextSplitter(chunk_size=500,
chunk_overlap=50)  
splits = text_splitter.split_documents(docs)  
vectorstore = Chroma.from_documents(documents=splits,
embedding=OpenAIEmbeddings())  
retriever = vectorstore.as_retriever(search_kwargs={\"k\": 2})  
retrieved_docs = retriever.invoke(query)  
return \"\n\n\".join(\[doc.page_content for doc in retrieved_docs\])  
  
tools = \[retrieve_context\]

#### **2단계: 그래프 상태 및 에이전트 정의** {#단계-그래프-상태-및-에이전트-정의}

대화 기록을 관리하기 위해 MessagesState를 사용하고, ChatOpenAI 모델에
.bind_tools()를 사용하여 위에서 정의한 검색 도구를 연결합니다.^23^

> Python

from typing import Annotated, Sequence  
from langchain_core.messages import BaseMessage  
from langgraph.graph.message import add_messages  
from langgraph.prebuilt import ToolNode  
  
\# 그래프의 상태를 정의합니다. 메시지 목록을 관리합니다.  
class AgentState(TypedDict):  
messages: Annotated, add_messages\]  
  
\# LLM에 도구를 연결하여 에이전트를 생성합니다.  
model = ChatOpenAI(model=\"gpt-4o-mini\", temperature=0)  
model_with_tools = model.bind_tools(tools)

#### **3단계: 노드 생성** {#단계-노드-생성}

LLM을 호출하는 \'agent\' 노드와 도구를 실행하는 ToolNode를
정의합니다.^23^

> Python

\# 에이전트(LLM)를 호출하는 노드  
def call_model(state: AgentState):  
response = model_with_tools.invoke(state\[\"messages\"\])  
\# 상태에 응답을 추가하기 위해 리스트 형태로 반환합니다.  
return {\"messages\": \[response\]}  
  
\# 도구를 실행하는 노드  
tool_node = ToolNode(tools)

#### **4단계: 조건부 로직으로 그래프 구축** {#단계-조건부-로직으로-그래프-구축}

StateGraph를 인스턴스화하고, \'agent\'와 \'tools\' 노드를 추가합니다.
핵심은 LLM의 응답에 tool_calls가 있는지 확인하여 다음 경로를 결정하는
조건부 엣지를 구현하는 것입니다.^23^

> Python

from langgraph.graph import StateGraph, START, END  
from typing import Literal  
  
\# LLM의 결정에 따라 다음 단계를 결정하는 함수  
def should_continue(state: AgentState) -\> Literal:  
last_message = state\[\"messages\"\]\[-1\]  
if last_message.tool_calls:  
\# LLM이 도구 호출을 결정했다면 \'tools\' 노드로 이동  
return \"tools\"  
\# 그렇지 않으면 워크플로우 종료  
return END  
  
\# 그래프 워크플로우 정의  
workflow = StateGraph(AgentState)  
  
\# 노드 추가  
workflow.add_node(\"agent\", call_model)  
workflow.add_node(\"tools\", tool_node)  
  
\# 시작점 설정  
workflow.add_edge(START, \"agent\")  
  
\# 조건부 엣지 추가  
workflow.add_conditional_edges(  
\"agent\",  
should_continue,  
{  
\"tools\": \"tools\",  
END: END,  
},  
)  
  
\# \'tools\' 노드에서 다시 \'agent\' 노드로 연결하여 루프 생성  
workflow.add_edge(\"tools\", \"agent\")

#### **5단계: 그래프 컴파일 및 실행** {#단계-그래프-컴파일-및-실행}

워크플로우를 실행 가능한 app으로 컴파일하고 샘플 질문으로 호출하여
에이전트의 의사결정 과정을 확인합니다.^23^

> Python

from langchain_core.messages import HumanMessage  
  
\# 그래프 컴파일  
app = workflow.compile()  
  
\# 실행  
inputs = {\"messages\":}  
for event in app.stream(inputs, stream_mode=\"values\"):  
event\[\"messages\"\]\[-1\].pretty_print()

이 코드를 실행하면, 에이전트는 먼저 retrieve_context 도구를 호출하여
관련 문서를 검색한 다음, 검색된 정보를 바탕으로 최종 답변을 생성하는
과정을 거칩니다. 이는 에이전트가 필요에 따라 동적으로 도구를 사용하는
핵심적인 에이전트 행동을 보여줍니다.

### **섹션 2.3: 고급 구현: 자기 교정 및 견고성 (CRAG)** {#섹션-2.3-고급-구현-자기-교정-및-견고성-crag}

기본적인 에이전트 루프는 강력하지만, 검색 도구가 관련 없는 문서를 반환할
경우 취약할 수 있습니다.^4^ 에이전트는 잘못된 컨텍스트를 기반으로 환각을
일으킬 수 있습니다. 이 문제를 해결하기 위해, 인간의 연구 과정(자료 탐색
→ 자료 평가 → 전략 수정)을 모방하여 명시적인 \'평가\' 단계를 그래프에
추가하는 교정 RAG(CRAG)를 구현합니다.^10^

이러한 아키텍처는 에이전트의 추론 과정을 명시적이고 감사 가능하게
만듭니다. 그래프를 통해 어떤 경로(검색 -\> 평가 -\> 재작성 -\> 검색 -\>
평가 -\> 생성)를 거쳤는지 정확히 추적함으로써, 실패의 원인을 진단할 수
있습니다.^11^ 이 \'설계에 의한 설명 가능성\'은 복잡한 AI 시스템에 대한
신뢰를 구축하고 디버깅하는 데 큰 이점을 제공합니다.

#### **코드 워크스루: CRAG 그래프 구현**

다음은 검색된 문서의 관련성을 평가하고, 부적절할 경우 질의를
재작성하거나 웹 검색으로 대체하는 CRAG 시스템의 구현 예시입니다.

#### **1단계: 그래프 상태 및 도구 확장** {#단계-그래프-상태-및-도구-확장}

그래프 상태에 문서, 질문, 등급 결정과 같은 더 많은 정보를 저장하도록
확장하고, 웹 검색 도구를 추가합니다.

> Python

from typing import List, TypedDict  
from langchain_core.pydantic_v1 import BaseModel, Field  
from tavily import TavilyClient  
  
tavily = TavilyClient(api_key=\"YOUR_TAVILY_API_KEY\")  
  
class GraphState(TypedDict):  
question: str  
generation: str  
documents: List\[str\]  
web_search_needed: bool  
  
@tool  
def web_search(query: str):  
\"\"\"웹에서 정보를 검색합니다.\"\"\"  
search_result = tavily.search(query=query, search_depth=\"advanced\")  
return \[r\[\"content\"\] for r in search_result\[\"results\"\]\]  
  
\# 기존의 retrieve_context 도구도 사용  
tools = \[retrieve_context, web_search\]  
tool_node = ToolNode(tools)

#### **2단계: 새로운 노드 정의 (평가, 재작성, 생성)** {#단계-새로운-노드-정의-평가-재작성-생성}

문서 관련성을 평가하는 grade_documents, 질의를 재작성하는 rewrite,
그리고 최종 답변을 생성하는 generate 노드를 정의합니다.

> Python

\# 문서 관련성 평가를 위한 데이터 구조  
class GradeDocuments(BaseModel):  
\"\"\"검색된 문서가 질문에 관련이 있는지 이진 점수로 평가합니다.\"\"\"  
binary_score: str = Field(description=\"문서가 관련 있으면 \'yes\', 관련
없으면 \'no\'로 응답합니다.\")  
  
\# 문서 평가 노드  
def grade_documents(state: GraphState):  
print(\"\-\--문서 관련성 평가\-\--\")  
question = state\[\"question\"\]  
documents = state\[\"documents\"\]  
  
llm = ChatOpenAI(model=\"gpt-4o-mini\", temperature=0)  
structured_llm_grader = llm.with_structured_output(GradeDocuments)  
  
web_search_needed = False  
for d in documents:  
prompt = f\"\"\"사용자 질문에 대한 검색된 문서의 관련성을 평가합니다:  
질문: {question}  
문서: {d}  
  
이 문서가 질문에 대한 핵심 정보를 포함하고 있습니까? \'yes\' 또는
\'no\'로만 답하세요.\"\"\"  
grade = structured_llm_grader.invoke(prompt)  
if grade.binary_score == \"no\":  
print(\"\-\--결정: 문서 관련성 낮음\-\--\")  
web_search_needed = True  
break  
  
return {\"web_search_needed\": web_search_needed}  
  
\# 질의 재작성 노드  
def rewrite(state: GraphState):  
print(\"\-\--질의 재작성\-\--\")  
question = state\[\"question\"\]  
prompt = f\"다음 질문을 웹 검색에 더 적합하도록 명확하고 구체적인
검색어로 재작성하세요: {question}\"  
rewriter = ChatOpenAI(model=\"gpt-4o-mini\", temperature=0)  
rewritten_question = rewriter.invoke(prompt).content  
return {\"question\": rewritten_question}  
  
\# 답변 생성 노드  
def generate(state: GraphState):  
print(\"\-\--답변 생성\-\--\")  
question = state\[\"question\"\]  
documents = state\[\"documents\"\]  
prompt = f\"\"\"다음 컨텍스트를 사용하여 질문에 답하세요:  
질문: {question}  
컨텍스트:  
{\"\n\n\".join(documents)}  
\"\"\"  
generator = ChatOpenAI(model=\"gpt-4o\", temperature=0)  
generation = generator.invoke(prompt).content  
return {\"generation\": generation}  
  
\# 문서 검색 노드  
def retrieve(state: GraphState):  
print(\"\-\--문서 검색\-\--\")  
question = state\[\"question\"\]  
documents = retrieve_context.invoke(question) \# 기존 도구 사용  
return {\"documents\": \[documents\], \"question\": question}

#### **3단계: 교정 그래프 연결** {#단계-교정-그래프-연결}

이제 새로운 노드들을 조건부 엣지로 연결하여 교정 루프를 완성합니다.

> Python

def decide_to_generate(state: GraphState):  
if state\[\"web_search_needed\"\]:  
print(\"\-\--결정: 웹 검색으로 보강\-\--\")  
return \"rewrite\"  
else:  
print(\"\-\--결정: 생성으로 진행\-\--\")  
return \"generate\"  
  
workflow = StateGraph(GraphState)  
  
\# 노드 정의  
workflow.add_node(\"retrieve\", retrieve)  
workflow.add_node(\"grade_documents\", grade_documents)  
workflow.add_node(\"rewrite\", rewrite)  
workflow.add_node(\"web_search\", web_search) \# ToolNode가 아닌 함수로
직접 호출  
workflow.add_node(\"generate\", generate)  
  
\# 엣지 연결  
workflow.set_entry_point(\"retrieve\")  
workflow.add_edge(\"retrieve\", \"grade_documents\")  
workflow.add_conditional_edges(  
\"grade_documents\",  
decide_to_generate,  
{  
\"rewrite\": \"rewrite\",  
\"generate\": \"generate\",  
},  
)  
workflow.add_edge(\"rewrite\", \"web_search\")  
workflow.add_edge(\"web_search\", \"generate\")  
workflow.add_edge(\"generate\", END)  
  
\# 컴파일  
app = workflow.compile()

이 CRAG 그래프는 초기 검색 결과가 부적절할 때, 질의를 재작성하고 웹
검색을 통해 정보를 보강한 후 최종 답변을 생성하는 동적이고 견고한
워크플로우를 구현합니다. 이는 시스템의 정확성과 신뢰도를 크게
향상시킵니다.

## **파트 3: 전략적 적용 및 미래 방향**

Agentic RAG는 단순한 기술적 발전을 넘어, 비즈니스 가치를 창출하고 복잡한
문제를 해결하는 새로운 방식을 제시합니다. 이 파트에서는 실제 적용 사례,
전략적 과제, 그리고 에이전트 AI의 미래 궤적을 탐구합니다.

### **섹션 3.1: 실제 적용 사례와 영향** {#섹션-3.1-실제-적용-사례와-영향}

Agentic RAG는 다양한 산업 분야에서 핵심 비즈니스 기능을 혁신하고
있습니다.

#### **기업 애플리케이션**

- **고객 지원 자동화:** 단순한 FAQ 봇을 넘어, 사용 설명서를 참조하고,
  > 주문 데이터베이스를 조회하며, 필요시 인간 상담원에게 문제를
  > 에스컬레이션하는 등 복잡한 문제를 해결하는 지능형 에이전트를 구축할
  > 수 있습니다.^2^

- **지식 관리:** 위키, CRM, 코드베이스 등 파편화된 기업 시스템 전반을
  > 지능적으로 검색하여 직원에게 정확하고 맥락에 맞는 답변을 제공하는
  > \'AI 팀원\'을 만들 수 있습니다.^6^

- **규정 준수 및 법률:** 변화하는 규정을 모니터링하고, 내부 정책에 따라
  > 계약서를 분석하며, 위험을 경고하는 에이전트를 통해 수동적인 연구
  > 시간을 대폭 단축할 수 있습니다.^14^

#### **전문 및 고부가가치 도메인**

- **의료 및 생명 과학:** 환자 데이터와 최신 의학 연구를 종합하여
  > 임상의의 진단을 보조하고 ^14^, 다중 소스 문헌 검토를 통해 신약 개발
  > 및 연구를 가속화합니다.^31^

- **금융:** JPMorgan의 \'Coach AI\'와 같이 자산 관리사를 위한 도구를
  > 강화하여, 고객의 질문을 예측하고 관련 시장 리서치를 즉시 검색할 수
  > 있습니다.^32^ 또한 금융 분석 및 위험 평가를 자동화합니다.^33^

이러한 사례들은 Agentic RAG가 단순히 정보를 제공하는 것을 넘어, 복잡한
워크플로우를 자동화하고 고도의 전문적인 의사결정을 지원하는 강력한
도구임을 보여줍니다. 예를 들어, Causaly의 플랫폼은 고도로 구조화된 지식
그래프를 연구 에이전트의 도구로 활용하여 성공을 거두었으며, 이는 특정
작업에 최적화된 도구와 데이터 소스를 제공하는 것이 얼마나 중요한지를
시사합니다.^32^

### **섹션 3.2: 당면 과제 탐색: 지연 시간, 비용, 신뢰성** {#섹션-3.2-당면-과제-탐색-지연-시간-비용-신뢰성}

Agentic RAG는 강력한 만큼 새로운 도전 과제를 제시합니다. 특히 성능,
비용, 신뢰성 측면에서 신중한 접근이 필요합니다.

#### **성능 트레이드오프**

에이전트 시스템의 반복적이고 다단계적인 특성은 본질적으로 전통적인 RAG에
비해 더 높은 지연 시간(latency)과 계산 비용을 유발합니다.^7^

#### **완화 전략**

이러한 문제를 관리하기 위한 실질적인 전략은 다음과 같습니다.

- **비용/지연 시간:** 라우팅이나 평가와 같은 간단한 작업에는 더 작고
  > 빠른 모델을 사용하고, 중간 결과 및 도구 호출을 캐싱하며, 단순한
  > 질의는 전체 에이전트 루프를 우회하는 계층적 로직을 구현하고, 무한
  > 루프를 방지하기 위해 반복 횟수에 제한을 두는 것이 효과적입니다.^9^

- **신뢰성 및 환각:** 환각의 위험은 줄어들었지만 여전히 존재합니다.^27^
  > 따라서 사실 기반(grounding), 에이전트의 단계를 추적할 수 있는 투명한
  > 추론 과정, 그리고 사실적 일관성을 확인하는 견고한 평가 프레임워크가
  > 중요합니다.^5^

- **거버넌스 및 안전:** 자율적인 에이전트를 관리하기 위해서는 엄격한
  > 가드레일이 필요합니다. 여기에는 데이터베이스에 대한 읽기/쓰기 권한과
  > 같은 도구 접근 제어, 인간 참여(human-in-the-loop) 감독 구현, 그리고
  > 에이전트의 의사결정 과정이 투명하고 감사 가능하도록 보장하는 것이
  > 포함됩니다.^14^

### **섹션 3.3: 권장 사항 및 전망** {#섹션-3.3-권장-사항-및-전망}

Agentic RAG의 도입을 고려할 때, 어떤 RAG 변형을 선택할지에 대한 명확한
의사결정 프레임워크가 필요합니다.

#### **도입을 위한 전략적 권장 사항**

- **전통적 RAG 사용:** 단순하고 예측 가능한 질의응답 작업, 지연 시간이
  > 매우 중요하고 복잡성이 낮은 애플리케이션(예: 대용량 FAQ 봇)에
  > 적합합니다.^14^

- **Agentic RAG 사용:** 복잡한 다단계 작업, 다양한 데이터 소스를 다루는
  > 환경, 원시 속도보다 적응성과 정확성이 더 중요한 애플리케이션, 그리고
  > 고부가가치 의사결정 지원 시스템에 이상적입니다.^7^

#### **미래는 협력적이고 다중 모드적이다**

결론적으로, AI의 미래는 더욱 정교한 다중 에이전트 시스템으로 나아가고
있습니다. 비전(vision)과 같은 다른 양식(modality)을 다루는 전문화된
에이전트들이 협력하여 작업을 수행하는 시대가 오고 있습니다.^2^ 기업 AI의
미래는 단일 거대 모델이 아니라, 전체 비즈니스 프로세스를 자동화하기 위해
조직된, 상호 연결된 전문 에이전트 네트워크가 될 것입니다.^16^
LangGraph와 같은 프레임워크는 이러한 미래를 가능하게 하는 핵심 기반
기술입니다. Agentic RAG는 단순한 정보 검색 도구를 넘어, 조직이 지식을
활용하고, 의사결정을 내리며, 가치를 창출하는 방식을 근본적으로
변화시키는 전략적 자산으로 자리매김하고 있습니다.

#### 참고 자료

1.  www.salesforce.com, 7월 15, 2025에 액세스,
    > [[https://www.salesforce.com/agentforce/agentic-rag/#:\~:text=Agentic%20RAG%20(Retrieval%2DAugmented%20Generation,are%20accurate%20and%20contextually%20appropriate.]{.underline}](https://www.salesforce.com/agentforce/agentic-rag/#:~:text=Agentic%20RAG%20(Retrieval%2DAugmented%20Generation,are%20accurate%20and%20contextually%20appropriate.)

2.  What is Agentic RAG? \| IBM, 7월 15, 2025에 액세스,
    > [[https://www.ibm.com/think/topics/agentic-rag]{.underline}](https://www.ibm.com/think/topics/agentic-rag)

3.  Agentic RAG - What is it and how does it work? - GetStream.io, 7월
    > 15, 2025에 액세스,
    > [[https://getstream.io/glossary/agentic-rag/]{.underline}](https://getstream.io/glossary/agentic-rag/)

4.  RAG, AI Agents, and Agentic RAG: An In-Depth Review and Comparative
    > Analysis, 7월 15, 2025에 액세스,
    > [[https://www.digitalocean.com/community/conceptual-articles/rag-ai-agents-agentic-rag-comparative-analysis]{.underline}](https://www.digitalocean.com/community/conceptual-articles/rag-ai-agents-agentic-rag-comparative-analysis)

5.  Self-Reflective RAG with LangGraph - LangChain Blog, 7월 15, 2025에
    > 액세스,
    > [[https://blog.langchain.com/agentic-rag-with-langgraph/]{.underline}](https://blog.langchain.com/agentic-rag-with-langgraph/)

6.  Agentic RAG explained: Smarter retrieval with AI agents - Glean, 7월
    > 15, 2025에 액세스,
    > [[https://www.glean.com/blog/agentic-rag-explained]{.underline}](https://www.glean.com/blog/agentic-rag-explained)

7.  Beyond Simple Retrieval: Diving Deep into Agentic RAG and its
    > Advantages Over Traditional RAG \| by Ajay Verma \| Medium, 7월
    > 15, 2025에 액세스,
    > [[https://medium.com/@ajayverma23/beyond-simple-retrieval-diving-deep-into-agentic-rag-and-its-advantages-over-traditional-rag-3b5f72067f32]{.underline}](https://medium.com/@ajayverma23/beyond-simple-retrieval-diving-deep-into-agentic-rag-and-its-advantages-over-traditional-rag-3b5f72067f32)

8.  What is Agentic RAG \| Weaviate, 7월 15, 2025에 액세스,
    > [[https://weaviate.io/blog/what-is-agentic-rag]{.underline}](https://weaviate.io/blog/what-is-agentic-rag)

9.  Agentic RAG: How enterprises are surmounting the limits of
    > traditional RAG - Redis, 7월 15, 2025에 액세스,
    > [[https://redis.io/blog/agentic-rag-how-enterprises-are-surmounting-the-limits-of-traditional-rag/]{.underline}](https://redis.io/blog/agentic-rag-how-enterprises-are-surmounting-the-limits-of-traditional-rag/)

10. Corrective RAG (CRAG) - GitHub Pages, 7월 15, 2025에 액세스,
    > [[https://langchain-ai.github.io/langgraph/tutorials/rag/langgraph_crag/]{.underline}](https://langchain-ai.github.io/langgraph/tutorials/rag/langgraph_crag/)

11. Agentic RAG vs RAG: Key Differences and Practical Applications -
    > Ampcome, 7월 15, 2025에 액세스,
    > [[https://www.ampcome.com/post/agentic-rag-vs-rag-key]{.underline}](https://www.ampcome.com/post/agentic-rag-vs-rag-key)

12. www.ibm.com, 7월 15, 2025에 액세스,
    > [[https://www.ibm.com/think/topics/agentic-rag#:\~:text=Agentic%20RAG%20systems%20add%20AI,and%20handle%20more%20complex%20workflows.]{.underline}](https://www.ibm.com/think/topics/agentic-rag#:~:text=Agentic%20RAG%20systems%20add%20AI,and%20handle%20more%20complex%20workflows.)

13. RAG vs. Agentic RAG: A Comparative Look at AI-Driven Information
    > Retrieval - Medium, 7월 15, 2025에 액세스,
    > [[https://medium.com/@srini.hebbar/rag-vs-agentic-rag-a-comparative-look-at-ai-driven-information-retrieval-3e4df12605aa]{.underline}](https://medium.com/@srini.hebbar/rag-vs-agentic-rag-a-comparative-look-at-ai-driven-information-retrieval-3e4df12605aa)

14. Agentic RAG vs. Traditional RAG: The Future of AI Decision-Making -
    > Fluid AI, 7월 15, 2025에 액세스,
    > [[https://www.fluid.ai/blog/agentic-rag-vs-traditional-rag-the-future-of-ai-decision-making]{.underline}](https://www.fluid.ai/blog/agentic-rag-vs-traditional-rag-the-future-of-ai-decision-making)

15. Top 7 Agentic RAG System to Build AI Agents - Analytics Vidhya, 7월
    > 15, 2025에 액세스,
    > [[https://www.analyticsvidhya.com/blog/2025/01/agentic-rag-system-architectures/]{.underline}](https://www.analyticsvidhya.com/blog/2025/01/agentic-rag-system-architectures/)

16. How we built our multi-agent research system - Anthropic, 7월 15,
    > 2025에 액세스,
    > [[https://www.anthropic.com/engineering/built-multi-agent-research-system]{.underline}](https://www.anthropic.com/engineering/built-multi-agent-research-system)

17. Multi-agent RAG System - Hugging Face Open-Source AI Cookbook, 7월
    > 15, 2025에 액세스,
    > [[https://huggingface.co/learn/cookbook/multiagent_rag_system]{.underline}](https://huggingface.co/learn/cookbook/multiagent_rag_system)

18. What is Multi-Agent RAG? Components & Benefits \| GigaSpaces AI, 7월
    > 15, 2025에 액세스,
    > [[https://www.gigaspaces.com/data-terms/multi-agent-rag]{.underline}](https://www.gigaspaces.com/data-terms/multi-agent-rag)

19. How to improve traditional RAG using multi-agentic in-context RAG
    > with LangGraph \| by Anderson Rici Amorim \| May, 2025 \| Medium,
    > 7월 15, 2025에 액세스,
    > [[https://medium.com/@anderson.riciamorim/how-to-improve-traditional-rag-using-multi-agentic-in-context-rag-with-langgraph-1b346a8d684f]{.underline}](https://medium.com/@anderson.riciamorim/how-to-improve-traditional-rag-using-multi-agentic-in-context-rag-with-langgraph-1b346a8d684f)

20. Corrective and Self-Reflective RAG with LangGraph \| by Cole
    > McIntosh - Medium, 7월 15, 2025에 액세스,
    > [[https://medium.com/@colemcintosh6/corrective-and-self-reflective-rag-with-langgraph-364b7452fc3e]{.underline}](https://medium.com/@colemcintosh6/corrective-and-self-reflective-rag-with-langgraph-364b7452fc3e)

21. A Guide to Building Agentic RAG Systems with LangGraph, 7월 15,
    > 2025에 액세스,
    > [[https://www.analyticsvidhya.com/blog/2024/07/building-agentic-rag-systems-with-langgraph/]{.underline}](https://www.analyticsvidhya.com/blog/2024/07/building-agentic-rag-systems-with-langgraph/)

22. \[2401.15884\] Corrective Retrieval Augmented Generation - arXiv,
    > 7월 15, 2025에 액세스,
    > [[https://arxiv.org/abs/2401.15884]{.underline}](https://arxiv.org/abs/2401.15884)

23. Building an Agentic RAG with LangGraph: A Step-by-Step Guide \| by
    > \..., 7월 15, 2025에 액세스,
    > [[https://medium.com/@wendell_89912/building-an-agentic-rag-with-langgraph-a-step-by-step-guide-009c5f0cce0a]{.underline}](https://medium.com/@wendell_89912/building-an-agentic-rag-with-langgraph-a-step-by-step-guide-009c5f0cce0a)

24. Agentic RAG \| LangChain OpenTutorial, 7월 15, 2025에 액세스,
    > [[https://langchain-opentutorial.gitbook.io/langchain-opentutorial/17-langgraph/02-structures/06-langgraph-agentic-rag]{.underline}](https://langchain-opentutorial.gitbook.io/langchain-opentutorial/17-langgraph/02-structures/06-langgraph-agentic-rag)

25. Agentic RAG With LangGraph - Qdrant, 7월 15, 2025에 액세스,
    > [[https://qdrant.tech/documentation/agentic-rag-langgraph/]{.underline}](https://qdrant.tech/documentation/agentic-rag-langgraph/)

26. LangGraph RAG Agent Tutorial \| Basics to Advanced Multi-Agent AI
    > Chatbot \| With Code, 7월 15, 2025에 액세스,
    > [[https://www.youtube.com/watch?v=60XDTWhklLA]{.underline}](https://www.youtube.com/watch?v=60XDTWhklLA)

27. Agentic RAG turns AI into a smarter digital sleuth - IBM, 7월 15,
    > 2025에 액세스,
    > [[https://www.ibm.com/think/news/ai-detectives-agentic-rag]{.underline}](https://www.ibm.com/think/news/ai-detectives-agentic-rag)

28. Agentic RAG: How It Works, Use Cases, Comparison With RAG -
    > DataCamp, 7월 15, 2025에 액세스,
    > [[https://www.datacamp.com/blog/agentic-rag]{.underline}](https://www.datacamp.com/blog/agentic-rag)

29. Agentic RAG: How It Works, Use Cases & Benefits for Enterprises, 7월
    > 15, 2025에 액세스,
    > [[https://wizr.ai/blog/agentic-rag-for-enterprise/]{.underline}](https://wizr.ai/blog/agentic-rag-for-enterprise/)

30. A Complete Guide to Agentic RAG \| Moveworks, 7월 15, 2025에 액세스,
    > [[https://www.moveworks.com/us/en/resources/blog/what-is-agentic-rag]{.underline}](https://www.moveworks.com/us/en/resources/blog/what-is-agentic-rag)

31. 30+ Agentic AI Use Cases with Real-life Examples in 2025 - Research
    > AIMultiple, 7월 15, 2025에 액세스,
    > [[https://research.aimultiple.com/agentic-ai/]{.underline}](https://research.aimultiple.com/agentic-ai/)

32. 17 Useful AI Agent Case Studies - Multimodal, 7월 15, 2025에 액세스,
    > [[https://www.multimodal.dev/post/useful-ai-agent-case-studies]{.underline}](https://www.multimodal.dev/post/useful-ai-agent-case-studies)

33. Agentic Retrieval-Augmented Generation: A Survey on Agentic RAG -
    > arXiv, 7월 15, 2025에 액세스,
    > [[https://arxiv.org/html/2501.09136v1]{.underline}](https://arxiv.org/html/2501.09136v1)

34. Part 1: An Introduction to Agentic RAG - Sajal Sharma, 7월 15,
    > 2025에 액세스,
    > [[https://sajalsharma.com/posts/introduction-to-agentic-rag/]{.underline}](https://sajalsharma.com/posts/introduction-to-agentic-rag/)

35. Agentic RAG - Open Source at Microsoft, 7월 15, 2025에 액세스,
    > [[https://microsoft.github.io/ai-agents-for-beginners/05-agentic-rag/]{.underline}](https://microsoft.github.io/ai-agents-for-beginners/05-agentic-rag/)

36. Build a more Advanced RAG and Agentic RAG Pipelines \| by Mariem
    > Jabloun - Medium, 7월 15, 2025에 액세스,
    > [[https://medium.com/@mariem.jabloun/build-a-more-advanced-rag-and-agentic-rag-pipelines-4d6f3528ac52]{.underline}](https://medium.com/@mariem.jabloun/build-a-more-advanced-rag-and-agentic-rag-pipelines-4d6f3528ac52)

37. Building Complex Multi-Agent Systems : r/AI_Agents - Reddit, 7월 15,
    > 2025에 액세스,
    > [[https://www.reddit.com/r/AI_Agents/comments/1hsnbgf/building_complex_multiagent_systems/]{.underline}](https://www.reddit.com/r/AI_Agents/comments/1hsnbgf/building_complex_multiagent_systems/)
