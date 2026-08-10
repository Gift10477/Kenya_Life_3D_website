import { useEffect, useRef } from 'react';
import { useCursorField } from './useCursorField';

export function useContentScale() {
  const cursor = useCursorField();
  const cachedElementsRef = useRef([]);

  // Cache element positions on scroll or resize
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const updateCache = () => {
      const elements = document.querySelectorAll('[data-content-scale]');
      const cache = [];

      elements.forEach((el) => {
        // Exclude interactive buttons, links, or nav elements
        if (el.closest('nav') || el.closest('button') || el.closest('a') || el.closest('header')) {
          return;
        }

        const rect = el.getBoundingClientRect();
        cache.push({
          element: el,
          centerX: rect.left + rect.width / 2,
          centerY: rect.top + rect.height / 2,
          radius: Math.max(rect.width, rect.height) / 2,
        });
      });

      cachedElementsRef.current = cache;
    };

    updateCache();
    window.addEventListener('scroll', updateCache, { passive: true });
    window.addEventListener('resize', updateCache, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateCache);
      window.removeEventListener('resize', updateCache);
    };
  }, []);

  // Update scale distortion on cursor change
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const FALLOFF_RADIUS = 300; // Radius of influence in px
    const MAX_SCALE = 0.06;     // Max scale bulge factor (+6%)

    const { x: cursorX, y: cursorY, energy } = cursor;

    cachedElementsRef.current.forEach(({ element, centerX, centerY }) => {
      const dx = cursorX - centerX;
      const dy = cursorY - centerY;
      const distSq = dx * dx + dy * dy;

      if (distSq < FALLOFF_RADIUS * FALLOFF_RADIUS) {
        const dist = Math.sqrt(distSq);
        // Gaussian falloff
        const falloff = Math.exp(-(dist * dist) / (2 * 120 * 120));
        const scaleFactor = 1 + falloff * MAX_SCALE * Math.min(1.5, 0.5 + energy * 0.05);

        element.style.transform = `scale3d(${scaleFactor.toFixed(4)}, ${scaleFactor.toFixed(4)}, 1)`;
        element.style.transition = 'transform 0.12s ease-out';
      } else {
        element.style.transform = 'scale3d(1, 1, 1)';
      }
    });
  }, [cursor]);
}
