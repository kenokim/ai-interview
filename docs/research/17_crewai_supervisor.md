# crewAI의 Supervisor (Hierarchical Process) 패턴 분석

https://github.com/crewAIInc/crewAI

crewAI의 `Hierarchical` 프로세스는 한 명의 매니저(Supervisor) 에이전트가 여러 워커(Worker) 에이전트들의 작업을 조율하는 강력한 협업 모델입니다. 이 문서는 해당 패턴의 구현 방식과 내부 프롬프트를 분석하여 동작 원리를 설명합니다.

## 1. 구현 방식 및 동작 메커니즘

Supervisor 패턴의 핵심 로직은 `src/crewai/crew.py` 파일 내에 있으며, 구현 방식과 동작 원리는 다음과 같습니다.

### 1.1. 프로세스 분기 (`kickoff` 메소드)

`Crew` 객체 생성 시 `process=Process.hierarchical`로 설정하면, `kickoff()` 메소드가 호출되었을 때 순차 프로세스가 아닌 계층적 프로세스를 실행하도록 분기됩니다.

```python
# src/crewai/crew.py:668-671
if self.process == Process.sequential:
    result = self._run_sequential_process()
elif self.process == Process.hierarchical:
    result = self._run_hierarchical_process()
```

### 1.2. 매니저 에이전트 생성 (`_create_manager_agent`)

계층적 프로세스가 시작되면, 가장 먼저 매니저(Supervisor) 역할을 수행할 `Agent`를 생성합니다. 사용자가 직접 `manager_agent`를 정의하지 않으면, crewAI는 미리 정의된 역할, 목표, 배경 스토리를 가진 기본 매니저 에이전트를 생성합니다.

```python
# src/crewai/crew.py:782-785
def _run_hierarchical_process(self) -> CrewOutput:
    """Creates and assigns a manager agent to make sure the crew completes the tasks."""
    self._create_manager_agent()
    return self._execute_tasks(self.tasks)
```

### 1.3. 워커를 '도구'로 변환 (Delegation)

매니저 에이전트 생성 시 가장 핵심적인 부분은 모든 워커 에이전트들을 매니저가 사용할 수 있는 '도구(Tool)'로 만드는 것입니다.

```python
# src/crewai/crew.py:804
tools=AgentTools(agents=self.agents).tools()
```

`AgentTools` 클래스는 `agents` 리스트에 있는 각 워커 에이전트를 'Delegate a task to a coworker' 또는 'Ask a question to a coworker'와 같은 행동을 수행하는 도구로 변환합니다. 이로써 매니저는 단순히 태스크를 전달하는 라우터가 아니라, 상황을 판단하여 가장 적절한 워커에게 작업을 위임(delegate)하는 조율자(Orchestrator)가 됩니다.

### 1.4. 모든 작업을 매니저에게 할당

마지막으로, 계층적 프로세스에서는 모든 작업(`Task`)을 매니저 에이전트에게 우선적으로 할당합니다.

```python
# src/crewai/crew.py:957-960
def _get_agent_to_use(self, task: Task) -> Optional[BaseAgent]:
    if self.process == Process.hierarchical:
        return self.manager_agent
    return task.agent
```

따라서 매니저는 작업을 전달받으면, 그 내용을 분석하고 자신의 '도구'가 된 워커 에이전트들 중 누구에게 이 일을 맡길지 결정하여 최종적으로 태스크를 실행시킵니다.

### 1.5. 순환적 조율: ReAct 기반의 동작 사이클

Supervisor는 단순히 한 번의 라우팅으로 끝나지 않고, 워커 에이전트의 작업 결과를 다시 전달받아 다음 행동을 결정하는 반복적(iterative) 조율자 역할을 수행합니다. 이 과정은 ReAct(Reasoning and Acting) 프레임워크와 유사하게 동작합니다.

매니저 에이전트는 내부적으로 다음과 같은 [생각 → 행동 → 관찰] 사이클을 반복하며 작업을 조율합니다.

