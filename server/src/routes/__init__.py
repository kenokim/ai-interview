"""API routes module."""

from fastapi import APIRouter

from src.routes.interview import router as interview_router

api_router = APIRouter()

api_router.include_router(interview_router, prefix="/interview", tags=["Interview"])

