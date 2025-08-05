import * as express from 'express';
import asyncHandler from 'express-async-handler';
const router = express.Router();
/**
 * @swagger
 * /voice/generate-token:
 *   post:
 *     summary: Gemini Live API 임시 인증 토큰 발급
 *     description: 클라이언트가 Gemini Live API와 안전하게 통신할 수 있도록 단기간 유효한 임시 인증 토큰을 생성하여 반환합니다. 현재 이 기능은 Gemini API에서 공식적으로 지원하는 방식이 아니므로, 개념 증명을 위한 가상 구현입니다.
 *     tags: [Voice]
 *     responses:
 *       200:
 *         description: 성공적으로 임시 토큰이 생성됨.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: 클라이언트가 사용할 임시 인증 토큰.
 *                   example: "temp_token_for_gemini_live_api"
 *       500:
 *         description: 서버 내부 오류.
 */
router.post('/generate-token', asyncHandler(async (req, res) => {
    // 참고: 현재 @google/genai SDK는 웹 클라이언트용 임시 토큰 생성 기능을 공식적으로 제공하지 않습니다.
    // 아래 코드는 향후 해당 기능이 추가될 경우를 가정한 개념 증명(Proof of Concept) 코드입니다.
    // 실제 프로덕션 환경에서는 Google Cloud IAM 등을 사용하여 서비스 계정으로 단기 수명 액세스 토큰을 생성해야 할 수 있습니다.
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        res.status(500).json({ error: 'GEMINI_API_KEY가 설정되지 않았습니다.' });
        return;
    }
    // 가상 토큰 생성 로직 (실제 구현 시 변경 필요)
    const generateTemporaryToken = async (userId) => {
        // 여기에 실제 토큰 생성 로직이 들어갑니다.
        // 예: Google Cloud IAM API를 호출하여 단기 토큰 생성
        console.log(`'${userId}' 사용자를 위한 임시 토큰 생성 시도`);
        return `temp_token_for_${userId}_${Date.now()}`;
    };
    // 실제로는 인증된 사용자 ID를 사용해야 합니다.
    const userId = 'anonymous_user';
    const token = await generateTemporaryToken(userId);
    const response = { token };
    res.status(200).json(response);
}));
export default router;
//# sourceMappingURL=voice.js.map