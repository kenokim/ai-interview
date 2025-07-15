import dotenv from "dotenv";
import { HumanMessage } from "@langchain/core/messages";
import { interviewerGraph } from "./graph/interviewer";

// Load environment variables
dotenv.config();

// Set up LangSmith tracing (optional)
if (process.env.LANGCHAIN_TRACING_V2 === "true") {
  process.env.LANGCHAIN_TRACING_V2 = "true";
  process.env.LANGCHAIN_PROJECT = process.env.LANGCHAIN_PROJECT || "AI_Interview_Chatbot";
}

async function main() {
  console.log("🚀 Starting AI Interview Chatbot Server...");
  
  try {
    // Test the graph with a simple message
    const initialState = {
      messages: [new HumanMessage("안녕하세요, 면접을 시작하고 싶습니다.")],
      user_context: {
        profile: {
          name: "테스트 사용자",
          experience_level: "중급",
          tech_stack: ["JavaScript", "React", "Node.js"],
          preferred_language: "Korean"
        },
        session_id: "test-session-001",
        timestamp: new Date().toISOString()
      }
    };

    console.log("📝 Testing interview graph...");
    
    // Stream the graph execution
    const stream = await interviewerGraph.stream(initialState, {
      streamMode: "values"
    });

    for await (const chunk of stream) {
      const lastMessage = chunk.messages[chunk.messages.length - 1];
      if (lastMessage) {
        console.log(`\n🤖 ${lastMessage.content}`);
        console.log(`📊 Current stage: ${chunk.flow_control.interview_stage}`);
      }
    }

    console.log("\n✅ Graph test completed successfully!");
    
  } catch (error) {
    console.error("❌ Error testing graph:", error);
  }
}

// Run the main function
if (require.main === module) {
  main().catch(console.error);
}

export { interviewerGraph }; 