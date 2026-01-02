"""Pydantic models for interview-related APIs."""

from pydantic import BaseModel, Field


class InterviewStartRequest(BaseModel):
    """Request model for starting an interview."""

    candidate_name: str = Field(..., description="지원자 이름")
    position: str = Field(..., description="지원 포지션")
    interview_type: str = Field(
        default="culture_fit", description="면접 유형 (culture_fit, technical 등)"
    )


class InterviewSessionResponse(BaseModel):
    """Response model for an interview session."""

    session_id: str = Field(..., description="세션 ID")
    message: str = Field(..., description="환영 메시지")
    created_at: str = Field(..., description="세션 생성 시간")


class MessageRequest(BaseModel):
    """Request model for sending a message."""

    content: str = Field(..., description="사용자 메시지 내용")


class MessageResponse(BaseModel):
    """Response model for a message."""

    session_id: str = Field(..., description="세션 ID")
    response: str = Field(..., description="AI 응답")
    is_complete: bool = Field(default=False, description="면접 완료 여부")

