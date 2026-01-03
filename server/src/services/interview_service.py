"""Interview service logic."""

import uuid
from datetime import datetime, timezone

from src.models.interview import (
    EndInterviewRequest,
    InterviewSessionResponse,
    InterviewStartRequest,
    SendMessageRequest,
    SendMessageResponse,
)
from src.repositories.question_repository import QuestionRepository


class InterviewService:
    """Service that manages interview sessions."""

    def __init__(self) -> None:
        # In-memory session store (can be replaced with Redis, DB, etc.)
        self._sessions: dict[str, dict] = {}
        self._question_repo = QuestionRepository()

    async def start_session(
        self, request: InterviewStartRequest
    ) -> InterviewSessionResponse:
        """Create a new interview session."""
        session_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc).isoformat()

        self._sessions[session_id] = {
            "user_name": request.user_name,
            "job_role": request.job_role,
            "language": request.language,
            "experience": request.experience,
            "interview_type": request.interview_type,
            "resume": request.resume,
            "job_description": request.job_description,
            "created_at": created_at,
            "messages": [],
        }

        if request.language == "english":
            welcome_message = (
                f"Hi {request.user_name}! Welcome to the {request.job_role} interview. "
                "Answer comfortably."
            )
        else:
            welcome_message = (
                f"안녕하세요, {request.user_name}님! "
                f"{request.job_role} 포지션 면접에 오신 것을 환영합니다. "
                "편하게 답변해 주세요."
            )

        return InterviewSessionResponse(
            session_id=session_id,
            message=welcome_message,
            created_at=created_at,
        )

    async def process_message(
        self, request: SendMessageRequest
    ) -> SendMessageResponse:
        """Process a user message and generate an assistant response."""
        session_id = request.session_id
        if session_id not in self._sessions:
            raise ValueError(f"Session not found: {session_id}")

        session = self._sessions[session_id]
        session["messages"].append({"role": "user", "content": request.message})

        # TODO: Integrate with the actual AI agent
        ai_response = "네, 답변 감사합니다. 다음 질문으로 넘어가겠습니다."

        session["messages"].append({"role": "assistant", "content": ai_response})

        return SendMessageResponse(message=ai_response, stage=None)

    async def end_session(self, session_id: str) -> None:
        """End an interview session."""
        if session_id in self._sessions:
            del self._sessions[session_id]

    async def end_session_by_request(self, request: EndInterviewRequest) -> None:
        """End an interview session (request-based)."""
        await self.end_session(request.session_id)

    def get_questions(self, interview_type: str, role: str = None) -> list[dict]:
        """Get questions based on type and role."""
        return self._question_repo.get_questions_by_type(interview_type, role)

