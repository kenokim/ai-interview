"""CLI entrypoint for the ETL pipelines."""

from __future__ import annotations

import argparse
import json
import logging
import sys
from pathlib import Path
from typing import Any

from src.etl.tts.questions_to_voice import run_questions_json_to_voice


def _read_json(path: str) -> Any:
    if path == "-":
        raw = sys.stdin.read()
    else:
        raw = Path(path).read_text(encoding="utf-8")

    return json.loads(raw)


def main(argv: list[str] | None = None) -> int:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )
    parser = argparse.ArgumentParser(prog="etl-run")
    sub = parser.add_subparsers(dest="cmd", required=True)

    tts_cmd = sub.add_parser(
        "tts",
        help="Run ETL: interview questions JSON -> WAV files (ko/en) via Gemini TTS.",
    )
    tts_cmd.add_argument("--input", required=True, help="Path to questions JSON file. Use '-' for stdin.")
    tts_cmd.add_argument(
        "--output-dir",
        required=False,
        default=None,
        help="Directory to write WAV files to. Defaults to server/src/etl/output/tts.",
    )
    tts_cmd.add_argument(
        "--model",
        required=False,
        default="gemini-2.5-flash-preview-tts",
        help="Gemini model name for native TTS.",
    )
    tts_cmd.add_argument(
        "--voice",
        required=False,
        default="Umbriel",
        help="Prebuilt voice name applied to ALL questions (default: Umbriel - Easy-going).",
    )
    tts_cmd.add_argument(
        "--voice-tech",
        required=False,
        default="",
        help="(Deprecated) Use --voice instead.",
    )
    tts_cmd.add_argument(
        "--voice-culture",
        required=False,
        default="",
        help="(Deprecated) Use --voice instead.",
    )
    tts_cmd.add_argument(
        "--languages",
        required=False,
        default="ko,en",
        help="(Deprecated) Comma-separated languages to generate (default: ko,en). Prefer --ko/--en flags.",
    )
    tts_cmd.add_argument(
        "--ko",
        action="store_true",
        help="Generate Korean (ko) audio. If neither --ko nor --en is set, defaults to both.",
    )
    tts_cmd.add_argument(
        "--en",
        action="store_true",
        help="Generate English (en) audio. If neither --ko nor --en is set, defaults to both.",
    )
    tts_cmd.add_argument(
        "--ids",
        required=False,
        default="",
        help="Comma-separated question IDs to generate (e.g., q-culture-001,q-culture-002). Defaults to all.",
    )

    args = parser.parse_args(argv)

    if args.cmd == "tts":
        default_out = Path(__file__).resolve().parent / "output" / "tts"
        output_dir = Path(args.output_dir) if args.output_dir else default_out
        payload = _read_json(args.input)

        # Load .env if present, then read GEMINI_API_KEY from environment.
        try:
            from dotenv import load_dotenv  # type: ignore

            load_dotenv()
        except Exception:
            # Optional dependency; environment variables still work.
            pass

        import os

        api_key = os.environ.get("GEMINI_API_KEY", "").strip()

        selected_langs: list[str] = []
        if bool(args.ko):
            selected_langs.append("ko")
        if bool(args.en):
            selected_langs.append("en")

        if not selected_langs:
            # Backward compat: support the old --languages flag, but default to ko+en.
            if str(args.languages).strip() and str(args.languages).strip() != "ko,en":
                selected_langs = [s.strip() for s in str(args.languages).split(",") if s.strip()]
            else:
                selected_langs = ["ko", "en"]

        languages = tuple(selected_langs)
        # Backward compat: if someone still passes --voice-tech/--voice-culture,
        # we accept it, but a single unified voice is used for all questions.
        voice_name = str(args.voice).strip() or str(args.voice_tech).strip() or str(args.voice_culture).strip()
        include_question_ids = (
            {s.strip() for s in str(args.ids).split(",") if s.strip()} if str(args.ids).strip() else None
        )
        artifacts, enriched_data = run_questions_json_to_voice(
            payload,
            output_dir=output_dir,
            api_key=api_key,
            model=str(args.model),
            voice_name=voice_name,
            languages=languages,
            include_question_ids=include_question_ids,
        )

        # Save the enriched JSON
        if args.input == "-":
            out_json_name = "questions_with_audio.json"
        else:
            out_json_name = Path(args.input).name
        
        out_json_path = output_dir / out_json_name
        out_json_path.write_text(json.dumps(enriched_data, ensure_ascii=False, indent=2), encoding="utf-8")
        logging.getLogger(__name__).info("Saved enriched JSON to %s", out_json_path)

        out = {
            "count": len(artifacts),
            "output_dir": str(output_dir),
            "output_json": str(out_json_path),
            "files": [
                {
                    "question_id": a.question_id,
                    "language": a.language,
                    "wav_path": str(a.wav_path),
                }
                for a in artifacts
            ],
        }
        sys.stdout.write(json.dumps(out, ensure_ascii=False, indent=2))
        sys.stdout.write("\n")
        return 0

    raise ValueError(f"Unknown command: {args.cmd}")


if __name__ == "__main__":
    raise SystemExit(main())


