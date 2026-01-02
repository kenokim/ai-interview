# AI Interview API Server

A Python FastAPI-based API server for the AI Interview project.

## Requirements

- Python 3.11+
- pip or uv

## Install

```bash
cd server

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate  # macOS/Linux
# .venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt
```

## Run

```bash
# Start the dev server
uvicorn src.main:app --reload --port 8000

# Or
python -m src.main
```

## Run ETL (CLI)

## Run ETL (Gemini TTS)

Generate interviewer voice WAV files from the interview-questions JSON structure.

Requirements:
- `GEMINI_API_KEY` must be set (or present in `.env`)
- `google-genai` must be installed

```bash
cd server

export GEMINI_API_KEY="YOUR_KEY"

./scripts/run_etl.sh tts --input ./src/etl/input/interview_questions_sample.json
```

WAV files are written under `server/src/etl/output/tts` by default (or pass `--output-dir`).

## API Docs

After the server is running, you can view the interactive API docs here:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
server/
├── requirements.txt      # Python dependencies
├── README.md
└── src/
    ├── __init__.py
    ├── main.py           # FastAPI app entrypoint
    ├── config.py         # Environment-based settings
    ├── models/           # Pydantic models
    │   ├── __init__.py
    │   └── interview.py
    ├── routes/           # API routes
    │   ├── __init__.py
    │   ├── health.py
    │   └── interview.py
    └── services/         # Business logic
        ├── __init__.py
        └── interview_service.py
```

## Environment Variables

Create a `.env` file to override settings:

```env
DEBUG=true
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]
```
