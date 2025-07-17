import dotenv from 'dotenv';
import app from './app.js';
dotenv.config();
const PORT = process.env.PORT || 3000;
// Start the server
app.listen(PORT, () => {
    console.log(`🚀 AI Interview Server is running on port ${PORT}`);
    console.log(`🤖 API endpoints:`);
    console.log(`   POST /api/interview/start - Start new interview`);
    console.log(`   POST /api/interview/message - Send message`);
    console.log(`   GET  /api/interview/status/:sessionId - Get session status`);
    console.log(`   POST /api/interview/end - End interview`);
    console.log(`   GET  /api/interview/sessions - List all sessions`);
});
export default app;
//# sourceMappingURL=index.js.map