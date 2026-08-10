import React, { useEffect, useRef } from 'react';
import { useCursorField } from '../hooks/useCursorField';

export default function RippleText({ text, children, className = '', tag: Tag = 'h2' }) {
  const containerRef = useRef();
  const charRefs = useRef([]);
  const cursor = useCursorField();

  const contentText = text || (typeof children === 'string' ? children : '');
  const characters = contentText.split('');

  // Character distance and wave reaction loop
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const { x: cursorX, y: cursorY, timePhase, energy } = cursor;
    const INFLUENCE_RADIUS = 240;

    charRefs.current.forEach((charEl) => {
      if (!charEl) return;
      const rect = charEl.getBoundingClientRect();
      const charX = rect.left + rect.width / 2;
      const charY = rect.top + rect.height / 2;

      const dx = cursorX - charX;
      const dy = cursorY - charY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < INFLUENCE_RADIUS) {
        const falloff = Math.exp(-dist / 80);
        // Traveling wave phase
        const wave = Math.sin(dist * 0.05 - timePhase * 4) * falloff;

        const translateY = wave * (5 + energy * 0.3);
        const rotate = wave * 4;

        charEl.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0) rotate(${rotate.toFixed(2)}deg)`;
        charEl.style.color = falloff > 0.4 ? 'var(--ke-red, #CE1126)' : '';
        charEl.style.transition = 'transform 0.1s ease-out, color 0.3s ease';
      } else {
        charEl.style.transform = 'translate3d(0, 0, 0) rotate(0deg)';
        charEl.style.color = '';
      }
    });
  }, [cursor]);

  if (!contentText) {
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <Tag ref={containerRef} className={`data-ripple-text-container ${className}`} data-ripple-text>
      {characters.map((char, index) => (
        <span
          key={index}
          ref={(el) => {
            charRefs.current[index] = el;
          }}
          className="inline-block transition-transform duration-100 will-change-transform"
          style={{ display: char === ' ' ? 'inline' : 'inline-block' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </Tag>
  );
}
