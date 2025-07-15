import { ChatOpenAI } from "@langchain/openai";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { InterviewStateType } from "../types/state";

// Sample question pool for demonstration
const SAMPLE_QUESTIONS = [
  {
    id: "q1",
    text: "JavaScript의 클로저(Closure)에 대해 설명하고, 실제 사용 예시를 들어주세요.",
    category: "JavaScript",
    difficulty: "medium",
    expected_answer: "클로저는 함수와 그 함수가 선언된 렉시컬 환경의 조합입니다."
  },
  {
    id: "q2", 
    text: "React의 useEffect Hook의 동작 원리와 의존성 배열의 역할에 대해 설명해주세요.",
    category: "React",
    difficulty: "medium",
    expected_answer: "useEffect는 컴포넌트의 사이드 이펙트를 처리하는 Hook입니다."
  },
  {
    id: "q3",
    text: "데이터베이스 인덱스의 개념과 성능에 미치는 영향에 대해 설명해주세요.",
    category: "Database",
    difficulty: "hard",
    expected_answer: "인덱스는 데이터베이스 테이블의 검색 성능을 향상시키는 데이터 구조입니다."
  }
];

export async function greetingAgent(
  state: InterviewStateType
): Promise<{ 
  messages: AIMessage[]; 
  flow_control: { interview_stage: string };
  task: { question_pool: typeof SAMPLE_QUESTIONS };
}> {
  const { persona } = state;
  
  const systemPrompt = `# 페르소나 정보 (상태에서 동적으로 주입)
- 이름: ${persona.name}
- 역할: ${persona.role}
- 배경: ${persona.backstory}
- 말투 가이드라인: ${persona.style_guidelines.join(", ")}
- 현재 기분: ${persona.current_mood}

# 지시사항
위 페르소나 정보를 바탕으로, 당신의 목표는 지원자가 편안하고 긍정적인 환경에서 자신의 실력을 최대한 발휘할 수 있도록 돕는 것입니다.

사용자를 따뜻하게 환영하고, 앞으로 진행될 면접 과정(기술 질문 -> 답변 평가 -> 각 답변에 대한 피드백 제공)을 간결하게 설명해 주세요. 이 면접은 실제 평가가 아닌, 연습과 학습을 위한 좋은 기회임을 강조하여 사용자를 안심시켜야 합니다.

마지막으로, 면접을 시작할 준비가 되었는지 물어보며 대화를 마무리하세요. 기술적인 세부 사항이나 면접 질문에 대해서는 절대 언급하지 마십시오. 당신의 역할은 오직 면접의 시작을 알리는 것입니다.`;

  const model = new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0.7,
  });

  const response = await model.invoke([
    { role: "system", content: systemPrompt },
    { role: "user", content: "안녕하세요, 면접을 시작하겠습니다." }
  ]);

  return {
    messages: [new AIMessage(response.content || "")],
    flow_control: { interview_stage: "questioning" },
    task: { question_pool: SAMPLE_QUESTIONS }
  };
}

export async function questioningAgent(
  state: InterviewStateType
): Promise<{ 
  messages: AIMessage[]; 
  flow_control: { interview_stage: string };
  task: { current_question: string };
}> {
  const { persona, task, user_context } = state;
  
  const systemPrompt = `# 페르소나 정보 (상태에서 동적으로 주입)
- 역할: ${persona.role}

# 지시사항
당신은 위 페르소나에 따라 행동하는 소크라테스 방식의 적응형 기술 면접관입니다. 당신의 유일한 임무는 지원자의 기술 역량을 정확하게 측정하기 위해 가장 적절한 다음 질문을 선택하는 것입니다. 당신은 대화 상대가 아니며, 당신의 출력은 오직 질문 텍스트 그 자체여야 합니다. 어떠한 인사말이나 부가 설명도 포함해서는 안 됩니다.

**세부 지시사항:**
1. 상태 분석: 주어진 InterviewState 정보, 특히 task.last_evaluation (가장 최근 평가 결과), task.questions_asked (이미 출제된 질문), task.question_pool (남은 질문 목록), user_context.profile (사용자 기술 스택)을 분석합니다.
2. 질문 선택 (동적 난이도 조절):
   - 첫 질문: last_evaluation이 없다면, question_pool에서 '중간' 난이도의 질문을 선택합니다.
   - 이전 답변 우수 (overall_score >= 4.0): 아직 다루지 않은 새로운 주제에서 더 어려운 질문을 선택하여 지식의 깊이를 탐색합니다.
   - 이전 답변 미흡 (overall_score < 3.0): 현재 주제와 관련된 더 근본적인 개념을 묻는 질문이나 더 간단한 후속 질문을 선택하여, 사용자가 자신감을 회복하고 지식의 격차를 메울 기회를 제공합니다.
3. 질문 재구성 (Agentic RAG):
   - 선택된 질문을 제시하기 전, user_context.profile에 기술 스택 정보가 있는지 확인합니다.
   - 만약 프로필에 'JavaScript'가 있고 선택된 질문이 '자료 구조'에 관한 것이라면, 질문을 구체화하세요.`;

  // Select next question based on current state
  const availableQuestions = task.question_pool.filter(
    q => !task.questions_asked.includes(q.id)
  );
  
  if (availableQuestions.length === 0) {
    throw new Error("No more questions available");
  }

  // Simple selection logic - pick first available question
  const selectedQuestion = availableQuestions[0];
  
  return {
    messages: [new AIMessage(selectedQuestion.text)],
    flow_control: { interview_stage: "evaluating" },
    task: { current_question: selectedQuestion.text }
  };
}

