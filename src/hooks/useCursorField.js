import { useEffect, useState } from 'react';

// Shared singleton state for cursor field tracking to avoid duplicate event listeners
let cursorState = {
  x: -500,
  y: -500,
  springX: -500,
  springY: -500,
  vx: 0,
  vy: 0,
  speed: 0,
  angle: 0, // Motion direction angle in radians
  energy: 0,
  timePhase: 0,
};

const listeners = new Set();

function notifyListeners() {
  listeners.forEach((listener) => listener(cursorState));
}

let isInitialized = false;
let animFrameId = null;

function initCursorTracker() {
  if (isInitialized || typeof window === 'undefined') return;
  isInitialized = true;

  const mouse = { x: -500, y: -500 };
  const prevMouse = { x: -500, y: -500 };
  let lastTime = performance.now();

  const STIFFNESS = 0.24;
  const DAMPING = 0.65;

  const handlePointerMove = (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  };

  const updatePhysics = (now) => {
    const dt = Math.max(1, now - lastTime) / 1000;
    lastTime = now;

    // Calculate mouse speed and velocity vector
    const dx = mouse.x - prevMouse.x;
    const dy = mouse.y - prevMouse.y;
    const rawSpeed = Math.sqrt(dx * dx + dy * dy);

    prevMouse.x = mouse.x;
    prevMouse.y = mouse.y;

    // Direction angle along velocity vector
    const angle = rawSpeed > 0.5 ? Math.atan2(dy, dx) : cursorState.angle;

    // Spring displacement to target
    const dispX = mouse.x - cursorState.springX;
    const dispY = mouse.y - cursorState.springY;

    // Damped harmonic oscillator
    const ax = dispX * STIFFNESS - cursorState.vx * DAMPING;
    const ay = dispY * STIFFNESS - cursorState.vy * DAMPING;

    const newVx = cursorState.vx + ax;
    const newVy = cursorState.vy + ay;
    const springX = cursorState.springX + newVx;
    const springY = cursorState.springY + newVy;

    const springSpeed = Math.sqrt(newVx * newVx + newVy * newVy);

    // Energy driven by velocity + displacement tension
    const targetEnergy = rawSpeed * 1.5 + Math.sqrt(dispX * dispX + dispY * dispY) * 0.3;
    const energy = cursorState.energy + (targetEnergy - cursorState.energy) * 0.2;

    const timePhase = cursorState.timePhase + 0.015 + energy * 0.005;

    cursorState = {
      x: mouse.x,
      y: mouse.y,
      springX,
      springY,
      vx: newVx,
      vy: newVy,
      speed: springSpeed,
      angle,
      energy: Math.max(0, energy * 0.92), // decay when resting
      timePhase,
    };

    notifyListeners();
    animFrameId = requestAnimationFrame(updatePhysics);
  };

  window.addEventListener('pointermove', handlePointerMove, { passive: true });
  animFrameId = requestAnimationFrame(updatePhysics);
}

export function useCursorField() {
  const [state, setState] = useState(cursorState);

  useEffect(() => {
    initCursorTracker();

    const handleUpdate = (newState) => {
      setState(newState);
    };

    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  return state;
}
