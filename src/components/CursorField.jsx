import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

const CursorFieldContext = createContext(null);

export function CursorFieldProvider({ children }) {
  const field = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000, vx: 0, vy: 0, speed: 0, time: 0 });
  const listeners = useRef(new Set());
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => { const query = window.matchMedia('(prefers-reduced-motion: reduce)'); const update = () => setReducedMotion(query.matches); update(); query.addEventListener('change', update); return () => query.removeEventListener('change', update); }, []);
  useEffect(() => {
    if (reducedMotion) return undefined;
    let frame; let previous = performance.now();
    const move = (event) => { field.current.targetX = event.clientX; field.current.targetY = event.clientY; };
    const tick = (now) => { const cursor = field.current; const dt = Math.min((now - previous) / 16.667, 3); previous = now; const oldX = cursor.x; const oldY = cursor.y; cursor.x += (cursor.targetX - cursor.x) * 0.18; cursor.y += (cursor.targetY - cursor.y) * 0.18; cursor.vx = (cursor.x - oldX) / Math.max(dt, 0.001); cursor.vy = (cursor.y - oldY) / Math.max(dt, 0.001); cursor.speed = Math.min(Math.hypot(cursor.vx, cursor.vy), 42); cursor.time = now * 0.001; listeners.current.forEach((listener) => listener(cursor)); frame = requestAnimationFrame(tick); };
    window.addEventListener('pointermove', move, { passive: true }); frame = requestAnimationFrame(tick);
    return () => { window.removeEventListener('pointermove', move); cancelAnimationFrame(frame); };
  }, [reducedMotion]);
  const value = useMemo(() => ({ reducedMotion, subscribe: (listener) => { listeners.current.add(listener); return () => listeners.current.delete(listener); } }), [reducedMotion]);
  return <CursorFieldContext.Provider value={value}>{children}</CursorFieldContext.Provider>;
}

export function useCursorField() { const context = useContext(CursorFieldContext); if (!context) throw new Error('CursorFieldProvider is required'); return context; }
