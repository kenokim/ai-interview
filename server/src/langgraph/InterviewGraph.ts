import { StateGraph, START, END, MemorySaver } from "@langchain/langgraph";
import { InterviewState, InterviewStateAnnotation } from "../types/state.js";
import { greetingAgent } from "./agents/workers/greetingAgent.js";
import { conversationAgent } from "./agents/workers/conversationAgent.js";
import { supervisorNode } from "./agents/interviewer.js";

const GREETING_AGENT = "greeting_agent" as const;
const CONVERSATION_AGENT = "conversation_agent" as const;
const SUPERVISOR = "supervisor" as const;

export class InterviewGraph {
  private graph: any;

  constructor() {
    const builder = new StateGraph(InterviewStateAnnotation)
      .addNode(GREETING_AGENT, greetingAgent)
      .addNode(CONVERSATION_AGENT, conversationAgent)
      .addNode(SUPERVISOR, supervisorNode);

    // 1. 진입점 설정: 시작하면 무조건 슈퍼바이저에게 먼저 간다.
    builder.addEdge(START, SUPERVISOR);

    // 2. 슈퍼바이저의 결정에 따라 분기
    builder.addConditionalEdges(
      SUPERVISOR,
      (state: InterviewState) => {
        const nextWorker = state.flow_control?.next_worker;
        if (nextWorker === "FINISH") {
          return END;
        }
        return nextWorker || CONVERSATION_AGENT;
      },
      {
        [GREETING_AGENT]: GREETING_AGENT,
        [CONVERSATION_AGENT]: CONVERSATION_AGENT,
        [END]: END
      }
    );

    // 3. 워커 실행 후에는 다시 슈퍼바이저에게 돌아가 다음 행동을 결정한다.
    builder.addEdge(GREETING_AGENT, SUPERVISOR);
    builder.addEdge(CONVERSATION_AGENT, SUPERVISOR);

    const checkpointer = new MemorySaver();
    this.graph = builder.compile({ checkpointer });
  }

  public compile() {
    return this.graph;
  }
}
