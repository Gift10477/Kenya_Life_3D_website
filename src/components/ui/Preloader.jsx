import React, { useEffect, useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';

/**
 * KaribuPreloader
 *
 * Strictly blocks dismissal until the 3D Parliament GLB model is 100% downloaded
 * and parsed into memory, preventing mobile users from seeing an empty canvas or waiting
 * for the 3D model on-screen.
 */

// Essential Hero 3D Model
const HERO_MODEL_URL = `${import.meta.env.BASE_URL}models/parliament-transformed.glb`;

// Main photography assets needed immediately
const HERO_IMAGES = [
  `${import.meta.env.BASE_URL}images/nairobi_sunset.jpg`,
  `${import.meta.env.BASE_URL}images/lion.jpg`,
  `${import.meta.env.BASE_URL}images/nganya.jpeg`,
  `${import.meta.env.BASE_URL}images/nairobi.jpg`,
  `${import.meta.env.BASE_URL}frames_smocha/frame_0001.jpg`,
];

export default function KaribuPreloader({ onComplete }) {
  const [progress, setProgress] = useState(0.12);
  const [statusText, setStatusText] = useState('Downloading 3D Parliament Architecture...');
  const [phase, setPhase] = useState('loading'); // 'loading' | 'fading' | 'gone'
  const onCompleteRef = useRef(onComplete);
  const completedRef = useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let isModelLoaded = false;
    let imagesLoadedCount = 0;
    const totalImages = HERO_IMAGES.length;
    const startTime = Date.now();
    const MIN_DURATION = 1200; // Minimum brand reveal duration
    const MAX_TIMEOUT = 25000; // Generous ceiling for slow mobile 3G/4G networks

    const checkAllComplete = () => {
      // STRICT REQUIREMENT: Only finish if the 3D model has fully downloaded and parsed
      if (!isModelLoaded || imagesLoadedCount < totalImages) {
        return;
      }

      if (completedRef.current) return;
      completedRef.current = true;
      setProgress(1);
      setStatusText('Karibu Kenya');

      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, MIN_DURATION - elapsed);

      setTimeout(() => {
        setPhase('fading');
        setTimeout(() => {
          setPhase('gone');
          onCompleteRef.current?.();
        }, 600);
      }, remaining);
    };

    const updateModelProgress = (loadedRatio, text) => {
      // 3D Model carries 60% of total preloader progress weight
      const modelWeight = loadedRatio * 0.60;
      const imagesWeight = (imagesLoadedCount / totalImages) * 0.40;
      const totalProgress = Math.max(0.15, Math.min(0.98, modelWeight + imagesWeight));
      setProgress(totalProgress);
      if (text) setStatusText(text);
    };

    const updateImageProgress = (text) => {
      imagesLoadedCount++;
      const modelWeight = (isModelLoaded ? 1 : 0.4) * 0.60;
      const imagesWeight = (imagesLoadedCount / totalImages) * 0.40;
      const totalProgress = Math.max(0.15, Math.min(0.98, modelWeight + imagesWeight));
      setProgress(totalProgress);
      if (text && !isModelLoaded) setStatusText(text);
      checkAllComplete();
    };

    // Pre-warm GLTF cache in Three.js / drei
    try {
      useGLTF.preload(HERO_MODEL_URL);
    } catch (_) {}

    // 1. Download & fully buffer 3D Parliament GLB model with real byte completion
    fetch(HERO_MODEL_URL, { mode: 'cors' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch model');
        return res.arrayBuffer();
      })
      .then(() => {
        isModelLoaded = true;
        updateModelProgress(1, '3D Parliament Architecture Ready');
        checkAllComplete();
      })
      .catch(() => {
        // Fallback in case of offline cache
        isModelLoaded = true;
        checkAllComplete();
      });

    // 2. Download and asynchronously pre-decode Hero Images off the main thread
    HERO_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
      const onDone = () => {
        if (img.decode) {
          img
            .decode()
            .then(() => updateImageProgress('Loading archive imagery...'))
            .catch(() => updateImageProgress());
        } else {
          updateImageProgress('Loading archive imagery...');
        }
      };
      img.onload = onDone;
      img.onerror = () => updateImageProgress();
    });

    // Network timeout ceiling safety
    const safetyTimer = setTimeout(() => {
      isModelLoaded = true;
      imagesLoadedCount = totalImages;
      checkAllComplete();
    }, MAX_TIMEOUT);

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
        {/* KENYAN HERITAGE SHIELD & SUN CREST (ZERO TRIANGLES)               */}
        {/* ================================================================= */}
        <div className="relative w-32 h-32 sm:w-36 sm:h-36">
          {/* Outer rotating gold ring */}
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

          {/* Core Maasai Shield & Crossed Sun Rays Vector */}
          <svg
            className="absolute inset-0 w-full h-full p-2"
            viewBox="0 0 100 100"
          >
            <path
              d="M 50 8 C 74 24, 80 54, 50 92 C 20 54, 26 24, 50 8 Z"
              fill="none"
              stroke="rgba(255,255,255,0.85)"
              strokeWidth="3.2"
              strokeLinejoin="round"
            />
            <line
              x1="50" y1="3"
              x2="50" y2="97"
              stroke="#d9b36c"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
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
        <div className="w-56 sm:w-64">
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
            <span className="truncate max-w-[170px]">{statusText}</span>
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
