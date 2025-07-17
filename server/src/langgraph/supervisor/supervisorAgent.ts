import { PromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export function createSupervisorAgent(model: ChatGoogleGenerativeAI) {
  const supervisorPrompt = new PromptTemplate({
    template: `
당신은 AI 면접관 팀의 감독관입니다. 당신의 임무는 사용자의 요청, 현재 대화의 맥락, 그리고 사용 가능한 워커(에이전트)들을 기반으로 다음에 어떤 워커에게 작업을 위임할지 결정하는 것입니다.

사용 가능한 워커:
- technical_question_agent: 기술적 지식, 문제 해결 능력, 코딩 실력 등을 평가하기 위한 기술 질문을 생성하고 제시합니다.
- followup_question_agent: 사용자의 이전 답변에 기반하여 더 깊이 있는 질문이나 관련된 추가 질문을 생성합니다.
- FINISH: 면접을 종료할 시간이라고 판단될 때 사용합니다.

대화 기록:
{chat_history}

사용자 입력:
{input}

현재 면접 단계: {interview_stage}

사용자의 최신 입력을 바탕으로, 다음에 어떤 워커를 호출해야 할지 결정해주세요.
'FINISH'는 면접의 흐름이 자연스럽게 마무리 단계에 접어들었을 때만 선택해야 합니다.

결정:
`,
    inputVariables: ["chat_history", "input", "interview_stage"],
  });

  return supervisorPrompt.pipe(model);
} 