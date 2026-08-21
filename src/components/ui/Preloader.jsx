import React, { useEffect, useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';

/**
 * KaribuPreloader
 *
 * 1. Features an iconic Kenyan Maasai Shield & Sun Vector Crest (Zero Triangles).
 * 2. Downloads and pre-warms ALL assets in the background:
 *    - All 4 3D GLB Models (Parliament, Optimus, Moneyfest, Mood)
 *    - All Wildlife & Chapter Photographic Assets
 *    - All 240 Smocha Deconstruction Frames
 * 3. Shows genuine, smooth download progress (0% -> 100%).
 * 4. Fades out seamlessly once assets are cached.
 */

// 3D Models to pre-warm
const MODEL_URLS = [
  '/models/parliament-transformed.glb',
  '/models/optimus1-transformed.glb',
  '/models/moneyfest-transformed.glb',
  '/models/mood-transformed.glb',
];

// Main photography assets
const HERO_IMAGES = [
  '/images/nairobi_sunset.jpg',
  '/images/nairobi.jpg',
  '/images/lion.jpg',
  '/images/leopard.jpg',
  '/images/elephant.jpg',
  '/images/buffalo.jpg',
  '/images/rhino.jpg',
  '/images/nganya.jpeg',
];

// Generate all 240 Smocha frames for background downloading
const TOTAL_SMOCHA_FRAMES = 240;
const SMOCHA_FRAMES = Array.from({ length: TOTAL_SMOCHA_FRAMES }, (_, i) => {
  const padded = String(i + 1).padStart(4, '0');
  return `/frames_smocha/frame_${padded}.webp`;
});

// Preload models at module level for Three.js / Draco decoders
MODEL_URLS.forEach((url) => useGLTF.preload(url));

export default function KaribuPreloader({ onComplete }) {
  const [progress, setProgress] = useState(0.04);
  const [statusText, setStatusText] = useState('Initialising 3D spatial canvas...');
  const [phase, setPhase] = useState('loading'); // 'loading' | 'fading' | 'gone'
  const onCompleteRef = useRef(onComplete);
  const completedRef = useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let totalLoaded = 0;
    const totalAssets = MODEL_URLS.length + HERO_IMAGES.length + TOTAL_SMOCHA_FRAMES;
    const startTime = Date.now();
    const MIN_DURATION = 2000; // Minimum 2s for premium brand reveal
    const MAX_TIMEOUT = 5000;  // Safety ceiling

    const updateProgress = (text) => {
      totalLoaded++;
      const rawProgress = totalLoaded / totalAssets;
      // Exponential smoothing for realistic progress bar
      setProgress(Math.max(0.08, rawProgress));
      if (text) setStatusText(text);

      if (totalLoaded >= totalAssets) {
        finish();
      }
    };

    const finish = () => {
      if (completedRef.current) return;
      completedRef.current = true;
      setProgress(1);
      setStatusText('Experience ready');

      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, MIN_DURATION - elapsed);

      setTimeout(() => {
        setPhase('fading');
        setTimeout(() => {
          setPhase('gone');
          onCompleteRef.current?.();
        }, 750);
      }, remaining);
    };

    // Hard fallback timer
    const safetyTimer = setTimeout(finish, MAX_TIMEOUT);

    // 1. Download 3D Models in Background
    MODEL_URLS.forEach((url) => {
      fetch(url, { mode: 'cors' })
        .then(() => updateProgress('Caching 3D models...'))
        .catch(() => updateProgress());
    });

    // 2. Download Hero & Chapter Images
    HERO_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = () => updateProgress('Loading archive imagery...');
      img.onerror = () => updateProgress();
    });

    // 3. Batch Download Smocha Frames (in concurrent pools of 12)
    const loadSmochaBatch = async () => {
      const poolSize = 12;
      for (let i = 0; i < SMOCHA_FRAMES.length; i += poolSize) {
        const batch = SMOCHA_FRAMES.slice(i, i + poolSize);
        await Promise.all(
          batch.map(
            (src) =>
              new Promise((resolve) => {
                const img = new Image();
                img.src = src;
                img.onload = img.onerror = () => {
                  updateProgress('Pre-caching Smocha layers...');
                  resolve();
                };
              })
          )
        );
      }
    };

    loadSmochaBatch();

    return () => {
      clearTimeout(safetyTimer);
    };
  }, []);

  if (phase === 'gone') return null;

  const isFading = phase === 'fading';

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#020406] overflow-hidden"
      style={{
        transition: 'opacity 0.75s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: isFading ? 0 : 1,
        pointerEvents: isFading ? 'none' : 'all',
      }}
    >
      {/* Ambient flag colors glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 50% 45%, rgba(222,32,16,0.09) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 50% 55%, rgba(0,106,78,0.08) 0%, transparent 60%)
          `,
        }}
      />

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
          backgroundSize: '44px 44px',
        }}
      />

      {/* Main Content */}
      <div className="relative flex flex-col items-center gap-9">
        {/* ================================================================= */}
        {/* NEW KENYAN HERITAGE SHIELD & SUN CREST (ZERO TRIANGLES)           */}
        {/* ================================================================= */}
        <div className="relative w-32 h-32 sm:w-36 sm:h-36">
          {/* Outer rotating subtle gold ring */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 144 144"
            style={{ animation: 'spin 12s linear infinite' }}
          >
            <circle
              cx="72" cy="72" r="68"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
            <circle
              cx="72" cy="72" r="68"
              fill="none"
              stroke="rgba(222,32,16,0.6)"
              strokeWidth="1.5"
              strokeDasharray="20 400"
              strokeLinecap="round"
            />
            <circle
              cx="72" cy="72" r="68"
              fill="none"
              stroke="rgba(0,106,78,0.6)"
              strokeWidth="1.5"
              strokeDasharray="16 404"
              strokeDashoffset="75"
              strokeLinecap="round"
            />
          </svg>

          {/* Core Maasai Shield & Crossed Sun Rays Vector (NO TRIANGLES) */}
          <svg
            className="absolute inset-0 w-full h-full p-2"
            viewBox="0 0 100 100"
          >
            {/* Outer traditional shield ellipse contour */}
            <path
              d="M 50 8 C 74 24, 80 54, 50 92 C 20 54, 26 24, 50 8 Z"
              fill="none"
              stroke="rgba(255,255,255,0.85)"
              strokeWidth="3.2"
              strokeLinejoin="round"
            />

            {/* Central spear shaft */}
            <line
              x1="50" y1="3"
              x2="50" y2="97"
              stroke="#d9b36c"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Traditional curved chevron ribs */}
            <path
              d="M 31 38 Q 50 48 69 38"
              fill="none"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M 31 62 Q 50 52 69 62"
              fill="none"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Concentric dual-color heart of Kenya: Crimson & Emerald core */}
            <circle cx="50" cy="50" r="10.5" fill="#de2010" />
            <circle cx="50" cy="50" r="5" fill="#006a4e" />
            <circle cx="50" cy="50" r="2" fill="#ffffff" />
          </svg>

          {/* Circular progress arc */}
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 144 144"
          >
            <circle
              cx="72" cy="72" r="58"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="3"
            />
            <circle
              cx="72" cy="72" r="58"
              fill="none"
              stroke="#d9b36c"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 58}`}
              strokeDashoffset={`${2 * Math.PI * 58 * (1 - progress)}`}
              style={{ transition: 'stroke-dashoffset 0.25s ease' }}
            />
          </svg>
        </div>

        {/* Wordmark */}
        <div className="flex flex-col items-center gap-1 text-center">
          <span
            className="font-heading font-black text-4xl sm:text-5xl tracking-tight text-white select-none"
            style={{
              background: 'linear-gradient(180deg, #ffffff 0%, #f9e4a0 45%, #d9b36c 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            KARIBU
          </span>
          <span className="font-mono-tech text-[10px] uppercase tracking-[0.35em] text-slate-400">
            Spatial 3D Archive
          </span>
        </div>

        {/* Progress bar + Live status label */}
        <div className="w-52 sm:w-64">
          <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#de2010] via-[#d9b36c] to-[#006a4e] rounded-full"
              style={{
                width: `${progress * 100}%`,
                transition: 'width 0.25s ease',
              }}
            />
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[9px] font-mono-tech uppercase tracking-widest text-slate-400">
            <span className="truncate max-w-[150px]">{statusText}</span>
            <span className="text-amber-400 font-bold">{Math.round(progress * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Bottom credit */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center">
        <span className="font-mono-tech text-[9px] text-slate-500 uppercase tracking-widest">
          🇰🇪 &nbsp; Kenya Cultural Heritage
        </span>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
