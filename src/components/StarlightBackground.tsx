import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  maxOpacity: number;
  phase: number;
  amplitude: number;
}

interface ShootingStar {
  x: number;
  y: number;
  tailX: number;
  tailY: number;
  length: number;
  angle: number;
  speed: number;
  opacity: number;
  width: number;
  pixelSize: number;
  trail: Array<{x: number, y: number, opacity: number, size: number}>;
  tailFadeSpeed: number;
  color: string;
}

interface StarlightBackgroundProps {
  density?: number;
  shootingStarFrequency?: number;
  backgroundColor?: string;
  starsOpacity?: number;
}

export default function StarlightBackground({
  density = 0.08,
  shootingStarFrequency = 0.002,
  backgroundColor = 'transparent',
  starsOpacity = 1
}: StarlightBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const isVisibleRef = useRef<boolean>(true);

  const getGlobalState = () => {
    if (typeof window === 'undefined') return null;
    if (!(window as any).__starlightState) {
      (window as any).__starlightState = {
        stars: [] as Star[],
        shootingStars: [] as ShootingStar[],
        startTime: performance.now(),
        initialized: false
      };
    }
    return (window as any).__starlightState;
  };

  const starsRef = { get current() { return getGlobalState()?.stars || []; }, set current(v) { const state = getGlobalState(); if (state) state.stars = v; } };
  const shootingStarsRef = { get current() { return getGlobalState()?.shootingStars || []; }, set current(v) { const state = getGlobalState(); if (state) state.shootingStars = v; } };
  const startTimeRef = { get current() { return getGlobalState()?.startTime || performance.now(); }, set current(v) { const state = getGlobalState(); if (state) state.startTime = v; } };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: false });
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const resizeCanvas = () => {
      const pixelRatio = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(pixelRatio, pixelRatio);

      initStars();
    };

    const handleResize = () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(resizeCanvas, 200);
    };

    const initStars = () => {
      const globalState = getGlobalState();
      if (!globalState) return;

      if (globalState.initialized && starsRef.current.length > 0) return;

      const stars: Star[] = [];
      const area = canvas.width * canvas.height / (window.devicePixelRatio * window.devicePixelRatio);
      const starCount = Math.floor(area * density / 1000);

      for (let i = 0; i < starCount; i++) {
        const twinkleSpeed = (0.001 + Math.random() * 0.002) * (Math.random() > 0.5 ? 1 : -1);

        stars.push({
          x: Math.random() * canvas.width / window.devicePixelRatio,
          y: Math.random() * canvas.height / window.devicePixelRatio,
          size: 0.2 + Math.random() * 1.4,
          opacity: Math.random(),
          twinkleSpeed: twinkleSpeed,
          maxOpacity: 0.7 + Math.random() * 0.3,
          phase: Math.random() * Math.PI * 2,
          amplitude: 0.3 + Math.random() * 0.2
        });
      }

      starsRef.current = stars;
      globalState.initialized = true;
    };

    const createShootingStar = () => {
      const canvasWidth = canvas.width / window.devicePixelRatio;
      const canvasHeight = canvas.height / window.devicePixelRatio;
      const pixelSize = 1.2 + Math.random() * 0.3;

      let startX, startY, angle;

      if (Math.random() < 0.7) {
        startX = Math.random() * canvasWidth;
        startY = Math.random() * (canvasHeight * 0.3);
        angle = (Math.PI / 4) + (Math.random() * Math.PI / 2);
      } else {
        if (Math.random() < 0.5) {
          startX = Math.random() * (canvasWidth * 0.2);
          startY = Math.random() * (canvasHeight * 0.6);
          angle = (Math.PI / 6) + (Math.random() * Math.PI / 3);
        } else {
          startX = canvasWidth - (Math.random() * (canvasWidth * 0.2));
          startY = Math.random() * (canvasHeight * 0.6);
          angle = (Math.PI / 2) + (Math.random() * Math.PI / 3);
        }
      }

      const tailLength = 80 + Math.random() * 120;
      const tailX = startX - Math.cos(angle) * tailLength;
      const tailY = startY - Math.sin(angle) * tailLength;

      const colorBase = 220 + Math.floor(Math.random() * 35);
      const blueValue = colorBase - Math.floor(Math.random() * 20);
      const color = Math.random() < 0.9
        ? `rgb(${colorBase}, ${colorBase}, ${colorBase})`
        : `rgb(${colorBase}, ${colorBase - 10}, ${blueValue})`;

      const star: ShootingStar = {
        x: startX,
        y: startY,
        tailX: tailX,
        tailY: tailY,
        length: tailLength,
        angle: angle,
        speed: 4 + Math.random() * 3,
        opacity: 0.7 + Math.random() * 0.3,
        width: 0.6 + Math.random() * 0.4,
        pixelSize: pixelSize,
        trail: [],
        tailFadeSpeed: 0.006 + Math.random() * 0.01,
        color: color
      };

      shootingStarsRef.current.push(star);
    };

    const drawStar = (star: Star) => {
      const adjustedOpacity = star.opacity * starsOpacity;
      if (adjustedOpacity <= 0) return;

      const now = new Date();
      const isMidnight = now.getHours() === 0;
      const pulseEffect = isMidnight ? Math.sin(performance.now() / 1000) * 0.2 + 1 : 1;

      const glow = ctx!.createRadialGradient(
        star.x, star.y, 0,
        star.x, star.y, star.size * (isMidnight ? 3 : 2.5)
      );

      glow.addColorStop(0, `rgba(255, 255, 255, ${adjustedOpacity * pulseEffect})`);
      glow.addColorStop(0.5, `rgba(200, 220, 255, ${adjustedOpacity * 0.5 * pulseEffect})`);
      glow.addColorStop(1, `rgba(200, 220, 255, 0)`);

      ctx!.beginPath();
      ctx!.arc(star.x, star.y, star.size * (isMidnight ? 3 : 2.5), 0, Math.PI * 2);
      ctx!.fillStyle = glow;
      ctx!.fill();

      ctx!.beginPath();
      ctx!.arc(star.x, star.y, star.size / 2, 0, Math.PI * 2);
      ctx!.fillStyle = `rgba(255, 255, 255, ${Math.min(1, adjustedOpacity * (isMidnight ? 2 : 1.8))})`;
      ctx!.fill();

      if (isMidnight && Math.random() < 0.1) {
        const sparkleSize = star.size * (Math.random() * 0.5 + 0.5);
        ctx!.beginPath();
        for (let i = 0; i < 4; i++) {
          const angle = (Math.PI / 2) * i;
          ctx!.moveTo(star.x, star.y);
          ctx!.lineTo(
            star.x + Math.cos(angle) * sparkleSize * 2,
            star.y + Math.sin(angle) * sparkleSize * 2
          );
        }
        ctx!.strokeStyle = `rgba(255, 255, 255, ${adjustedOpacity * 0.3})`;
        ctx!.lineWidth = 0.5;
        ctx!.stroke();
      }
    };

    const drawStarShape = (x: number, y: number, size: number, opacity: number, color: string) => {
      if (opacity <= 0.05) return;

      const spikes = 5;
      const outerRadius = size;
      const innerRadius = size / 2.5;

      ctx!.save();
      ctx!.beginPath();
      ctx!.translate(x, y);
      ctx!.rotate(Math.PI / 2);

      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (Math.PI * 2 * i) / (spikes * 2);
        const pointX = Math.cos(angle) * radius;
        const pointY = Math.sin(angle) * radius;

        if (i === 0) {
          ctx!.moveTo(pointX, pointY);
        } else {
          ctx!.lineTo(pointX, pointY);
        }
      }

      ctx!.closePath();
      ctx!.fillStyle = color.replace('rgb', 'rgba').replace(')', `, ${opacity * starsOpacity})`);
      ctx!.fill();
      ctx!.restore();
    };

    const drawShootingStar = (star: ShootingStar) => {
      if (star.opacity <= 0.05) return;

      ctx!.save();

      if (star.opacity > 0.1) {
        const dx = star.tailX - star.x;
        const dy = star.tailY - star.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxPixels = 50;
        const pixelSize = Math.max(star.pixelSize, distance / maxPixels);
        const numberOfPixels = Math.min(Math.floor(distance / pixelSize), maxPixels);

        star.trail = [];

        for (let i = 0; i < numberOfPixels; i++) {
          const ratio = i / numberOfPixels;
          const jitterMultiplier = 0.5 + (star.pixelSize / 3);
          const jitterX = (Math.random() - 0.5) * star.pixelSize * jitterMultiplier;
          const jitterY = (Math.random() - 0.5) * star.pixelSize * jitterMultiplier;

          const x = star.x + dx * ratio + jitterX;
          const y = star.y + dy * ratio + jitterY;
          const opacityFactor = Math.pow(1 - ratio, 1.2);
          const opacity = star.opacity * opacityFactor;
          const size = star.pixelSize * (0.7 + Math.random() * 0.3);

          star.trail.push({ x, y, opacity, size });
        }
      }

      [...star.trail].reverse().forEach(pixel => {
        if (pixel.opacity * starsOpacity > 0.05) {
          ctx!.fillStyle = star.color.replace('rgb', 'rgba').replace(')', `, ${pixel.opacity * starsOpacity})`);
          ctx!.fillRect(
            pixel.x - pixel.size / 2,
            pixel.y - pixel.size / 2,
            pixel.size,
            pixel.size
          );
        }
      });

      const headGlow = ctx!.createRadialGradient(
        star.x, star.y, 0,
        star.x, star.y, star.width * 2
      );

      headGlow.addColorStop(0, `rgba(255, 255, 255, ${star.opacity * starsOpacity})`);
      headGlow.addColorStop(0.5, star.color.replace('rgb', 'rgba').replace(')', `, ${star.opacity * 0.6 * starsOpacity})`));
      headGlow.addColorStop(1, `rgba(200, 220, 255, 0)`);

      ctx!.beginPath();
      ctx!.arc(star.x, star.y, star.width * 1.5, 0, Math.PI * 2);
      ctx!.fillStyle = headGlow;
      ctx!.fill();

      if (star.trail.length > 0 && star.pixelSize > 2) {
        drawStarShape(
          star.tailX + (Math.random() - 0.5) * 2,
          star.tailY + (Math.random() - 0.5) * 2,
          star.pixelSize * 1.8,
          star.opacity * 0.7,
          star.color
        );
      }

      ctx!.restore();
    };

    const handleVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === 'visible';
      if (isVisibleRef.current) {
        lastFrameTimeRef.current = performance.now();
        if (!animationFrameRef.current) {
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      } else if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
    };

    const animate = (timestamp: number) => {
      if (!lastFrameTimeRef.current) {
        lastFrameTimeRef.current = timestamp;
      }

      const deltaTime = timestamp - lastFrameTimeRef.current;
      lastFrameTimeRef.current = timestamp;

      ctx!.clearRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);

      starsRef.current.forEach(star => {
        star.phase += star.twinkleSpeed * deltaTime;

        const twinkleEffect = Math.sin(star.phase) * star.amplitude;
        star.opacity = star.maxOpacity * (0.5 + twinkleEffect);

        const changeProb = 0.0001 * (deltaTime / 16.67);
        if (Math.random() < changeProb) {
          star.twinkleSpeed = (0.001 + Math.random() * 0.002) * (Math.random() > 0.5 ? 1 : -1);
          star.amplitude = 0.3 + Math.random() * 0.2;
        }

        drawStar(star);
      });

      shootingStarsRef.current = shootingStarsRef.current.filter(star => {
        const normalizedDelta = deltaTime / 16.67;
        const dx = Math.cos(star.angle) * star.speed * normalizedDelta;
        const dy = Math.sin(star.angle) * star.speed * normalizedDelta;

        star.x += dx;
        star.y += dy;
        star.tailX += dx;
        star.tailY += dy;

        star.opacity -= star.tailFadeSpeed * (deltaTime / 16);

        const padding = 50;
        const canvasWidth = canvas.width / window.devicePixelRatio;
        const canvasHeight = canvas.height / window.devicePixelRatio;

        if (
          star.x < -padding ||
          star.x > canvasWidth + padding ||
          star.y < -padding ||
          star.y > canvasHeight + padding ||
          star.opacity <= 0
        ) {
          return false;
        }

        drawShootingStar(star);
        return true;
      });

      const timeElapsed = (timestamp - startTimeRef.current) / 1000;
      const frequencyWave = Math.sin(timeElapsed / 10) * 0.2 + 1;

      const normalizedFrequency = shootingStarFrequency * frequencyWave * (deltaTime / 16.67) * starsOpacity;
      if (Math.random() < normalizedFrequency) {
        if (shootingStarsRef.current.length < 3) {
          createShootingStar();
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const globalState = getGlobalState();
    if (globalState && !globalState.startTime) {
      globalState.startTime = performance.now();
    }

    lastFrameTimeRef.current = performance.now();

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    resizeCanvas();
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [density, shootingStarFrequency, backgroundColor, starsOpacity]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{
        background: backgroundColor,
        willChange: 'contents',
      }}
    />
  );
}