1.  Thought (생각): 현재까지의 작업 내용과 목표를 바탕으로, 다음에 무엇을 해야 할지 계획합니다.
2.  Action (행동): 계획에 따라 가장 적절한 '도구'(다른 워커 에이전트)를 선택하여 실행합니다.
3.  Action Input (행동 입력): 선택한 워커 에이전트에게 전달할 구체적인 지시사항과 맥락 정보를 입력합니다.
4.  Observation (관찰): 워커 에이전트가 작업을 수행하고 반환한 결과를 받습니다.

매니저는 이 관찰(Observation) 결과를 바탕으로 다시 새로운 생각(Thought)을 시작하며 사이클을 반복하고, 모든 정보가 취합되어 최종 목표를 달성했다고 판단하면 최종 답변(`Final Answer`)을 반환합니다.

#### 실행 예시

1.  [최초 Task]: "AI 기술의 최신 동향을 조사하고, 그 내용을 바탕으로 블로그 포스트 초안을 작성하라."
2.  [매니저] Thought: 먼저 최신 동향을 조사해야 한다. '리서처' 에이전트가 가장 적합하다.
3.  [매니저] Action: `researcher_agent` (Tool)
4.  [매니저] Action Input: `{ "task": "AI 기술의 최신 동향 조사" }`
5.  [매니저] Observation: (리서처 에이전트가 조사한 결과 텍스트를 전달받음)
6.  [매니저] Thought: 조사가 완료되었다. 이제 이 결과를 바탕으로 블로그 글을 작성해야 한다. '작가' 에이전트에게 이 내용을 전달해야겠다.
7.  [매니저] Action: `writer_agent` (Tool)
8.  [매니저] Action Input: `{ "task": "다음 내용을 바탕으로 블로그 포스트 초안 작성", "context": "[리서치 결과 텍스트]" }`
9.  [매니저] Observation: (작가 에이전트가 작성한 블로그 포스트 초안을 전달받음)
10. [매니저] Thought: 모든 요구사항이 충족되었다. 최종 결과물을 정리하여 제출해야겠다.
11. [매니저] Final Answer: (최종 블로그 포스트 제출)

## 2. 매니저 에이전트 프롬프트

crewAI는 `src/crewai/translations/en.json` 파일에 매니저 에이전트의 기본 프롬프트를 정의해두었습니다. 이 프롬프트는 매니저의 정체성과 행동 방식을 규정합니다.

### 2.1. 역할, 목표, 배경 스토리 (Role, Goal, Backstory)

다음은 매니저 에이전트에게 주어지는 기본 설정값입니다.

-   Role: `Crew Manager`
    - 역할: 크루 매니저
-   Goal: `Manage the team to complete the task in the best way possible.`
    - 목표: 팀을 관리하여 최상의 방식으로 태스크를 완료하는 것.
-   Backstory: `You are a seasoned manager with a knack for getting the best out of your team. You are also known for your ability to delegate work to the right people, and to ask the right questions to get the best out of your team. Even though you don't perform tasks by yourself, you have a lot of experience in the field, which allows you to properly evaluate the work of your team members.`
    - 배경: 당신은 팀의 능력을 최대한으로 이끌어내는 노련한 매니저입니다. 적임자에게 일을 위임하고, 올바른 질문을 던져 팀원들의 최선을 이끌어내는 능력으로 알려져 있습니다. 비록 직접 태스크를 수행하지는 않지만, 해당 분야에 대한 풍부한 경험을 바탕으로 팀원들의 작업을 정확하게 평가할 수 있습니다.

### 2.2. 도구 설명 프롬프트 (Tool Description Prompt)

매니저가 워커 에이전트들을 '도구'로 사용할 때, 그 도구에 대한 설명은 다음과 같은 프롬프트 템플릿을 따릅니다.

