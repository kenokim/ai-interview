"""Pydantic models for interview-related APIs."""

from pydantic import BaseModel, ConfigDict, Field


class InterviewStartRequest(BaseModel):
    """Request model for starting an interview."""

    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    job_role: str = Field(..., alias="jobRole", description="Job role")
    language: str = Field(..., description="Language (korean/english)")
    experience: str = Field(..., description="Experience level (junior/mid-level/senior)")
    interview_type: str = Field(..., alias="interviewType", description="Interview type (technical/culture)")
    resume: str = Field(default="", description="Resume text")
    job_description: str = Field(default="", alias="jobDescription", description="Job description text")
    user_name: str = Field(default="User", alias="userName", description="User name")


class InterviewSessionResponse(BaseModel):
    """Response model for an interview session."""

    model_config = ConfigDict(populate_by_name=True)

    session_id: str = Field(..., alias="sessionId", description="Session ID")
    message: str = Field(..., description="Welcome message")
    created_at: str = Field(..., alias="createdAt", description="Session created time (ISO-8601)")
    stage: str | None = Field(default=None, description="Optional stage label")


class SendMessageRequest(BaseModel):
    """Request model for sending a message in an interview session."""

    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    session_id: str = Field(..., alias="sessionId", description="Session ID")
    message: str = Field(..., description="User message")


class SendMessageResponse(BaseModel):
    """Response model for a message."""

    message: str = Field(..., description="AI response message")
    stage: str | None = Field(default=None, description="Optional stage label")


class EndInterviewRequest(BaseModel):
    """Request model for ending an interview session."""

    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    session_id: str = Field(..., alias="sessionId", description="Session ID")

