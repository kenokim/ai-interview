"""Repository for accessing interview questions."""

import json
import logging
from pathlib import Path
from typing import List, Optional

logger = logging.getLogger(__name__)


class QuestionRepository:
    """Repository for managing interview questions."""

    def __init__(self, data_dir: str | None = None) -> None:
        """Initialize the repository by loading questions from JSON files."""
        default_dir = Path(__file__).resolve().parent
        self._data_dir = Path(data_dir) if data_dir else default_dir
        self._questions: List[dict] = []
        self._load_data()

    def _load_data(self) -> None:
        """Load questions from all JSON files in the data directory."""
        if not self._data_dir.exists():
            logger.warning(f"Data directory {self._data_dir} does not exist.")
            return

        for file_path in self._data_dir.glob("*.json"):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        self._questions.extend(data)
                        logger.info(f"Loaded {len(data)} questions from {file_path.name}")
            except Exception as e:
                logger.error(f"Failed to load {file_path}: {e}")

    def get_all_questions(self) -> List[dict]:
        """Return all available questions."""
        return self._questions

    def get_questions_by_type(
        self, question_type: str, role: Optional[str] = None, limit: int = 10
    ) -> List[dict]:
        """
        Get questions filtered by type and optionally by role.

        Args:
            question_type: The type of question (e.g., 'tech', 'culture').
            role: The job role (e.g., 'backend'), optional for culture questions.
            limit: Maximum number of questions to return.

        Returns:
            A list of matching questions.
        """
        filtered = [
            q
            for q in self._questions
            if q.get("type") == question_type
            and (role is None or q.get("role") == role)
        ]
        
        # In a real scenario, we might want to shuffle here or select randomly
        return filtered[:limit]

    def get_question_by_id(self, question_id: str) -> Optional[dict]:
        """Find a question by its ID."""
        for q in self._questions:
            if q.get("id") == question_id:
                return q
        return None