export async function evaluationAgent(
  state: InterviewStateType
): Promise<{ 
  task: { 
    last_evaluation: {
      overall_score: number;
      evaluations: Array<{
        criterion: string;
        score: number;
        reasoning: string;
      }>;
      is_sufficient: boolean;
    };
    questions_asked: string[];
  };
  flow_control: { interview_stage: string };
}> {
  const { persona, task, messages } = state;
  
  // Get the user's answer from the last message
  const userAnswer = messages[messages.length - 1]?.content || "";
  
  const systemPrompt = `# 페르소나 정보 (상태에서 동적으로 주입)
- 역할: ${persona.role}

# 지시사항
당신은 위 페르소나에 명시된, 극도로 엄격하고 객관적인 평가 엔진입니다. 당신은 의견을 가지지 않으며, 오직 제공된 평가 기준표(Rubric)를 기계적인 정밀함으로 따릅니다. 당신의 유일한 기능은 주어진 [사용자 답변]을 [현재 질문]의 의도와 평가 기준표에 명시된 기준에 따라 분석하여, 구조화된 JSON 객체를 생성하는 것입니다.

**평가 기준표:**
1. 문제 이해도 (1-5점)
2. 정확성 및 기술적 깊이 (1-5점)  
3. 명확성 및 의사소통 (1-5점)
4. 구체적인 근거 및 예시 (1-5점)

현재 질문: ${task.current_question}
사용자 답변: ${userAnswer}`;

  // Simple evaluation logic for demonstration
  const evaluations = [
    {
      criterion: "문제 이해도",
      score: 4,
      reasoning: "질문의 핵심을 잘 이해하고 있습니다."
    },
    {
      criterion: "정확성 및 기술적 깊이", 
      score: 3,
      reasoning: "기본적인 개념은 이해하고 있으나 더 깊은 설명이 필요합니다."
    },
    {
      criterion: "명확성 및 의사소통",
      score: 4,
      reasoning: "설명이 명확하고 이해하기 쉽습니다."
    },
    {
      criterion: "구체적인 근거 및 예시",
      score: 3,
      reasoning: "예시가 있으나 더 구체적인 설명이 도움이 될 것 같습니다."
    }
  ];

  const overall_score = evaluations.reduce((sum, eval) => sum + eval.score, 0) / evaluations.length;
  
  // Add current question to asked questions
  const currentQuestionId = task.question_pool.find(q => q.text === task.current_question)?.id || "";
  
  return {
    task: {
      last_evaluation: {
        overall_score,
        evaluations,
        is_sufficient: overall_score >= 3.0
      },
      questions_asked: [...task.questions_asked, currentQuestionId]
    },
    flow_control: { interview_stage: "feedback" }
  };
}

export async function feedbackAgent(
  state: InterviewStateType
): Promise<{ 
  messages: AIMessage[];
  flow_control: { interview_stage: string };
}> {
  const { persona, task } = state;
  
  const systemPrompt = `# 페르소나 정보 (상태에서 동적으로 주입)
- 역할: ${persona.role}
- 말투 가이드라인: ${persona.style_guidelines.join(", ")}

# 지시사항
위 페르소나 정보를 바탕으로, 건설적이고, 격려가 되며, 교육적인 피드백을 제공하는 것이 당신의 목표입니다. 절대 비판적이거나 판단적인 태도를 취해서는 안 됩니다. 당신의 어조는 항상 지지적이며 사용자의 학습을 돕는 데 초점을 맞춰야 합니다.

**세부 지시사항:**
1. 강점 먼저 강조: 사용자가 잘한 점을 구체적으로 칭찬하세요.
2. 개선점 제안: 개선이 필요한 핵심 영역을 건설적인 방식으로 지적하세요.
3. 피드백은 간결하게 유지하고, 사용자가 압도당하지 않도록 한두 가지 핵심적인 내용에 집중하세요.

평가 결과: ${JSON.stringify(task.last_evaluation, null, 2)}`;

  const model = new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0.7,
  });

  const response = await model.invoke([
    { role: "system", content: systemPrompt },
    { role: "user", content: "피드백을 제공해 주세요." }
  ]);

  return {
    messages: [new AIMessage(response.content || "")],
    flow_control: { interview_stage: "questioning" }
  };
}

export async function farewellAgent(
  state: InterviewStateType
): Promise<{ 
  messages: AIMessage[];
  flow_control: { interview_stage: string };
}> {
  const { persona } = state;
  
  const systemPrompt = `# 페르소나 정보 (상태에서 동적으로 주입)
- 이름: ${persona.name}
- 역할: ${persona.role}

# 지시사항
위 페르소나 정보를 바탕으로, 면접을 전문적이고 긍정적으로 마무리하는 것이 당신의 역할입니다.

면접에 참여해 준 사용자의 소중한 시간에 대해 진심으로 감사를 표하세요. 모든 면접 절차가 성공적으로 완료되었음을 간결하게 알려주세요. 마지막으로, 사용자의 노력을 칭찬하고 앞으로의 구직 활동에 좋은 결과가 있기를 바란다는 격려의 말로 마무리하세요.

상태(State) 정보에 명시적인 지시가 없는 한, 최종 점수나 종합 평가 요약은 절대 제공해서는 안 됩니다. 당신의 역할은 오직 작별 인사를 하는 것입니다.`;

  const model = new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0.7,
  });

  const response = await model.invoke([
    { role: "system", content: systemPrompt },
    { role: "user", content: "면접을 마무리해 주세요." }
  ]);

  return {
    messages: [new AIMessage(response.content || "")],
    flow_control: { interview_stage: "completed" }
  };
} 