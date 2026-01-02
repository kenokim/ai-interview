"""Interview service logic."""

import uuid
from datetime import datetime, timezone

from src.models.interview import (
    InterviewSessionResponse,
    InterviewStartRequest,
    MessageRequest,
    MessageResponse,
)


class InterviewService:
    """Service that manages interview sessions."""

    def __init__(self) -> None:
        # In-memory session store (can be replaced with Redis, DB, etc.)
        self._sessions: dict[str, dict] = {}

    async def start_session(
        self, request: InterviewStartRequest
    ) -> InterviewSessionResponse:
        """Create a new interview session."""
        session_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc).isoformat()

        self._sessions[session_id] = {
            "candidate_name": request.candidate_name,
            "position": request.position,
            "interview_type": request.interview_type,
            "created_at": created_at,
            "messages": [],
        }

        welcome_message = (
            f"안녕하세요, {request.candidate_name}님! "
            f"{request.position} 포지션 면접에 오신 것을 환영합니다. "
            "편하게 답변해 주세요."
        )

        return InterviewSessionResponse(
            session_id=session_id,
            message=welcome_message,
            created_at=created_at,
        )

    async def process_message(
        self, session_id: str, request: MessageRequest
    ) -> MessageResponse:
        """Process a user message and generate an assistant response."""
        if session_id not in self._sessions:
            raise ValueError(f"Session not found: {session_id}")

        session = self._sessions[session_id]
        session["messages"].append({"role": "user", "content": request.content})

        # TODO: Integrate with the actual AI agent
        ai_response = "네, 답변 감사합니다. 다음 질문으로 넘어가겠습니다."

        session["messages"].append({"role": "assistant", "content": ai_response})

        return MessageResponse(
            session_id=session_id,
            response=ai_response,
            is_complete=False,
        )

    async def end_session(self, session_id: str) -> None:
        """End an interview session."""
        if session_id in self._sessions:
            del self._sessions[session_id]

