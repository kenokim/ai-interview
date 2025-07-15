import { StateGraph, START, END } from "@langchain/langgraph";
import { InterviewStateAnnotation, InterviewStateType } from "../types/state";
import { supervisorAgent } from "../agents/supervisor";
import { 
  greetingAgent, 
  questioningAgent, 
  evaluationAgent, 
  feedbackAgent, 
  farewellAgent 
} from "../agents/workers";

// Router function to determine next node based on supervisor decision
function routeToWorker(state: InterviewStateType): string {
  const nextWorker = state.flow_control.next_worker_to_call;
  
  if (nextWorker === "FINISH") {
    return END;
  }
  
  return nextWorker || "greeting_agent";
}

// Create the main interview graph
const workflow = new StateGraph(InterviewStateAnnotation)
  // Add supervisor node
  .addNode("supervisor", supervisorAgent)
  
  // Add worker nodes
  .addNode("greeting_agent", greetingAgent)
  .addNode("questioning_agent", questioningAgent)
  .addNode("evaluation_agent", evaluationAgent)
  .addNode("feedback_agent", feedbackAgent)
  .addNode("farewell_agent", farewellAgent)
  
  // Set entry point
  .addEdge(START, "supervisor")
  
  // Add conditional edges from supervisor to workers
  .addConditionalEdges(
    "supervisor",
    routeToWorker,
    {
      "greeting_agent": "greeting_agent",
      "questioning_agent": "questioning_agent", 
      "evaluation_agent": "evaluation_agent",
      "feedback_agent": "feedback_agent",
      "farewell_agent": "farewell_agent",
      [END]: END
    }
  )
  
  // All workers return to supervisor
  .addEdge("greeting_agent", "supervisor")
  .addEdge("questioning_agent", "supervisor")
  .addEdge("evaluation_agent", "supervisor")
  .addEdge("feedback_agent", "supervisor")
  .addEdge("farewell_agent", "supervisor");

// Compile the graph
export const interviewerGraph = workflow.compile();

// Export the graph for use in langgraph.json
export default interviewerGraph; 