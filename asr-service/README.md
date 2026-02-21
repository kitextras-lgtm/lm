# ASR (Speech-to-Text) Service

Self-hosted transcription microservice using [faster-whisper](https://github.com/SYSTRAN/faster-whisper) + FastAPI.

## Prerequisites

- **Python 3.10+**
- **ffmpeg** installed and on PATH
  - macOS: `brew install ffmpeg`
  - Ubuntu: `sudo apt-get install -y ffmpeg`

## Quick Start (Local)

```bash
cd asr-service
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000
```

First run downloads the Whisper model (~150 MB for `base`). Health check:

```bash
curl http://localhost:8000/health
```

## Docker

```bash
cd asr-service
docker build -t elevate-asr .
docker run -p 8000:8000 elevate-asr
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `WHISPER_MODEL` | `base` | Model size: `tiny`, `base`, `small`, `medium`, `large-v3` |
| `WHISPER_DEVICE` | `cpu` | `cpu` or `cuda` (NVIDIA GPU) |
| `WHISPER_COMPUTE` | `int8` | `int8` (CPU) or `float16` (GPU) |
| `ALLOWED_ORIGINS` | `http://localhost:5175,http://localhost:5173` | Comma-separated CORS origins |
| `MAX_UPLOAD_BYTES` | `26214400` (25 MB) | Max upload size |
| `MAX_DURATION_SEC` | `300` (5 min) | Max audio duration |

## API

### `POST /transcribe`

Upload an audio file, returns transcript.

```bash
curl -X POST http://localhost:8000/transcribe \
  -F "file=@recording.webm"
```

Response:
```json
{
  "request_id": "a1b2c3d4",
  "language": "en",
  "duration": 12.5,
  "text": "Hello, this is a test recording.",
  "segments": [
    { "start": 0.0, "end": 2.5, "text": " Hello, this is" },
    { "start": 2.5, "end": 4.8, "text": " a test recording." }
  ],
  "processing_time": 1.23
}
```

### `GET /health`

Returns service status and model info.

## Frontend Configuration

Add to your `.env`:

```bash
VITE_ASR_SERVICE_URL=http://localhost:8000
```

For production, point to your deployed service URL.

## Model Performance (CPU, Apple M-series)

| Model | Size | Speed (1 min audio) | Quality |
|---|---|---|---|
| `tiny` | ~75 MB | ~2s | Good for short clips |
| `base` | ~150 MB | ~4s | Recommended default |
| `small` | ~500 MB | ~10s | Better accuracy |
| `medium` | ~1.5 GB | ~25s | High accuracy |
| `large-v3` | ~3 GB | ~50s | Best accuracy |

GPU (`cuda` + `float16`) is 5-10x faster.
