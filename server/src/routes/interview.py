"""Interview-related API routes."""

from fastapi import APIRouter

from src.models.interview import (
    EndInterviewRequest,
    InterviewSessionResponse,
    InterviewStartRequest,
    SendMessageRequest,
    SendMessageResponse,
)
from src.services.interview_service import InterviewService

router = APIRouter()
interview_service = InterviewService()


@router.post("/start", response_model=InterviewSessionResponse)
async def start_interview(request: InterviewStartRequest) -> InterviewSessionResponse:
    """Start a new interview session."""
    return await interview_service.start_session(request)


@router.post("/message", response_model=SendMessageResponse)
async def send_message(request: SendMessageRequest) -> SendMessageResponse:
    """Send a message to an interview session."""
    return await interview_service.process_message(request)


@router.post("/end")
async def end_interview(request: EndInterviewRequest) -> dict[str, str]:
    """End an interview session."""
    await interview_service.end_session_by_request(request)
    return {"status": "ended", "sessionId": request.session_id}


# Backward-compatible endpoints (older clients)
@router.post("/{session_id}/end")
async def end_interview_legacy(session_id: str) -> dict[str, str]:
    """End an interview session (legacy path-param endpoint)."""
    await interview_service.end_session(session_id)
    return {"status": "ended", "sessionId": session_id}


@router.get("/questions")
async def get_questions(type: str, role: str = None) -> list[dict]:
    """Get interview questions."""
    return interview_service.get_questions(type, role)

