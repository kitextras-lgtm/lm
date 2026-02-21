import { useState, useRef, useCallback } from 'react';
import { ASR_SERVICE_URL } from '../lib/config';

export type RecordingState = 'idle' | 'recording' | 'transcribing' | 'error';

interface UseSpeechToTextReturn {
  state: RecordingState;
  /** Duration in seconds while recording */
  duration: number;
  /** Last error message, cleared on next start */
  error: string | null;
  /** Start microphone recording */
  startRecording: () => Promise<void>;
  /** Stop recording, upload, and return transcript text */
  stopAndTranscribe: () => Promise<string | null>;
  /** Cancel recording without transcribing */
  cancelRecording: () => void;
  /** Returns current waveform amplitude data (0–255) for visualizer, or null when not recording */
  getWaveformData: () => Uint8Array | null;
}

function extractErrorMessage(err: unknown): string {
  if (err instanceof TypeError) {
    // fetch() throws TypeError for network failures — give actionable message
    return `Could not reach the transcription service at ${ASR_SERVICE_URL}. Make sure the ASR service is running (cd asr-service && uvicorn app:app --port 8000).`;
  }
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === 'string') return err;
  return 'Transcription failed. Unknown error.';
}

export function useSpeechToText(): UseSpeechToTextReturn {
  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Web Audio API refs for waveform visualizer
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const waveformBufRef = useRef<Uint8Array<ArrayBufferLike> | null>(null);

  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Tear down Web Audio
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    waveformBufRef.current = null;
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    setDuration(0);
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Microphone access is not supported in this browser.');
      setState('error');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up Web Audio analyser for waveform
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256; // 128 frequency bins — good balance of detail vs perf
      analyser.smoothingTimeConstant = 0.6;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyserRef.current = analyser;
      waveformBufRef.current = new Uint8Array(analyser.frequencyBinCount);

      // Pick best supported mime type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.start(250);
      startTimeRef.current = Date.now();
      setState('recording');

      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 100);

    } catch (err: unknown) {
      console.error('Mic access error:', err);
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setError('Microphone permission denied. Please allow mic access and try again.');
      } else {
        setError('Could not access microphone.');
      }
      setState('error');
      cleanup();
    }
  }, [cleanup]);

  const getWaveformData = useCallback((): Uint8Array<ArrayBufferLike> | null => {
    if (!analyserRef.current || !waveformBufRef.current) return null;
    analyserRef.current.getByteFrequencyData(waveformBufRef.current as Uint8Array<ArrayBuffer>);
    return waveformBufRef.current;
  }, []);

  const stopAndTranscribe = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        cleanup();
        setState('idle');
        resolve(null);
        return;
      }

      recorder.onstop = async () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        // Close audio context now — we don't need it for transcription
        if (audioCtxRef.current) {
          audioCtxRef.current.close().catch(() => {});
          audioCtxRef.current = null;
        }
        analyserRef.current = null;
        waveformBufRef.current = null;

        setState('transcribing');

        try {
          const mimeType = recorder.mimeType || 'audio/webm';
          const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
          const blob = new Blob(chunksRef.current, { type: mimeType });

          if (blob.size < 100) {
            setError('Recording too short — please hold the mic button longer.');
            setState('error');
            cleanup();
            resolve(null);
            return;
          }

          const file = new File([blob], `recording.${ext}`, { type: mimeType });
          const formData = new FormData();
          formData.append('file', file);

          const res = await fetch(`${ASR_SERVICE_URL}/transcribe`, {
            method: 'POST',
            body: formData,
          });

          if (!res.ok) {
            const detail = await res.text();
            throw new Error(detail || `Server error ${res.status}`);
          }

          const data = await res.json();
          const transcript = (data.text || '').trim();

          setState('idle');
          cleanup();
          resolve(transcript || null);

        } catch (err: unknown) {
          console.error('Transcription error:', err);
          setError(extractErrorMessage(err));
          setState('error');
          cleanup();
          resolve(null);
        }
      };

      recorder.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    });
  }, [cleanup]);

  const cancelRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = null;
      recorder.stop();
    }
    cleanup();
    setState('idle');
  }, [cleanup]);

  return {
    state,
    duration,
    error,
    startRecording,
    stopAndTranscribe,
    cancelRecording,
    getWaveformData,
  };
}
