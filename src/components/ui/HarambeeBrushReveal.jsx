import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * HarambeeBrushReveal
 *
 * Interactive, auto-healing dual-layer brush reveal effect for the "HARAMBEE" headline.
 *
 * Architecture:
 *  - Both the Base Layer (warm amber gradient) and Revealed Layer (Kenyan flag gradient)
 *    are rendered via the same Canvas engine with identical typography, font-size, kerning,
 *    line-height, and subpixel alignment.
 *  - An offscreen canvas handles the alpha-mask compositing (`source-in`) for the brushed strokes.
 *  - Guaranteed 100% pixel-perfect alignment so there is zero bleed, ghosting, or size mismatch.
 *  - An invisible DOM `<h2>` maintains natural document flow, responsive scaling, and SEO indexing.
 */

export default function HarambeeBrushReveal({ isVisible = true }) {
  const containerRef = useRef(null);
  const placeholderRef = useRef(null);
  const canvasRef = useRef(null);
  const offscreenCanvasRef = useRef(null);

  // Active brush points pool
  const pointsRef = useRef([]);
  const lastPosRef = useRef(null);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(null);
  const isIntersectingRef = useRef(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Initialize and sync canvas sizes with window.devicePixelRatio
  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const placeholder = placeholderRef.current;
    if (!canvas || !container || !placeholder) return;

    const rect = container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);

    const displayWidth = Math.max(rect.width, 1);
    const displayHeight = Math.max(rect.height, 1);

    const pixelWidth = Math.round(displayWidth * dpr);
    const pixelHeight = Math.round(displayHeight * dpr);

    canvas.width = pixelWidth;
    canvas.height = pixelHeight;

    // Create or resize offscreen canvas for mask compositing
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
    }
    const offscreen = offscreenCanvasRef.current;
    offscreen.width = pixelWidth;
    offscreen.height = pixelHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }

    const offCtx = offscreen.getContext('2d');
    if (offCtx) {
      offCtx.setTransform(1, 0, 0, 1, 0, 0);
      offCtx.scale(dpr, dpr);
    }
  }, []);

  // Add brush stamp with path interpolation for fluid continuous trails
  const addBrushPoint = useCallback((x, y) => {
    const points = pointsRef.current;
    const lastPos = lastPosRef.current;

    const spawnPoint = (px, py, radiusScale = 1.0) => {
      // Dynamic brush radius (~42px - 52px) for a smooth medium-width trail
      const radius = (42 + Math.random() * 8) * radiusScale;
      points.push({
        x: px,
        y: py,
        radius,
        opacity: 1.0,
      });

      // Maintain max capacity for performance
      if (points.length > 300) {
        points.shift();
      }
    };

    if (lastPos) {
      const dx = x - lastPos.x;
      const dy = y - lastPos.y;
      const dist = Math.hypot(dx, dy);
      const step = 8; // Interpolation step in CSS pixels
      const count = Math.min(Math.floor(dist / step), 24);

      for (let i = 1; i <= count; i++) {
        const t = i / (count + 1);
        spawnPoint(lastPos.x + dx * t, lastPos.y + dy * t, 0.95 + Math.random() * 0.12);
      }
    }

    spawnPoint(x, y, 1.0);
    lastPosRef.current = { x, y };

    if (!hasInteracted) {
      setHasInteracted(true);
    }
  }, [hasInteracted]);

  // Main Render Loop: Dual-Layer Compositing with subpixel precision
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;
    lastTimeRef.current = performance.now();

    const render = (now) => {
      if (!isRunning) return;

      const dt = Math.min((now - (lastTimeRef.current || now)) / 1000, 0.1);
      lastTimeRef.current = now;

      const container = containerRef.current;
      const placeholder = placeholderRef.current;
      const offscreen = offscreenCanvasRef.current;

      if (!container || !placeholder || !offscreen || !isIntersectingRef.current) {
        rafRef.current = requestAnimationFrame(render);
        return;
      }

      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      if (width <= 0 || height <= 0) {
        rafRef.current = requestAnimationFrame(render);
        return;
      }

      const offCtx = offscreen.getContext('2d');
      if (!offCtx) {
        rafRef.current = requestAnimationFrame(render);
        return;
      }

      // Compute exact typography styles from DOM element to stay in 100% sync
      const style = window.getComputedStyle(placeholder);
      const fontSize = parseFloat(style.fontSize) || 120;
      const fontWeight = style.fontWeight || '900';
      const fontFamily = style.fontFamily || "'Outfit', -apple-system, sans-serif";
      const letterSpacing = style.letterSpacing || '-0.03em';

      const textX = width / 2;
      const textY = height / 2;

      // Vertical bounds for gradients
      const textTop = textY - fontSize * 0.46;
      const textBottom = textY + fontSize * 0.46;

      // -----------------------------------------------------------------
      // STEP 1: Render Base Layer (Warm Amber Gradient) on Main Canvas
      // -----------------------------------------------------------------
      ctx.clearRect(0, 0, width, height);

      const amberGrad = ctx.createLinearGradient(0, textTop, 0, textBottom);
      amberGrad.addColorStop(0.00, 'rgba(255, 255, 255, 0.98)');
      amberGrad.addColorStop(0.45, 'rgba(217, 179, 108, 0.95)');
      amberGrad.addColorStop(0.85, 'rgba(245, 158, 11, 0.85)');
      amberGrad.addColorStop(1.00, 'rgba(222, 32, 16, 0.75)');

      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if ('letterSpacing' in ctx) {
        ctx.letterSpacing = letterSpacing;
      }
      ctx.fillStyle = amberGrad;
      ctx.fillText('HARAMBEE', textX, textY);

      // -----------------------------------------------------------------
      // STEP 2: Render Brushed Revealed Layer (Kenyan Flag Gradient)
      // -----------------------------------------------------------------
      const points = pointsRef.current;

      if (points.length > 0) {
        offCtx.clearRect(0, 0, width, height);

        // A. Draw all feathered brush stamps (Alpha Mask)
        offCtx.globalCompositeOperation = 'source-over';
        const decayRate = 0.78; // Auto-healing decay rate (~1.25s lifespan)

        for (let i = points.length - 1; i >= 0; i--) {
          const p = points[i];
          p.opacity -= decayRate * dt;

          if (p.opacity <= 0.001) {
            points.splice(i, 1);
            continue;
          }

          // Feathered radial stamp
          const gradient = offCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
          gradient.addColorStop(0, `rgba(255, 255, 255, ${p.opacity})`);
          gradient.addColorStop(0.4, `rgba(255, 255, 255, ${p.opacity * 0.85})`);
          gradient.addColorStop(0.75, `rgba(255, 255, 255, ${p.opacity * 0.3})`);
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

          offCtx.fillStyle = gradient;
          offCtx.beginPath();
          offCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          offCtx.fill();
        }

        // B. Composite the Kenya Flag Gradient Text inside the brush stamps
        if (points.length > 0) {
          offCtx.globalCompositeOperation = 'source-in';

          // Kenyan Tricolor Heritage Gradient:
          // Black (top) -> White -> Red (center) -> White -> Green (bottom)
          const kenyaGrad = offCtx.createLinearGradient(0, textTop, 0, textBottom);
          kenyaGrad.addColorStop(0.00, '#05070a');
          kenyaGrad.addColorStop(0.24, '#1b1d24');
          kenyaGrad.addColorStop(0.25, '#ffffff');
          kenyaGrad.addColorStop(0.29, '#ffffff');
          kenyaGrad.addColorStop(0.30, '#bf1e2e');
          kenyaGrad.addColorStop(0.68, '#8c111a');
          kenyaGrad.addColorStop(0.69, '#ffffff');
          kenyaGrad.addColorStop(0.73, '#ffffff');
          kenyaGrad.addColorStop(0.74, '#00843d');
          kenyaGrad.addColorStop(1.00, '#005526');

          offCtx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
          offCtx.textAlign = 'center';
          offCtx.textBaseline = 'middle';
          if ('letterSpacing' in offCtx) {
            offCtx.letterSpacing = letterSpacing;
          }
          offCtx.fillStyle = kenyaGrad;

          // Render exact matching text positioned at identical coordinates
          offCtx.fillText('HARAMBEE', textX, textY);

          // Reset composite operation on offscreen
          offCtx.globalCompositeOperation = 'source-over';

          // C. Blend masked Kenya layer seamlessly over the Base Amber Layer
          ctx.drawImage(offscreen, 0, 0, width, height);
        }
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ResizeObserver & Font Loading sync
  useEffect(() => {
    updateCanvasSize();

    const handleResize = () => updateCanvasSize();
    window.addEventListener('resize', handleResize, { passive: true });

    if (document.fonts) {
      document.fonts.ready.then(updateCanvasSize);
      if (document.fonts.addEventListener) {
        document.fonts.addEventListener('loadingdone', updateCanvasSize);
      }
    }

    const container = containerRef.current;
    let resizeObserver = null;
    if (container && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        updateCanvasSize();
      });
      resizeObserver.observe(container);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [updateCanvasSize]);

  // Viewport IntersectionObserver to pause loop and clear trails on scroll away
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersectingRef.current = entry.isIntersecting;
        if (!entry.isIntersecting) {
          // Clear points buffer when scrolled out
          pointsRef.current = [];
          lastPosRef.current = null;
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Pointer Event Handlers
  const handlePointerMove = (e) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    addBrushPoint(x, y);
  };

  const handlePointerLeave = () => {
    lastPosRef.current = null;
  };

  // Passive Touch Event Handlers (non-blocking for natural page scrolling)
  const handleTouchMove = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    const touch = e.touches[0];
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    addBrushPoint(x, y);
  };

  const handleTouchEnd = () => {
    lastPosRef.current = null;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      onTouchStart={handleTouchMove}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className="relative inline-block w-full text-center select-none cursor-crosshair py-2"
      style={{
        transform: isVisible ? 'translateY(0)' : 'translateY(60px)',
        opacity: isVisible ? 1 : 0,
        transition: 'transform 1.1s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.1s ease',
      }}
    >
      {/* 
        Invisible layout placeholder:
        Preserves natural DOM height, responsive clamp scaling, line height, and SEO indexing.
      */}
      <h2
        ref={placeholderRef}
        aria-label="HARAMBEE"
        className="font-heading font-black uppercase leading-none select-none tracking-tight invisible pointer-events-none"
        style={{
          fontSize: 'clamp(4rem, 14vw, 13rem)',
          lineHeight: 0.9,
        }}
      >
        HARAMBEE
      </h2>

      {/* 
        Dual-Layer Canvas:
        Renders both the Base Amber Layer and Revealed Kenyan Flag Layer at 100% subpixel alignment.
      */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none w-full h-full"
        style={{
          filter: 'drop-shadow(0 6px 24px rgba(0, 0, 0, 0.75)) drop-shadow(0 0 25px rgba(217, 179, 108, 0.2))',
        }}
      />

      {/* Micro-interaction hint badge */}
      <div
        className={`absolute -bottom-4 left-1/2 -translate-x-1/2 pointer-events-none transition-opacity duration-700 font-mono-tech text-[9px] uppercase tracking-widest px-3 py-1 rounded-full border border-amber-500/20 bg-black/70 backdrop-blur-sm text-amber-300/80 flex items-center gap-1.5 ${
          hasInteracted ? 'opacity-0' : 'opacity-80 hover:opacity-100'
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        <span>Brush or hover across text to reveal heritage flag</span>
      </div>
    </div>
  );
}
