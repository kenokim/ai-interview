#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   # TTS pipeline (requires GEMINI_API_KEY)
#   ./scripts/run_etl.sh tts --input ./src/etl/input/backend_tech_questions.json
#   ./scripts/run_etl.sh tts --input ./src/etl/input/culture_fit_questions.json
#
#   # Or read JSON from stdin
#   cat ./src/etl/input/backend_tech_questions.json | ./scripts/run_etl.sh tts --input -
#
# Notes:
# - Run from the `server/` directory.
# - Output dir can be controlled with --output-dir.

if [[ $# -eq 0 ]]; then
  cat <<'EOF'
Usage:
  ./scripts/run_etl.sh tts --input ./src/etl/input/backend_tech_questions.json

Examples:
  # Option A) Set GEMINI_API_KEY in your shell
  export GEMINI_API_KEY="YOUR_KEY"
  ./scripts/run_etl.sh tts --input ./src/etl/input/backend_tech_questions.json

  # Option B) Put GEMINI_API_KEY in .env (server/.env) and run without exporting
  # GEMINI_API_KEY=YOUR_KEY
  ./scripts/run_etl.sh tts --input ./src/etl/input/backend_tech_questions.json

  # Voice control:
  # - Unified male-ish easy-going voice (default: Umbriel)
  ./scripts/run_etl.sh tts --input ./src/etl/input/backend_tech_questions.json --voice Umbriel

  # Language selection (defaults to both when omitted)
  ./scripts/run_etl.sh tts --input ./src/etl/input/backend_tech_questions.json --ko
  ./scripts/run_etl.sh tts --input ./src/etl/input/backend_tech_questions.json --en

  cat ./src/etl/input/backend_tech_questions.json | ./scripts/run_etl.sh tts --input -
EOF
  exit 0
fi

# If GEMINI_API_KEY is not set, try loading it from `.env` using python-dotenv.
if [[ -z "${GEMINI_API_KEY:-}" && -f ".env" ]]; then
  GEMINI_API_KEY="$(
    python3 - <<'PY'
from __future__ import annotations

import os
from pathlib import Path

try:
    from dotenv import dotenv_values
except Exception:
    raise SystemExit(0)

values = dotenv_values(Path(".env"))
value = (values.get("GEMINI_API_KEY") or "").strip()
print(value)
PY
  )"
  export GEMINI_API_KEY
fi

python3 -m src.etl.cli "$@"
