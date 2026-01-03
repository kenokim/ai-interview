"""Pipeline: interview questions JSON -> WAV files (ko/en)."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable, Mapping

from src.etl.tts.gemini_tts import generate_wav_from_text


logger = logging.getLogger(__name__)

DIRECTOR_NOTES_KO = "차분하고 친근한 남자 면접관 목소리로, 유연하고 자연스럽게 또렷하게 말해줘."
DIRECTOR_NOTES_EN = "Say in a calm, friendly, flexible male interviewer voice, clearly and naturally."


@dataclass(frozen=True)
class QuestionVoiceArtifactType:
    question_id: str
    language: str
    wav_path: Path


def _build_tts_prompt(*, text: str, lang: str) -> str:
    transcript = text.strip()
    if not transcript:
        raise ValueError("Transcript must be non-empty.")

    if lang == "ko":
        director_notes = DIRECTOR_NOTES_KO
    elif lang == "en":
        director_notes = DIRECTOR_NOTES_EN
    else:
        raise ValueError(f"Unsupported language: {lang}")

    # Keep a stable prompt structure (Director’s Notes + Transcript) for consistency.
    return f"## DIRECTOR'S NOTES\n{director_notes}\n\n## TRANSCRIPT\n{transcript}\n"


def _iter_questions(payload: Any) -> Iterable[Mapping[str, Any]]:
    """
    Accept either:
    - a list of question objects
    - an object with { "questions": [...] }
    """

    if isinstance(payload, list):
        for item in payload:
            if isinstance(item, dict):
                yield item
        return

    if isinstance(payload, dict):
        maybe = payload.get("questions")
        if isinstance(maybe, list):
            for item in maybe:
                if isinstance(item, dict):
                    yield item


def _safe_filename(value: str) -> str:
    keep = []
    for ch in value.strip():
        if ch.isalnum() or ch in ("-", "_"):
            keep.append(ch)
        else:
            keep.append("_")
    return "".join(keep) or "item"


def run_questions_json_to_voice(
    payload: Any,
    *,
    output_dir: Path,
    api_key: str,
    model: str = "gemini-2.5-flash-preview-tts",
    voice_name: str = "Umbriel",
    languages: tuple[str, ...] = ("ko", "en"),
    include_question_ids: set[str] | None = None,
) -> tuple[list[QuestionVoiceArtifactType], list[dict]]:
    """
    Generate WAV files for each question, for each requested language.

    Returns:
        A tuple of (artifacts, enriched_questions).
        enriched_questions is a list of the original question dicts with an added 'audio' field:
        {
            ...original_fields,
            "audio": {
                "ko": "filename.ko.wav",
                "en": "filename.en.wav"
            }
        }
    """

    output_dir.mkdir(parents=True, exist_ok=True)

    artifacts: list[QuestionVoiceArtifactType] = []
    enriched_questions: list[dict] = []

    logger.info(
        "TTS start: output_dir=%s model=%s voice=%s languages=%s",
        str(output_dir),
        model,
        voice_name,
        ",".join(languages),
    )
    for q in _iter_questions(payload):
        qid = str(q.get("id", "unknown"))
        if include_question_ids is not None and qid not in include_question_ids:
            logger.info("Skip question: not in include list (id=%s)", qid)
            continue

        qid_safe = _safe_filename(qid)
        q_texts = q.get("question")
        if not isinstance(q_texts, dict):
            logger.warning("Skip question: invalid question field (id=%s)", qid)
            continue
        
        # Create a copy to enrich
        enriched_q = dict(q)
        audio_map = {}

        for lang in languages:
            text = q_texts.get(lang)
            if not isinstance(text, str) or not text.strip():
                logger.warning("Skip question language: empty text (id=%s lang=%s)", qid, lang)
                continue

            filename = f"{qid_safe}.{lang}.wav"
            wav_path = output_dir / filename
            prompt = _build_tts_prompt(text=text, lang=lang)
            
            # Generate WAV
            generate_wav_from_text(
                prompt,
                output_wav_path=wav_path,
                api_key=api_key,
                model=model,
                voice_name=voice_name,
            )
            
            logger.info(
                "TTS generated: id=%s lang=%s wav=%s model=%s voice=%s chars=%d",
                qid,
                lang,
                str(wav_path),
                model,
                voice_name,
                len(text.strip()),
            )
            
            artifacts.append(
                QuestionVoiceArtifactType(
                    question_id=qid,
                    language=lang,
                    wav_path=wav_path,
                )
            )
            audio_map[lang] = filename
        
        enriched_q["audio"] = audio_map
        enriched_questions.append(enriched_q)

    logger.info("TTS done: count=%d output_dir=%s", len(artifacts), str(output_dir))
    return artifacts, enriched_questions

