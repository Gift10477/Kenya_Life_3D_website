import React, { useEffect, useRef } from 'react';
import { useCursorField } from '../hooks/useCursorField';

export const MOBILE_CURSOR_CUTOFF = 768;

export default function LiquidCursor({ enabled = true }) {
  const cursor = useCursorField();
  const blobRef = useRef();
  const filterTurbulenceRef = useRef();

  useEffect(() => {
    if (!enabled || window.innerWidth < MOBILE_CURSOR_CUTOFF) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    if (blobRef.current && filterTurbulenceRef.current) {
      const { springX, springY, speed, angle, energy, timePhase } = cursor;

      // Animate multi-octave SVG turbulence seed & baseFrequency for organic continuous mutation
      const baseFreq = (0.015 + Math.sin(timePhase * 0.8) * 0.005).toFixed(4);
      filterTurbulenceRef.current.setAttribute('baseFrequency', `${baseFreq} ${(baseFreq * 1.5).toFixed(4)}`);
      filterTurbulenceRef.current.setAttribute('seed', Math.floor(timePhase * 10) % 100);

      // Directional motion stretch along velocity vector (rubber pulling effect)
      const stretch = Math.min(1.85, 1 + speed * 0.04);
      const compress = 1 / Math.sqrt(stretch);
      const radToDeg = (angle * 180) / Math.PI;

      // Invisible lens overlay transform: position at spring pos, rotate along velocity angle, scale stretch
      blobRef.current.style.transform = `translate3d(${springX}px, ${springY}px, 0) translate(-50%, -50%) rotate(${radToDeg}deg) scale(${stretch.toFixed(3)}, ${compress.toFixed(3)})`;
      blobRef.current.style.opacity = Math.min(0.85, Math.max(0.0, energy * 0.06)).toFixed(3);
    }
  }, [cursor, enabled]);

  if (!enabled) return null;

  return (
    <div className="liquid-cursor" aria-hidden="true">
      {/* SVG Multi-Octave Organic Noise & Lens Refraction Filter */}
      <svg className="liquid-cursor__filter" width="0" height="0">
        <defs>
          <filter id="organic-rubber-lens" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence
              ref={filterTurbulenceRef}
              type="fractalNoise"
              baseFrequency="0.018 0.025"
              numOctaves="3"
              result="organicNoise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="organicNoise"
              scale="24"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Invisible organic membrane lens shape */}
      <div ref={blobRef} className="organic-rubber-blob" />
    </div>
  );
}
