import { StateGraph, END, START } from "@langchain/langgraph";
import { InterviewStateAnnotation, InterviewStateType } from "../types/state.js";
import { technicalQuestionAgent } from "./agents/workers/technicalQuestionAgent.js";
import { followupQuestionAgent } from "./agents/workers/followupQuestionAgent.js";
import { evaluateAnswer } from "./agents/workers/evaluateAnswer.js";
import { supervisorNode, interviewerNode } from "./agents/interviewer.js";

const SUPERVISOR = "supervisor" as const;
const INTERVIEWER = "Interviewer" as const;
const TECHNICAL_QUESTION_AGENT = "technical_question_agent" as const;
const FOLLOWUP_QUESTION_AGENT = "followup_question_agent" as const;
const EVALUATE_ANSWER = "evaluate_answer" as const;

export class InterviewGraph {
  private graph: any;

  constructor() {
    const graphBuilder = new StateGraph(InterviewStateAnnotation)
      .addNode(SUPERVISOR, supervisorNode)
      .addNode(INTERVIEWER, interviewerNode)
      .addNode(TECHNICAL_QUESTION_AGENT, technicalQuestionAgent)
      .addNode(FOLLOWUP_QUESTION_AGENT, followupQuestionAgent)
      .addNode(EVALUATE_ANSWER, evaluateAnswer);

    graphBuilder.addEdge(START, SUPERVISOR);

    graphBuilder.addConditionalEdges(
      SUPERVISOR,
      (state: InterviewStateType) => {
        console.log("🔀 분기 조건 확인 중 - state.next:", state.next);
        const nextNode = state.next;
        
        if (nextNode === "FINISH") {
          return END;
        }
        
        console.log("🔀 다음 노드로 이동:", nextNode);
        return nextNode;
      }
    );

    graphBuilder.addEdge(INTERVIEWER, SUPERVISOR);
    graphBuilder.addEdge(TECHNICAL_QUESTION_AGENT, SUPERVISOR);
    graphBuilder.addEdge(FOLLOWUP_QUESTION_AGENT, SUPERVISOR);
    graphBuilder.addEdge(EVALUATE_ANSWER, SUPERVISOR);

    this.graph = graphBuilder.compile();
  }

  public compile() {
    return this.graph;
  }
} 