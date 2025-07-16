"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processUserInput = exports.startInterview = exports.createInterviewGraph = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const interviewer_js_1 = require("./graph/interviewer.js");
Object.defineProperty(exports, "createInterviewGraph", { enumerable: true, get: function () { return interviewer_js_1.createInterviewGraph; } });
Object.defineProperty(exports, "startInterview", { enumerable: true, get: function () { return interviewer_js_1.startInterview; } });
Object.defineProperty(exports, "processUserInput", { enumerable: true, get: function () { return interviewer_js_1.processUserInput; } });
// Load environment variables
dotenv_1.default.config();
// Validate required environment variables
if (!process.env.GOOGLE_API_KEY) {
    console.error("❌ Error: GOOGLE_API_KEY is required in .env file");
    process.exit(1);
}
async function main() {
    console.log("🚀 Starting AI Interview System with Gemini...");
    try {
        // Create the interview graph
        const graph = (0, interviewer_js_1.createInterviewGraph)();
        console.log("✅ Interview graph created successfully");
        // Start the interview
        console.log("\n📋 Starting interview session...");
        let state = await (0, interviewer_js_1.startInterview)(graph);
        // Display initial response
        const lastMessage = state.messages[state.messages.length - 1];
        console.log("🤖 AI:", lastMessage.content);
        // Simulate user interactions
        const testResponses = [
            "Yes, I'm ready to start the interview.",
            "A closure is a function that has access to variables from its outer scope even after the outer function has returned. For example, function outer() { let x = 10; return function inner() { return x; }; } const closure = outer(); console.log(closure()); // prints 10",
            "I use closures mainly for creating private variables and in event handlers.",
            "React Hooks are functions that let you use state and other React features in functional components. They differ from class components because they don't require this binding and provide a more direct API."
        ];
        for (const response of testResponses) {
            console.log("\n👤 User:", response);
            // Process user input
            state = await (0, interviewer_js_1.processUserInput)(graph, state, response);
            // Display AI response
            const aiResponse = state.messages[state.messages.length - 1];
            if (aiResponse.content) {
                console.log("🤖 AI:", aiResponse.content);
            }
            // Show current state info
            console.log("📊 Current stage:", state.task.interview_stage);
            console.log("📈 Turn count:", state.evaluation.turn_count);
            if (state.evaluation.last_evaluation) {
                console.log("⭐ Last evaluation score:", state.evaluation.last_evaluation.overall_score);
            }
            // Add delay for readability
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        console.log("\n✅ Interview simulation completed!");
    }
    catch (error) {
        console.error("❌ Error during interview:", error);
        process.exit(1);
    }
}
// Run the main function
main().catch(console.error);
//# sourceMappingURL=server.js.map