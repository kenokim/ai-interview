"""Interview-related API routes."""

from fastapi import APIRouter

from src.models.interview import (
    InterviewSessionResponse,
    InterviewStartRequest,
    MessageRequest,
    MessageResponse,
)
from src.services.interview_service import InterviewService

router = APIRouter()
interview_service = InterviewService()


@router.post("/start", response_model=InterviewSessionResponse)
async def start_interview(request: InterviewStartRequest) -> InterviewSessionResponse:
    """Start a new interview session."""
    return await interview_service.start_session(request)


@router.post("/{session_id}/message", response_model=MessageResponse)
async def send_message(session_id: str, request: MessageRequest) -> MessageResponse:
    """Send a message to an interview session."""
    return await interview_service.process_message(session_id, request)


@router.post("/{session_id}/end")
async def end_interview(session_id: str) -> dict[str, str]:
    """End an interview session."""
    await interview_service.end_session(session_id)
    return {"status": "ended", "session_id": session_id}

