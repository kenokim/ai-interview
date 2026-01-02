"""
Gemini TTS adapter.

Implemented following the Gemini TTS docs referenced in:
`.cursor-docs/server/gemini_voice_generation.md`
"""

from __future__ import annotations

import wave
from pathlib import Path


class GeminiTtsError(RuntimeError):
    """Raised when Gemini TTS generation fails."""


def _write_wav_file(
    filename: Path,
    pcm: bytes,
    *,
    channels: int = 1,
    rate: int = 24000,
    sample_width: int = 2,
) -> None:
    filename.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(filename), "wb") as wf:
        wf.setnchannels(channels)
        wf.setsampwidth(sample_width)
        wf.setframerate(rate)
        wf.writeframes(pcm)


def generate_wav_from_text(
    text: str,
    *,
    output_wav_path: Path,
    api_key: str,
    model: str = "gemini-2.5-flash-preview-tts",
    voice_name: str = "Kore",
) -> Path:
    """
    Generate a single-speaker WAV file from text using Gemini native TTS.

    Notes:
    - This uses 24kHz, 16-bit PCM (s16le) per the doc examples.
    - Requires `google-genai` installed and a valid `api_key`.
    """

    try:
        from google import genai  # type: ignore
        from google.genai import types  # type: ignore
    except Exception as e:  # pragma: no cover
        raise GeminiTtsError(
            "Missing dependency for Gemini TTS. Install `google-genai`."
        ) from e

    if not text.strip():
        raise GeminiTtsError("Text must be non-empty.")

    if not api_key.strip():
        raise GeminiTtsError("GEMINI_API_KEY is required.")

    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=model,
            contents=text,
            config=types.GenerateContentConfig(
                response_modalities=["AUDIO"],
                speech_config=types.SpeechConfig(
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=types.PrebuiltVoiceConfig(
                            voice_name=voice_name,
                        )
                    )
                ),
            ),
        )

        pcm: bytes = response.candidates[0].content.parts[0].inline_data.data
        _write_wav_file(output_wav_path, pcm)
        return output_wav_path
    except Exception as e:
        raise GeminiTtsError(f"Gemini TTS generation failed: {e}") from e

