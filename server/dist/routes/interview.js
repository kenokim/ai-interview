import express from "express";
import { body, validationResult } from "express-validator";
import { interviewService } from "../services/InterviewService.js";
const router = express.Router();
// Validation middleware
const startInterviewValidation = [
    body("jobRole").isString().notEmpty(),
    body("experience").isIn(["junior", "mid-level", "senior", "lead"]),
    body("interviewType").isIn(["technical", "behavioral", "mixed"]),
    body("userName").optional().isString(),
];
const sendMessageValidation = [
    body("sessionId").isString().notEmpty(),
    body("message").isString().notEmpty(),
];
const triggerInterviewValidation = [
    body("event_type").isIn(["USER_APPLIED", "INTERVIEW_SCHEDULED"]),
    body("event_id").isString().notEmpty(),
    body("user_id").isString().notEmpty(),
    body("session_id").isString().notEmpty(),
];
const endInterviewValidation = [body("sessionId").isString().notEmpty()];
// Routes
/**
 * @swagger
 * /api/interview/start:
 *   post:
 *     summary: Start a new interview session (user-initiated)
 *     tags: [Interview]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StartInterviewRequest'
 *     responses:
 *       200:
 *         description: Interview session started successfully
 */
router.post("/start", startInterviewValidation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const response = await interviewService.startInterview(req.body);
        res.status(200).json(response);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
/**
 * @swagger
 * /api/interview/trigger:
 *   post:
 *     summary: Trigger a proactive interview session (system-initiated)
 *     tags: [Interview]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TriggerInterviewRequest'
 *     responses:
 *       202:
 *         description: Proactive interview session triggered successfully
 */
router.post("/trigger", triggerInterviewValidation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const response = await interviewService.triggerInterview(req.body);
        res.status(202).json(response); // 202 Accepted
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
/**
 * @swagger
 * /api/interview/message:
 *   post:
 *     summary: Send a message within an interview session
 *     tags: [Interview]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendMessageRequest'
 *     responses:
 *       200:
 *         description: Message sent successfully
 */
router.post("/message", sendMessageValidation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const response = await interviewService.sendMessage(req.body);
        res.status(200).json(response);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
/**
 * @swagger
 * /api/interview/status/{sessionId}:
 *   get:
 *     summary: Get the status of an interview session
 *     tags: [Interview]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session status returned successfully
 */
router.get("/status/:sessionId", async (req, res) => {
    try {
        const { sessionId } = req.params;
        const response = await interviewService.getSessionStatus(sessionId);
        res.status(200).json(response);
    }
    catch (error) {
        res.status(404).json({ message: "Session not found" });
    }
});
/**
 * @swagger
 * /api/interview/end:
 *   post:
 *     summary: End an interview session
 *     tags: [Interview]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EndInterviewRequest'
 *     responses:
 *       200:
 *         description: Interview session ended successfully
 */
router.post("/end", endInterviewValidation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const response = await interviewService.endInterview(req.body);
        res.status(200).json(response);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
/**
 * @swagger
 * /api/interview/sessions:
 *   get:
 *     summary: List all active interview sessions
 *     tags: [Interview]
 *     responses:
 *       200:
 *         description: A list of active session IDs
 */
router.get("/sessions", (req, res) => {
    try {
        const response = interviewService.listSessions();
        res.status(200).json(response);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
export default router;
//# sourceMappingURL=interview.js.map