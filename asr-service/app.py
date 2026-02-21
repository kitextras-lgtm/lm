import os
import uuid
import time
import subprocess
import logging
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("asr-service")

app = FastAPI(title="Elevate ASR Service")

# CORS — allow configured origins (default: all localhost ports for dev)
ALLOWED_ORIGINS_RAW = os.getenv("ALLOWED_ORIGINS", "")
if ALLOWED_ORIGINS_RAW:
    ALLOWED_ORIGINS = ALLOWED_ORIGINS_RAW.split(",")
else:
    ALLOWED_ORIGINS = ["*"]  # Dev default: allow all origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,  # Must be False when allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Limits
MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_BYTES", str(25 * 1024 * 1024)))  # 25 MB
MAX_DURATION_SEC = int(os.getenv("MAX_DURATION_SEC", "300"))  # 5 minutes

# Model — loaded once at startup
MODEL_NAME = os.getenv("WHISPER_MODEL", "base")   # tiny / base / small / medium / large-v3
DEVICE     = os.getenv("WHISPER_DEVICE", "cpu")    # "cuda" for NVIDIA GPU
COMPUTE    = os.getenv("WHISPER_COMPUTE", "int8")  # "float16" on GPU

logger.info(f"Loading Whisper model '{MODEL_NAME}' on {DEVICE} ({COMPUTE})…")
model = WhisperModel(MODEL_NAME, device=DEVICE, compute_type=COMPUTE)
logger.info("Model loaded ✓")


def ffmpeg_to_wav(in_path: str, out_path: str):
    """Convert any audio/video to 16 kHz mono WAV (ideal for Whisper)."""
    cmd = [
        "ffmpeg", "-y",
        "-i", in_path,
        "-ac", "1",
        "-ar", "16000",
        "-vn",
        out_path,
    ]
    proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr.decode("utf-8", errors="ignore"))


def get_audio_duration(path: str) -> float:
    """Get duration in seconds via ffprobe. Returns 0 if ffprobe unavailable."""
    try:
        cmd = [
            "ffprobe", "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            path,
        ]
        proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return float(proc.stdout.decode().strip())
    except (ValueError, AttributeError, FileNotFoundError):
        return 0.0


@app.get("/health")
async def health():
    return {"status": "ok", "model": MODEL_NAME, "device": DEVICE}


@app.post("/transcribe")
async def transcribe(request: Request, file: UploadFile = File(...)):
    request_id = str(uuid.uuid4())[:8]
    start_time = time.time()

    # Read the upload
    data = await file.read()
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail=f"File exceeds {MAX_UPLOAD_BYTES // (1024*1024)} MB limit")

    tmp_id = str(uuid.uuid4())
    safe_name = (file.filename or "audio.webm").replace("/", "_").replace("..", "_")
    in_path  = f"/tmp/asr_{tmp_id}_{safe_name}"
    wav_path = f"/tmp/asr_{tmp_id}.wav"

    try:
        # Write upload to disk
        with open(in_path, "wb") as f:
            f.write(data)

        # Check duration before converting
        raw_dur = get_audio_duration(in_path)
        if raw_dur > MAX_DURATION_SEC:
            raise HTTPException(status_code=413, detail=f"Audio exceeds {MAX_DURATION_SEC}s limit ({raw_dur:.0f}s)")

        # Convert to 16 kHz mono WAV
        ffmpeg_to_wav(in_path, wav_path)

        # Paragraph gap threshold — pauses longer than this get a line break
        PARAGRAPH_GAP_SEC = float(os.getenv("PARAGRAPH_GAP_SEC", "1.5"))

        # Transcribe
        segments_iter, info = model.transcribe(
            wav_path,
            beam_size=5,
            vad_filter=True,
        )

        text_parts = []
        segments = []
        prev_end = None
        for seg in segments_iter:
            seg_text = seg.text.strip()
            if not seg_text:
                prev_end = seg.end
                continue

            # Insert paragraph break if gap since last segment exceeds threshold
            if prev_end is not None and (seg.start - prev_end) >= PARAGRAPH_GAP_SEC:
                text_parts.append("\n\n")
            elif text_parts:
                # Normal space between segments on the same topic
                text_parts.append(" ")

            text_parts.append(seg_text)
            prev_end = seg.end
            segments.append({
                "start": round(seg.start, 2),
                "end":   round(seg.end, 2),
                "text":  seg_text,
            })

        elapsed = time.time() - start_time
        transcript = "".join(text_parts).strip()

        logger.info(
            f"[{request_id}] model={MODEL_NAME} lang={info.language} "
            f"duration={info.duration:.1f}s segments={len(segments)} "
            f"processing={elapsed:.2f}s chars={len(transcript)}"
        )

        return {
            "request_id": request_id,
            "language": info.language,
            "duration": round(info.duration, 2),
            "text": transcript,
            "segments": segments,
            "processing_time": round(elapsed, 2),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[{request_id}] Transcription failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        for path in (in_path, wav_path):
            try:
                os.remove(path)
            except OSError:
                pass
