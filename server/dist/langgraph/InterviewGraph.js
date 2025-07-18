import { StateGraph, END, START } from "@langchain/langgraph";
import { interviewStateGraph } from "../types/state.js";
import { technicalQuestionAgent } from "./agents/workers/technicalQuestionAgent.js";
import { followupQuestionAgent } from "./agents/workers/followupQuestionAgent.js";
import { evaluateAnswer } from "./agents/workers/evaluateAnswer.js";
import { supervisorNode, interviewerNode } from "./agents/interviewer.js";
const SUPERVISOR = "supervisor";
const INTERVIEWER = "Interviewer";
const TECHNICAL_QUESTION_AGENT = "technical_question_agent";
const FOLLOWUP_QUESTION_AGENT = "followup_question_agent";
const EVALUATE_ANSWER = "evaluate_answer";
export class InterviewGraph {
    graph;
    constructor() {
        const graphBuilder = new StateGraph(interviewStateGraph)
            .addNode(SUPERVISOR, supervisorNode)
            .addNode(INTERVIEWER, interviewerNode)
            .addNode(TECHNICAL_QUESTION_AGENT, technicalQuestionAgent)
            .addNode(FOLLOWUP_QUESTION_AGENT, followupQuestionAgent)
            .addNode(EVALUATE_ANSWER, evaluateAnswer);
        graphBuilder.addEdge(START, SUPERVISOR);
        graphBuilder.addConditionalEdges(SUPERVISOR, (state) => {
            console.log("🔀 분기 조건 확인 중 - state.next:", state.next);
            const nextNode = state.next;
            if (nextNode === "FINISH" || !nextNode) {
                return END;
            }
            console.log("🔀 다음 노드로 이동:", nextNode);
            return nextNode;
        });
        graphBuilder.addEdge(INTERVIEWER, SUPERVISOR);
        graphBuilder.addEdge(TECHNICAL_QUESTION_AGENT, SUPERVISOR);
        graphBuilder.addEdge(FOLLOWUP_QUESTION_AGENT, SUPERVISOR);
        graphBuilder.addEdge(EVALUATE_ANSWER, SUPERVISOR);
        this.graph = graphBuilder.compile();
    }
    compile() {
        return this.graph;
    }
}
//# sourceMappingURL=InterviewGraph.js.map