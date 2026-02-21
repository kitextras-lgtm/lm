import { useEffect, useRef, useCallback } from 'react';

interface WaveformVisualizerProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getWaveformData: () => Uint8Array<any> | null;
  isActive: boolean;
}

const BAR_COUNT = 28;
const BAR_MIN_HEIGHT = 3;
const BAR_MAX_HEIGHT = 28;
const FPS = 40;

export function WaveformVisualizer({ getWaveformData, isActive }: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number>(0);
  const barsRef = useRef<number[]>(Array(BAR_COUNT).fill(BAR_MIN_HEIGHT));

  const draw = useCallback((timestamp: number) => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Throttle to FPS
    const elapsed = timestamp - lastFrameRef.current;
    if (elapsed < 1000 / FPS) {
      rafRef.current = requestAnimationFrame(draw);
      return;
    }
    lastFrameRef.current = timestamp;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = getWaveformData();
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    const barWidth = Math.floor((W - (BAR_COUNT - 1) * 2) / BAR_COUNT);

    for (let i = 0; i < BAR_COUNT; i++) {
      // Sample from frequency data — focus on speech range (lower bins)
      let targetHeight: number;
      if (data) {
        // Map bar index to lower half of frequency bins (speech is 80–3000 Hz)
        const binIndex = Math.floor((i / BAR_COUNT) * (data.length * 0.5));
        const amplitude = data[binIndex] / 255; // 0–1
        targetHeight = BAR_MIN_HEIGHT + amplitude * (BAR_MAX_HEIGHT - BAR_MIN_HEIGHT);
      } else {
        // Idle — gentle random shimmer
        targetHeight = BAR_MIN_HEIGHT + Math.random() * 2;
      }

      // Smooth interpolation toward target
      const prev = barsRef.current[i];
      barsRef.current[i] = prev + (targetHeight - prev) * 0.35;

      const barH = barsRef.current[i];
      const x = i * (barWidth + 2);
      const y = (H - barH) / 2;

      // Gradient: brighter red at top, dimmer at base
      const grad = ctx.createLinearGradient(0, y, 0, y + barH);
      grad.addColorStop(0, 'rgba(248, 113, 113, 0.95)');  // #f87171
      grad.addColorStop(1, 'rgba(239, 68, 68, 0.4)');     // #ef4444

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barH, 2);
      ctx.fill();
    }

    rafRef.current = requestAnimationFrame(draw);
  }, [isActive, getWaveformData]);

  useEffect(() => {
    if (isActive) {
      rafRef.current = requestAnimationFrame(draw);
    } else {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      // Clear canvas when not active
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
      barsRef.current = Array(BAR_COUNT).fill(BAR_MIN_HEIGHT);
    }

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isActive, draw]);

  return (
    <canvas
      ref={canvasRef}
      width={140}
      height={32}
      className="shrink-0"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
