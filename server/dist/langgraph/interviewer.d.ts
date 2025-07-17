import { InterviewStateType } from "../types/state.js";
export declare function createInterviewGraph(): import("@langchain/langgraph").CompiledStateGraph<import("@langchain/langgraph").StateType<{
    user_context: import("@langchain/langgraph").BinaryOperatorAggregate<import("../types/state.js").UserContext, import("../types/state.js").UserContext>;
    messages: import("@langchain/langgraph").BinaryOperatorAggregate<import("@langchain/core/messages").BaseMessage[], import("@langchain/core/messages").BaseMessage[]>;
    persona: import("@langchain/langgraph").BinaryOperatorAggregate<import("../types/state.js").PersonaState, import("../types/state.js").PersonaState>;
    guardrails: import("@langchain/langgraph").BinaryOperatorAggregate<import("../types/state.js").GuardrailState, import("../types/state.js").GuardrailState>;
    proactive: import("@langchain/langgraph").BinaryOperatorAggregate<import("../types/state.js").ProactiveContext, import("../types/state.js").ProactiveContext>;
    flow_control: import("@langchain/langgraph").BinaryOperatorAggregate<import("../types/state.js").FlowControlState, import("../types/state.js").FlowControlState>;
    task: import("@langchain/langgraph").BinaryOperatorAggregate<import("../types/state.js").TaskState, import("../types/state.js").TaskState>;
    evaluation: import("@langchain/langgraph").BinaryOperatorAggregate<import("../types/state.js").EvaluationState, import("../types/state.js").EvaluationState>;
}>, import("@langchain/langgraph").UpdateType<{
    user_context: import("@langchain/langgraph").BinaryOperatorAggregate<import("../types/state.js").UserContext, import("../types/state.js").UserContext>;
    messages: import("@langchain/langgraph").BinaryOperatorAggregate<import("@langchain/core/messages").BaseMessage[], import("@langchain/core/messages").BaseMessage[]>;
    persona: import("@langchain/langgraph").BinaryOperatorAggregate<import("../types/state.js").PersonaState, import("../types/state.js").PersonaState>;
    guardrails: import("@langchain/langgraph").BinaryOperatorAggregate<import("../types/state.js").GuardrailState, import("../types/state.js").GuardrailState>;
    proactive: import("@langchain/langgraph").BinaryOperatorAggregate<import("../types/state.js").ProactiveContext, import("../types/state.js").ProactiveContext>;
    flow_control: import("@langchain/langgraph").BinaryOperatorAggregate<import("../types/state.js").FlowControlState, import("../types/state.js").FlowControlState>;
    task: import("@langchain/langgraph").BinaryOperatorAggregate<import("../types/state.js").TaskState, import("../types/state.js").TaskState>;
    evaluation: import("@langchain/langgraph").BinaryOperatorAggregate<import("../types/state.js").EvaluationState, import("../types/state.js").EvaluationState>;
}>, "__start__" | "supervisor" | "technical_question_agent" | "followup_question_agent" | "evaluate_answer", {
    user_context: import("@langchain/langgraph").BinaryOperatorAggregate<import("../types/state.js").UserContext, import("../types/state.js").UserContext>;
    messages: import("@langchain/langgraph").BinaryOperatorAggregate<import("@langchain/core/messages").BaseMessage[], import("@langchain/core/messages").BaseMessage[]>;
    persona: import("@langchain/langgraph").BinaryOperatorAggregate<import("../types/state.js").PersonaState, import("../types/state.js").PersonaState>;
    guardrails: import("@langchain/langgraph").BinaryOperatorAggregate<import("../types/state.js").GuardrailState, import("../types/state.js").GuardrailState>;
    proactive: import("@langchain/langgraph").BinaryOperatorAggregate<import("../types/state.js").ProactiveContext, import("../types/state.js").ProactiveContext>;
    flow_control: import("@langchain/langgraph").BinaryOperatorAggregate<import("../types/state.js").FlowControlState, import("../types/state.js").FlowControlState>;
    task: import("@langchain/langgraph").BinaryOperatorAggregate<import("../types/state.js").TaskState, import("../types/state.js").TaskState>;
    evaluation: import("@langchain/langgraph").BinaryOperatorAggregate<import("../types/state.js").EvaluationState, import("../types/state.js").EvaluationState>;
}, {
    user_context: import("@langchain/langgraph").BinaryOperatorAggregate<import("../types/state.js").UserContext, import("../types/state.js").UserContext>;
    messages: import("@langchain/langgraph").BinaryOperatorAggregate<import("@langchain/core/messages").BaseMessage[], import("@langchain/core/messages").BaseMessage[]>;
    persona: import("@langchain/langgraph").BinaryOperatorAggregate<import("../types/state.js").PersonaState, import("../types/state.js").PersonaState>;
    guardrails: import("@langchain/langgraph").BinaryOperatorAggregate<import("../types/state.js").GuardrailState, import("../types/state.js").GuardrailState>;
    proactive: import("@langchain/langgraph").BinaryOperatorAggregate<import("../types/state.js").ProactiveContext, import("../types/state.js").ProactiveContext>;
    flow_control: import("@langchain/langgraph").BinaryOperatorAggregate<import("../types/state.js").FlowControlState, import("../types/state.js").FlowControlState>;
    task: import("@langchain/langgraph").BinaryOperatorAggregate<import("../types/state.js").TaskState, import("../types/state.js").TaskState>;
    evaluation: import("@langchain/langgraph").BinaryOperatorAggregate<import("../types/state.js").EvaluationState, import("../types/state.js").EvaluationState>;
}, import("@langchain/langgraph").StateDefinition>;
export declare function processUserInput(graph: ReturnType<typeof createInterviewGraph>, state: InterviewStateType, userInput: string): Promise<InterviewStateType>;
export declare function startInterview(graph: ReturnType<typeof createInterviewGraph>, initialState?: Partial<InterviewStateType>): Promise<InterviewStateType>;
//# sourceMappingURL=interviewer.d.ts.map