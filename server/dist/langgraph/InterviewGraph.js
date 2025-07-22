import { StateGraph, END, START } from "@langchain/langgraph";
import { interviewStateGraph } from "../types/state.js";
import { supervisorNode } from "./agents/interviewer.js";
import { greetingAgent } from "./agents/workers/greetingAgent.js";
import { technicalQuestionAgent } from "./agents/workers/technicalQuestionAgent.js";
import { evaluateAnswerAgent } from "./agents/workers/evaluateAnswer.js";
import { feedbackAgent } from "./agents/workers/feedbackAgent.js";
import { farewellAgent } from "./agents/workers/farewellAgent.js";
const SUPERVISOR = "supervisor";
const GREETING_AGENT = "greeting_agent";
const QUESTIONING_AGENT = "questioning_agent";
const EVALUATION_AGENT = "evaluation_agent";
const FEEDBACK_AGENT = "feedback_agent";
const FAREWELL_AGENT = "farewell_agent";
export class InterviewGraph {
    graph;
    constructor() {
        const graphBuilder = new StateGraph(interviewStateGraph)
            .addNode(SUPERVISOR, supervisorNode)
            .addNode(GREETING_AGENT, greetingAgent)
            .addNode(QUESTIONING_AGENT, technicalQuestionAgent)
            .addNode(EVALUATION_AGENT, evaluateAnswerAgent)
            .addNode(FEEDBACK_AGENT, feedbackAgent)
            .addNode(FAREWELL_AGENT, farewellAgent);
        graphBuilder.addEdge(START, SUPERVISOR);
        graphBuilder.addConditionalEdges(SUPERVISOR, (state) => {
            console.log("분기 조건 확인 중 - next_worker:", state.flow_control.next_worker);
            const nextNode = state.flow_control.next_worker;
            if (nextNode === "FINISH" || !nextNode) {
                return END;
            }
            // 노드 이름 매핑
            const nodeMapping = {
                "greeting_agent": GREETING_AGENT,
                "questioning_agent": QUESTIONING_AGENT,
                "evaluation_agent": EVALUATION_AGENT,
                "feedback_agent": FEEDBACK_AGENT,
                "farewell_agent": FAREWELL_AGENT,
                "technical_question_agent": QUESTIONING_AGENT, // 호환성을 위해
            };
            const mappedNode = nodeMapping[nextNode] || nextNode;
            console.log("다음 노드로 이동:", nextNode, "→", mappedNode);
            return mappedNode;
        });
        // 모든 Worker 에이전트들은 작업 완료 후 Supervisor로 제어권을 반환
        graphBuilder.addEdge(GREETING_AGENT, SUPERVISOR);
        graphBuilder.addEdge(QUESTIONING_AGENT, SUPERVISOR);
        graphBuilder.addEdge(EVALUATION_AGENT, SUPERVISOR);
        graphBuilder.addEdge(FEEDBACK_AGENT, SUPERVISOR);
        graphBuilder.addEdge(FAREWELL_AGENT, SUPERVISOR);
        this.graph = graphBuilder.compile();
    }
    compile() {
        return this.graph;
    }
}
//# sourceMappingURL=InterviewGraph.js.map