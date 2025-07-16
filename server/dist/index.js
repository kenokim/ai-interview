"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const interviewer_js_1 = require("./graph/interviewer.js");
// Load environment variables
dotenv_1.default.config();
// Validate required environment variables
if (!process.env.GOOGLE_API_KEY) {
    console.error("❌ Error: GOOGLE_API_KEY is required in .env file");
    process.exit(1);
}
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json());
// In-memory storage for interview sessions (in production, use Redis or database)
const interviewSessions = new Map();
const interviewGraphs = new Map();
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Start a new interview session
app.post('/api/interview/start', async (req, res) => {
    try {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        // Create interview graph
        const graph = (0, interviewer_js_1.createInterviewGraph)();
        interviewGraphs.set(sessionId, graph);
        // Start the interview
        const state = await (0, interviewer_js_1.startInterview)(graph);
        interviewSessions.set(sessionId, state);
        // Get the initial AI message
        const lastMessage = state.messages[state.messages.length - 1];
        res.json({
            success: true,
            sessionId,
            message: lastMessage.content,
            stage: state.task.interview_stage,
            turnCount: state.evaluation.turn_count
        });
    }
    catch (error) {
        console.error('Error starting interview:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to start interview session'
        });
    }
});
// Process user input and get AI response
app.post('/api/interview/message', async (req, res) => {
    try {
        const { sessionId, message } = req.body;
        if (!sessionId || !message) {
            return res.status(400).json({
                success: false,
                error: 'sessionId and message are required'
            });
        }
        // Get session data
        const currentState = interviewSessions.get(sessionId);
        const graph = interviewGraphs.get(sessionId);
        if (!currentState || !graph) {
            return res.status(404).json({
                success: false,
                error: 'Interview session not found'
            });
        }
        // Process user input
        const updatedState = await (0, interviewer_js_1.processUserInput)(graph, currentState, message);
        interviewSessions.set(sessionId, updatedState);
        // Get AI response
        const aiResponse = updatedState.messages[updatedState.messages.length - 1];
        res.json({
            success: true,
            message: aiResponse.content,
            stage: updatedState.task.interview_stage,
            turnCount: updatedState.evaluation.turn_count,
            lastEvaluation: updatedState.evaluation.last_evaluation ? {
                score: updatedState.evaluation.last_evaluation.overall_score,
                evaluations: updatedState.evaluation.last_evaluation.evaluations,
                is_sufficient: updatedState.evaluation.last_evaluation.is_sufficient
            } : null
        });
    }
    catch (error) {
        console.error('Error processing message:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process message'
        });
    }
});
// Get interview session status
app.get('/api/interview/status/:sessionId', (req, res) => {
    try {
        const { sessionId } = req.params;
        const state = interviewSessions.get(sessionId);
        if (!state) {
            return res.status(404).json({
                success: false,
                error: 'Interview session not found'
            });
        }
        res.json({
            success: true,
            stage: state.task.interview_stage,
            turnCount: state.evaluation.turn_count,
            messageCount: state.messages.length,
            lastEvaluation: state.evaluation.last_evaluation ? {
                score: state.evaluation.last_evaluation.overall_score,
                evaluations: state.evaluation.last_evaluation.evaluations,
                is_sufficient: state.evaluation.last_evaluation.is_sufficient
            } : null
        });
    }
    catch (error) {
        console.error('Error getting session status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get session status'
        });
    }
});
// End interview session
app.post('/api/interview/end', async (req, res) => {
    try {
        const { sessionId } = req.body;
        if (!sessionId) {
            return res.status(400).json({
                success: false,
                error: 'sessionId is required'
            });
        }
        const state = interviewSessions.get(sessionId);
        if (!state) {
            return res.status(404).json({
                success: false,
                error: 'Interview session not found'
            });
        }
        // Clean up session data
        interviewSessions.delete(sessionId);
        interviewGraphs.delete(sessionId);
        res.json({
            success: true,
            message: 'Interview session ended successfully',
            finalEvaluation: state.evaluation.last_evaluation ? {
                score: state.evaluation.last_evaluation.overall_score,
                evaluations: state.evaluation.last_evaluation.evaluations,
                is_sufficient: state.evaluation.last_evaluation.is_sufficient
            } : null
        });
    }
    catch (error) {
        console.error('Error ending interview:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to end interview session'
        });
    }
});
// Get all active sessions (for debugging)
app.get('/api/interview/sessions', (req, res) => {
    const sessions = Array.from(interviewSessions.keys()).map(sessionId => {
        const state = interviewSessions.get(sessionId);
        return {
            sessionId,
            stage: state?.task.interview_stage,
            turnCount: state?.evaluation.turn_count,
            messageCount: state?.messages.length
        };
    });
    res.json({
        success: true,
        sessions,
        totalSessions: sessions.length
    });
});
// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});
// Start the server
app.listen(PORT, () => {
    console.log(`🚀 AI Interview Server is running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🤖 API endpoints:`);
    console.log(`   POST /api/interview/start - Start new interview`);
    console.log(`   POST /api/interview/message - Send message`);
    console.log(`   GET  /api/interview/status/:sessionId - Get session status`);
    console.log(`   POST /api/interview/end - End interview`);
    console.log(`   GET  /api/interview/sessions - List all sessions`);
});
exports.default = app;
//# sourceMappingURL=index.js.map