-   업무 위임 (Delegate Work):
    ```
    Delegate a specific task to one of the following coworkers: {coworkers}
    The input to this tool should be the coworker, the task you want them to do, and ALL necessary context to execute the task, they know nothing about the task, so share absolutely everything you know, don't reference things but instead explain them.
    ```
-   질문하기 (Ask Question):
    ```
    Ask a specific question to one of the following coworkers: {coworkers}
    The input to this tool should be the coworker, the question you have for them, and ALL necessary context to ask the question properly, they know nothing about the question, so share absolutely everything you know, don't reference things but instead explain them.
    ```

이 프롬프트는 매니저가 워커에게 작업을 위임하거나 질문할 때, 모든 필요한 맥락을 명확하고 상세하게 전달하도록 유도합니다. 워커는 독립적으로 작업을 수행해야 하므로, 매니저가 가진 모든 정보를 빠짐없이 설명해줘야 한다는 점을 강조합니다.

## 3. 문제 해결 팁

복잡한 질문을 분해하고 취합하는 과정이 기대처럼 동작하지 않는다면 다음을 확인해 보세요.

-   매니저 LLM의 성능: 작업 분해, 에이전트 선택, 결과 종합 등 복잡한 추론을 위해 `gpt-4`, `claude-3-opus`와 같이 성능이 뛰어난 LLM을 `manager_llm`으로 사용하는 것이 매우 중요합니다.
-   워커 에이전트의 명확성: 각 워커 에이전트의 `role`과 `goal`이 명확하고 서로 잘 구분되어야 매니저가 "어떤 작업을 누구에게 맡길지" 쉽게 판단할 수 있습니다.
-   구체적인 태스크 설명: `crew.kickoff()`에 전달하는 초기 태스크의 `description`과 `expected_output`이 구체적이고 명확할수록, 매니저가 작업을 효과적으로 분해하고 계획을 세울 수 있습니다.

## 4. 결론

crewAI의 Supervisor 패턴은 단순한 작업 분배를 넘어, LLM의 추론 능력을 활용하여 전체 워크플로우를 동적으로 조율하는 정교한 메커니즘입니다. 매니저 에이전트는 명확한 역할(프롬프트)을 부여받고, 다른 에이전트들을 '도구'처럼 활용하여 주어진 목표를 가장 효과적으로 달성하도록 설계되었습니다.

## 5. Supervisor 구현 요약

crewAI에서 Supervisor(매니저)를 포함한 계층적 크루를 구현하려면 다음 핵심 단계를 따르세요.

1.  `Crew` 생성 시 `process` 설정:
    -   `Crew` 객체를 만들 때 `process=Process.hierarchical` 파라미터를 반드시 추가합니다.

    ```python
    from crewai import Crew, Process

    hierarchical_crew = Crew(
      # ...,
      process=Process.hierarchical
    )
    ```

2.  매니저 `LLM` 지정:
    -   복잡한 추론을 담당할 매니저를 위해 성능이 좋은 LLM을 `manager_llm`으로 지정합니다. (`gpt-4`, `claude-3-opus` 등 권장)

    ```python
    from langchain_openai import ChatOpenAI

    hierarchical_crew = Crew(
      # ...,
      process=Process.hierarchical,
      manager_llm=ChatOpenAI(model="gpt-4-turbo") # 예시
    )
    ```

3.  워커 에이전트와 태스크 정의:
    -   명확한 역할(`role`)과 목표(`goal`)를 가진 워커 에이전트들을 `agents` 리스트에 정의합니다.
    -   수행할 작업들을 `tasks` 리스트에 정의합니다. 매니저는 이 태스크들을 받아 적절한 워커에게 위임하게 됩니다.
4.  (선택) 커스텀 매니저 에이전트 사용:
    -   기본 매니저 대신 직접 만든 에이전트를 사용하고 싶다면, `manager_agent` 파라미터에 해당 에이전트를 전달할 수 있습니다. 이 경우 `manager_llm`은 보통 해당 에이전트 내에 정의됩니다.
