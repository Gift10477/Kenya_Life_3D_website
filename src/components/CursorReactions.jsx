import { useEffect } from 'react';
import { useCursorField } from './CursorField';

export default function CursorReactions() {
  const { reducedMotion, subscribe } = useCursorField();
  useEffect(() => {
    if (reducedMotion) return undefined;
    const elements = [...document.querySelectorAll('[data-cursor-bulge]')];
    const unsubscribe = subscribe((cursor) => elements.forEach((element) => {
      const rect = element.getBoundingClientRect(); if (rect.bottom < -80 || rect.top > innerHeight + 80) return;
      const distance = Math.hypot(cursor.x - rect.left - rect.width / 2, cursor.y - rect.top - rect.height / 2);
      const bulge = Math.exp(-(distance * distance) / (2 * 460 * 460));
      const tension = Math.exp(-((distance - 410) ** 2) / (2 * 90 * 90));
      element.style.transform = `scale(${(1 + bulge * 0.055 - tension * 0.008).toFixed(4)})`;
    }));
    return () => { unsubscribe(); elements.forEach((element) => { element.style.transform = ''; }); };
  }, [reducedMotion, subscribe]);
  useEffect(() => {
    if (reducedMotion) return undefined;
    const entries = [...document.querySelectorAll('[data-ripple-text]')].map((block) => {
      const text = block.textContent; block.setAttribute('aria-label', text); block.textContent = '';
      const chars = [...text].map((character) => { const span = document.createElement('span'); span.className = 'cursor-ripple-char'; span.textContent = character === ' ' ? '\u00a0' : character; span.setAttribute('aria-hidden', 'true'); block.appendChild(span); return span; });
      return { block, text, chars };
    });
    const unsubscribe = subscribe((cursor) => entries.forEach(({ chars }) => chars.forEach((char) => { const rect = char.getBoundingClientRect(); const distance = Math.hypot(cursor.x - rect.left - rect.width / 2, cursor.y - rect.top - rect.height / 2); const falloff = Math.exp(-(distance * distance) / (2 * 300 * 300)); const wave = Math.sin(cursor.time * 7 - distance * 0.035); char.style.transform = `translate3d(0, ${(wave * falloff * 4).toFixed(2)}px, 0) rotate(${(wave * falloff * 2.2).toFixed(2)}deg)`; })));
    return () => { unsubscribe(); entries.forEach(({ block, text }) => { block.textContent = text; block.removeAttribute('aria-label'); }); };
  }, [reducedMotion, subscribe]);
  return null;
}
