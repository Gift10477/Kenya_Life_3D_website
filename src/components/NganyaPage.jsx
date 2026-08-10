import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Volume2,
  Sparkles,
  Music,
  ShieldCheck,
  Zap,
  Disc,
  Flame,
  Radio,
  Award,
  Layers,
  ChevronDown,
  Play,
  Pause,
  RotateCcw,
  Cpu,
  Eye,
  Sliders,
  ChevronUp,
  Loader2
} from 'lucide-react';

import NganyaShowcaseSection from './NganyaShowcaseSection';

const TOTAL_FRAMES = 300;

// Helper to get frame image path
const getFramePath = (index) => {
  const padded = String(index).padStart(3, '0');
  return `/nganya_dimantle/ezgif-frame-${padded}.jpg`;
};

// Sheng terms lore data
const SHENG_TERMS = [
  { term: 'Nganya / Manyanga', definition: 'A premium customized matatu with airbrush art, sound rigs, and neon.' },
  { term: 'Matwana', definition: 'Matatu culture, history, art form, and street vehicle community.' },
  { term: 'Manamba / Deno', definition: 'Energetic route conductors who manage crew & passengers.' },
  { term: 'Kabaa / Dub', definition: 'Custom dubstep & urban Afrobeat sub-bass mixes.' }
];

export default function NganyaPage({ onClose, stage }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const sampleCanvasRef = useRef(null);

  // States
  const [framesLoaded, setFramesLoaded] = useState(0);
  const [isFirstFrameReady, setIsFirstFrameReady] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(1);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeChapter, setActiveChapter] = useState(1);
  const [showHUD, setShowHUD] = useState(true);
  const [isCustomizerExpanded, setIsCustomizerExpanded] = useState(false);
  const [sampledColor, setSampledColor] = useState('rgb(5, 5, 5)');

  // Audio Synthesizer state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioEffect, setAudioEffect] = useState('bass');
  const audioCtxRef = useRef(null);

  // Customizer interactive states (Chapter 5)
  const [customColor, setCustomColor] = useState('#a855f7');
  const [customNeon, setCustomNeon] = useState('purple');
  const [customSound, setCustomSound] = useState('5000W Dual Rig');

  // Preloaded image element storage
  const imagesRef = useRef([]);

  // Razor-Sharp Canvas Rendering Engine with Instant Draw & Edge Blending
  const renderCanvasFrame = useCallback((frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imagesRef.current[frameIndex - 1];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    // Sample top-left corner pixel of current frame image to get exact background color
    if (!sampleCanvasRef.current) {
      sampleCanvasRef.current = document.createElement('canvas');
      sampleCanvasRef.current.width = 1;
      sampleCanvasRef.current.height = 1;
    }
    const sCtx = sampleCanvasRef.current.getContext('2d');
    sCtx.drawImage(img, 2, 2, 1, 1, 0, 0, 1, 1);
    const [r, g, b] = sCtx.getImageData(0, 0, 1, 1).data;
    const sampledBg = `rgb(${r}, ${g}, ${b})`;
    setSampledColor(sampledBg);

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 1. Fill entire canvas with exact sampled frame background color
    ctx.fillStyle = sampledBg;
    ctx.fillRect(0, 0, cw, ch);

    const imgRatio = iw / ih;
    const canvasRatio = cw / ch;
    let drawW, drawH, drawX, drawY;

    // Focused Contain fitting: elevated framing so Matatu sits proudly above bottom text cards
    if (canvasRatio > imgRatio) {
      drawH = ch * 0.82;
      drawW = drawH * imgRatio;
      drawX = (cw - drawW) / 2;
      drawY = (ch - drawH) / 2 - ch * 0.05;
    } else {
      drawW = cw * 0.88;
      drawH = drawW / imgRatio;
      drawX = (cw - drawW) / 2;
      drawY = (ch - drawH) / 2 - ch * 0.05;
    }

    // 2. Draw 3D Matatu frame
    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    // 3. Apply soft edge feathering linear gradients to melt image borders 100% seamlessly into page background
    const fadeMargin = Math.min(drawW, drawH) * 0.12; // 12% soft feather margin
    const transparentBg = `rgba(${r}, ${g}, ${b}, 0)`;

    // Top Edge Feather
    const topGrad = ctx.createLinearGradient(0, drawY, 0, drawY + fadeMargin);
    topGrad.addColorStop(0, sampledBg);
    topGrad.addColorStop(1, transparentBg);
    ctx.fillStyle = topGrad;
    ctx.fillRect(drawX - 2, drawY - 2, drawW + 4, fadeMargin);

    // Bottom Edge Feather
    const botGrad = ctx.createLinearGradient(0, drawY + drawH, 0, drawY + drawH - fadeMargin);
    botGrad.addColorStop(0, sampledBg);
    botGrad.addColorStop(1, transparentBg);
    ctx.fillStyle = botGrad;
    ctx.fillRect(drawX - 2, drawY + drawH - fadeMargin, drawW + 4, fadeMargin + 2);

    // Left Edge Feather
    const leftGrad = ctx.createLinearGradient(drawX, 0, drawX + fadeMargin, 0);
    leftGrad.addColorStop(0, sampledBg);
    leftGrad.addColorStop(1, transparentBg);
    ctx.fillStyle = leftGrad;
    ctx.fillRect(drawX - 2, drawY - 2, fadeMargin, drawH + 4);

    // Right Edge Feather
    const rightGrad = ctx.createLinearGradient(drawX + drawW, 0, drawX + drawW - fadeMargin, 0);
    rightGrad.addColorStop(0, sampledBg);
    rightGrad.addColorStop(1, transparentBg);
    ctx.fillStyle = rightGrad;
    ctx.fillRect(drawX + drawW - fadeMargin, drawY - 2, fadeMargin + 2, drawH + 4);
  }, []);

  // Handle Resize canvas with retina DPR scaling & immediate setup
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const dpr = Math.max(1, window.devicePixelRatio || 1);
        canvasRef.current.width = window.innerWidth * dpr;
        canvasRef.current.height = window.innerHeight * dpr;
        renderCanvasFrame(currentFrame);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentFrame, renderCanvasFrame]);

  // Instant Loading Pipeline: Load Frame 1 FIRST for instant render (Zero Black Screen), then preload rest
  useEffect(() => {
    let isCancelled = false;
    const loadedImages = new Array(TOTAL_FRAMES);
    let count = 0;

    // 1. Load Frame 1 immediately
    const frame1 = new Image();
    frame1.src = getFramePath(1);
    frame1.onload = () => {
      if (isCancelled) return;
      loadedImages[0] = frame1;
      imagesRef.current = loadedImages;
      count++;
      setFramesLoaded(count);
      setIsFirstFrameReady(true);
      // Immediately render frame 1 on canvas
      if (canvasRef.current) {
        const dpr = Math.max(1, window.devicePixelRatio || 1);
        canvasRef.current.width = window.innerWidth * dpr;
        canvasRef.current.height = window.innerHeight * dpr;
        renderCanvasFrame(1);
      }
    };

    // 2. Preload remaining 299 frames in background
    for (let i = 2; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = () => {
        if (isCancelled) return;
        loadedImages[i - 1] = img;
        imagesRef.current = loadedImages;
        count++;
        setFramesLoaded(count);
      };
      img.onerror = () => {
        if (isCancelled) return;
        count++;
        setFramesLoaded(count);
      };
    }

    return () => {
      isCancelled = true;
    };
  }, [renderCanvasFrame]);

  // Re-render canvas when frame updates
  useEffect(() => {
    renderCanvasFrame(currentFrame);
  }, [currentFrame, renderCanvasFrame]);

  // Handle Scroll Progress
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    const scrollTop = el.scrollTop;
    const scrollHeight = el.scrollHeight - el.clientHeight;
    if (scrollHeight <= 0) return;

    const progress = Math.min(1, Math.max(0, scrollTop / scrollHeight));
    setScrollProgress(progress);

    // Frame indexing from 1 to 300 over the dismantling sequence
    const frameProgress = Math.min(1, progress / 0.80);
    const frame = Math.min(TOTAL_FRAMES, Math.max(1, Math.floor(frameProgress * (TOTAL_FRAMES - 1)) + 1));
    setCurrentFrame(frame);

    // Chapter determination (Strict Non-Overlapping Ranges)
    if (progress < 0.16) setActiveChapter(1);
    else if (progress < 0.32) setActiveChapter(2);
    else if (progress < 0.48) setActiveChapter(3);
    else if (progress < 0.64) setActiveChapter(4);
    else if (progress < 0.80) setActiveChapter(5);
    else setActiveChapter(6);
  };

  // Jump to Chapter
  const scrollToChapter = (chapterNum) => {
    const el = containerRef.current;
    if (!el) return;
    if (chapterNum === 6) {
      const footerEl = document.getElementById('nganya-showcase-footer');
      if (footerEl) {
        footerEl.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    const targets = [0, 0.18, 0.36, 0.54, 0.72];
    const targetProgress = targets[chapterNum - 1];
    const scrollHeight = el.scrollHeight - el.clientHeight;
    el.scrollTo({
      top: targetProgress * scrollHeight,
      behavior: 'smooth'
    });
  };

  // Web Audio Synth for sound rig simulation
  const toggleAudioSynth = (type = 'bass') => {
    setAudioEffect(type);
    if (isPlayingAudio) {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      setIsPlayingAudio(false);
      return;
    }

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'bass') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(45, ctx.currentTime);
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(4, ctx.currentTime);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(15, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();
      } else if (type === 'horn') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(80, ctx.currentTime);
      }

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      setIsPlayingAudio(true);
    } catch (e) {
      console.warn('Web Audio not supported or blocked', e);
    }
  };

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 text-slate-100 selection:bg-purple-600 selection:text-white overflow-hidden font-sans transition-colors duration-500"
      style={{ backgroundColor: sampledColor }}
    >
      {/* Sticky Canvas Background (Instant Draw, Floating Seamless Matatu) */}
      <div className={`fixed inset-0 z-0 pointer-events-none flex items-center justify-center transition-opacity duration-500 ${activeChapter === 6 ? 'opacity-0' : 'opacity-100'}`}>
        <canvas
          ref={canvasRef}
          className="w-full h-full filter brightness-105 contrast-105"
        />
        {/* Soft edge vignetting matching exact sampled image background */}
        <div
          className="absolute inset-x-0 top-0 h-20 pointer-events-none"
          style={{ background: `linear-gradient(to bottom, ${sampledColor}, transparent)` }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-20 pointer-events-none"
          style={{ background: `linear-gradient(to top, ${sampledColor}, transparent)` }}
        />
      </div>

      {/* Top Navigation Bar & Technical Badges */}
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-black/40 border-b border-white/10 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 hover:bg-purple-600/40 border border-white/15 text-xs font-mono-tech uppercase tracking-wider text-purple-200 hover:text-white transition-all group backdrop-blur-md"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Return to 3D Stage</span>
          </button>

          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/40 border border-purple-500/30 text-xs font-mono-tech text-purple-300 backdrop-blur-md">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span>3D Scroll Engine</span>
          </div>

          {/* Background Preload Progress Pill (Non-blocking) */}
          {framesLoaded < TOTAL_FRAMES && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/30 border border-purple-500/30 text-[11px] font-mono-tech text-purple-300 backdrop-blur-md">
              <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin" />
              <span>Caching 3D Frames ({framesLoaded}/{TOTAL_FRAMES})</span>
            </div>
          )}
        </div>

        {/* HUD Frame Counter & Controls */}
        <div className="flex items-center gap-3">
          {showHUD && (
            <div className="flex items-center gap-3 bg-black/40 border border-white/15 px-3.5 py-1.5 rounded-full backdrop-blur-md text-xs font-mono-tech">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              <span className="text-purple-300 uppercase tracking-widest text-[11px]">
                Frame <strong className="text-white">{String(currentFrame).padStart(3, '0')}</strong> / {TOTAL_FRAMES}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-pink-300 font-bold">CH 0{activeChapter}</span>
            </div>
          )}

          <button
            onClick={() => setShowHUD(!showHUD)}
            className={`p-2 rounded-full border transition-all backdrop-blur-md ${showHUD ? 'bg-purple-600 text-white border-purple-400' : 'bg-black/40 text-slate-400 border-white/15'}`}
            title="Toggle Technical HUD"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Chapter Indicator Bar (Right Floating) */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col items-center gap-3 bg-black/30 p-2.5 rounded-full border border-white/15 backdrop-blur-md">
        {[
          { num: 1, label: 'Kinetic Art' },
          { num: 2, label: 'Chassis' },
          { num: 3, label: 'Sound Rig' },
          { num: 4, label: 'Neon Cabin' },
          { num: 5, label: 'Fleet Builder' },
          { num: 6, label: 'Nganya Showcase' }
        ].map((ch) => {
          const active = activeChapter === ch.num;
          return (
            <button
              key={ch.num}
              onClick={() => scrollToChapter(ch.num)}
              className="group relative flex items-center justify-center"
              title={`Jump to Chapter ${ch.num}: ${ch.label}`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full transition-all ${active
                    ? 'bg-purple-500 scale-125 ring-4 ring-purple-500/30'
                    : 'bg-black/60 border border-white/20 hover:bg-purple-600'
                  }`}
              />
              <span className="absolute right-8 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 border border-white/15 text-purple-200 text-[10px] font-mono-tech px-2.5 py-1 rounded-md whitespace-nowrap shadow-xl backdrop-blur-md">
                0{ch.num} • {ch.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Scrollable Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="relative z-10 h-screen overflow-y-auto scroll-smooth"
      >
        {/* 3D Scroll Dismantling Sequence Container (Chapters 1 to 5) */}
        <div className="min-h-[500vh] relative">
          {/* ========================================================
              CHAPTER 01: HERO INTRO & ARTWORK (0.00 - 0.18 Scroll)
          ======================================================== */}
          <section className="h-screen sticky top-0 flex flex-col justify-end p-6 sm:p-10 pointer-events-none">
            {scrollProgress >= 0.0 && scrollProgress <= 0.18 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="max-w-md space-y-4 pointer-events-auto bg-black/25 p-5 sm:p-6 rounded-3xl border border-white/15 backdrop-blur-md shadow-xl"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-600/30 border border-purple-400/40 text-purple-200 text-[11px] font-mono-tech uppercase tracking-widest">
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
                  <span>Chapter 01 • Kinetic Art</span>
                </div>

                <h1 className="font-heading text-3xl sm:text-4xl font-black tracking-tight text-white uppercase leading-tight drop-shadow-md">
                  NGANYA <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">DISMANTLED</span>
                </h1>

                <p className="text-slate-200 text-xs leading-relaxed font-light">
                  Scroll down to rotate and dismantle the Nganya matatu frame-by-frame. Uncover street graffiti art, chassis engineering, sound rigs, and neon interiors.
                </p>

                <div className="flex items-center gap-2 text-[11px] font-mono-tech text-purple-300 uppercase tracking-widest animate-bounce pt-1">
                  <ChevronDown className="w-4 h-4" />
                  <span>Scroll to Rotate & Dismantle</span>
                </div>
              </motion.div>
            )}
          </section>

          {/* ========================================================
              CHAPTER 02: CHASSIS & EXTERIOR DISMANTLING (0.20 - 0.38 Scroll)
          ======================================================== */}
          <section className="h-screen sticky top-0 flex items-end justify-start p-6 sm:p-10 pointer-events-none">
            {scrollProgress >= 0.20 && scrollProgress <= 0.38 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4 }}
                className="max-w-xs sm:max-w-sm space-y-4 pointer-events-auto bg-black/30 p-5 sm:p-6 rounded-3xl border border-white/15 backdrop-blur-md shadow-2xl mb-4"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/40 border border-purple-500/30 text-purple-300 text-[11px] font-mono-tech uppercase">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span>Chapter 02 • Bodywork & Chassis</span>
                </div>

                <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-white uppercase">
                  Custom Airbrush & Stance
                </h2>

                <p className="text-slate-200 text-[11px] leading-relaxed">
                  Artisans spend weeks applying multi-layered hand-painted airbrush acrylics onto a heavy-duty reinforced chassis.
                </p>

                <div className="grid grid-cols-2 gap-2 font-mono-tech text-[10px]">
                  <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                    <span className="text-purple-400 block font-bold">Body Finish</span>
                    <span className="text-slate-200">UV Acrylic</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                    <span className="text-pink-400 block font-bold">Bullbar Armor</span>
                    <span className="text-slate-200">Steel Armor</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                    <span className="text-amber-400 block font-bold">Wheel Stance</span>
                    <span className="text-slate-200">Chrome Rims</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/40 border border-white/10">
                    <span className="text-emerald-400 block font-bold">Exhaust</span>
                    <span className="text-slate-200">Dual Chrome</span>
                  </div>
                </div>
              </motion.div>
            )}
          </section>

          {/* ========================================================
              CHAPTER 03: UNDERGROUND SOUND RIGS (0.40 - 0.58 Scroll)
          ======================================================== */}
          <section className="h-screen sticky top-0 flex items-end justify-end p-6 sm:p-10 pointer-events-none">
            {scrollProgress >= 0.40 && scrollProgress <= 0.58 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4 }}
                className="max-w-xs sm:max-w-sm space-y-4 pointer-events-auto bg-black/30 p-5 sm:p-6 rounded-3xl border border-white/15 backdrop-blur-md shadow-2xl mb-4"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-950/40 border border-pink-500/30 text-pink-300 text-[11px] font-mono-tech uppercase">
                  <Music className="w-3.5 h-3.5 text-pink-400" />
                  <span>Chapter 03 • 5,000W Sound Rig</span>
                </div>

                <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-white uppercase">
                  High-Decibel Audio System
                </h2>

                <p className="text-slate-200 text-[11px] leading-relaxed">
                  Equipped with twelve 15-inch subwoofers, Pioneer DJ mixers, and high-wattage mono amplifiers built directly into the cabin.
                </p>

                {/* Compact Interactive Audio Synthesizer */}
                <div className="p-3 rounded-2xl bg-black/40 border border-white/15 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono-tech text-purple-300 uppercase font-semibold flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                      <span>Sound Rig Synth</span>
                    </span>

                    <button
                      onClick={() => toggleAudioSynth('bass')}
                      className={`px-3 py-1 rounded-full font-mono-tech text-[10px] font-bold uppercase transition-all flex items-center gap-1 ${isPlayingAudio
                          ? 'bg-red-600 text-white animate-pulse'
                          : 'bg-purple-600 hover:bg-purple-500 text-white'
                        }`}
                    >
                      {isPlayingAudio ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      <span>{isPlayingAudio ? 'Stop' : 'Test Bass'}</span>
                    </button>
                  </div>

                  {/* Frequency Visualizer */}
                  <div className="h-10 bg-black/50 rounded-lg p-2 border border-white/10 flex items-end justify-between gap-1">
                    {[40, 75, 95, 60, 85, 100, 70, 90, 45, 80, 65, 98, 50].map((height, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: isPlayingAudio ? [`20%`, `${height}%`, `30%`] : '20%' }}
                        transition={{ repeat: Infinity, duration: 0.5 + (i % 4) * 0.1, ease: 'easeInOut' }}
                        className="w-full rounded-t-xs bg-gradient-to-t from-purple-500 via-pink-500 to-amber-400"
                      />
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-center font-mono-tech text-[9px]">
                    <button
                      onClick={() => toggleAudioSynth('bass')}
                      className="p-1.5 rounded-md bg-white/5 hover:bg-purple-600/30 text-purple-200 border border-white/10"
                    >
                      Sub Bass
                    </button>
                    <button
                      onClick={() => toggleAudioSynth('horn')}
                      className="p-1.5 rounded-md bg-white/5 hover:bg-pink-600/30 text-pink-200 border border-white/10"
                    >
                      Air Horn
                    </button>
                    <button
                      onClick={() => toggleAudioSynth('synth')}
                      className="p-1.5 rounded-md bg-white/5 hover:bg-amber-600/30 text-amber-200 border border-white/10"
                    >
                      Sheng Beat
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </section>

          {/* ========================================================
              CHAPTER 04: VIP NEON CABIN & SHENG LORE (0.60 - 0.78 Scroll)
          ======================================================== */}
          <section className="h-screen sticky top-0 flex items-end justify-start p-6 sm:p-10 pointer-events-none">
            {scrollProgress >= 0.60 && scrollProgress <= 0.78 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4 }}
                className="max-w-xs sm:max-w-sm space-y-4 pointer-events-auto bg-black/30 p-5 sm:p-6 rounded-3xl border border-white/15 backdrop-blur-md shadow-2xl mb-4"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/40 border border-amber-500/30 text-amber-300 text-[11px] font-mono-tech uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Chapter 04 • VIP Cockpit & Sheng</span>
                </div>

                <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-white uppercase">
                  Neon Cabin & Street Lore
                </h2>

                <p className="text-slate-200 text-[11px] leading-relaxed">
                  Ultraviolet blacklights, plush velvet headliners, and laser projectors turn night rides into a mobile street concert.
                </p>

                {/* Sheng Terms Lore Grid */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono-tech text-purple-300 uppercase tracking-widest block font-bold">
                    Sheng Street Glossary
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {SHENG_TERMS.map((item, idx) => (
                      <div key={idx} className="p-2 rounded-xl bg-black/40 border border-white/10 text-[10px]">
                        <span className="font-heading font-extrabold text-amber-300 block">{item.term}</span>
                        <p className="text-slate-300 text-[9px] leading-tight mt-0.5">{item.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </section>

          {/* ========================================================
              CHAPTER 05: RE-ASSEMBLY BUILDER DOCKED TO BOTTOM-RIGHT (0.72 - 0.82 Scroll)
          ======================================================== */}
          <section className="h-screen sticky top-0 flex items-end justify-end p-6 sm:p-10 pointer-events-none">
            {scrollProgress >= 0.68 && scrollProgress < 0.84 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4 }}
                className="max-w-xs sm:max-w-sm w-full pointer-events-auto bg-black/30 p-5 rounded-3xl border border-white/15 backdrop-blur-md shadow-2xl space-y-3.5 mb-4"
              >
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-600/30 border border-purple-400/40 text-purple-200 text-[10px] font-mono-tech uppercase">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>CH 05 • Re-Assembly</span>
                  </div>

                  <button
                    onClick={() => setIsCustomizerExpanded(!isCustomizerExpanded)}
                    className="flex items-center gap-1 text-[10px] font-mono-tech text-purple-300 hover:text-white px-2 py-0.5 rounded bg-white/5 border border-white/10"
                  >
                    <span>{isCustomizerExpanded ? 'Hide Customizer' : 'Customize Rig'}</span>
                    {isCustomizerExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                  </button>
                </div>

                <h2 className="font-heading text-lg sm:text-xl font-extrabold text-white uppercase leading-tight">
                  Build Your Custom Nganya
                </h2>

                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Nganya 3D re-assembly complete. Scroll further to explore the full Kenya Nganya showcase & 3D hero model!
                </p>

                {/* Expandable Customizer Configuration Drawer */}
                <AnimatePresence>
                  {isCustomizerExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2.5 pt-2 border-t border-white/10 text-[10px] overflow-hidden"
                    >
                      {/* Paint Color Option */}
                      <div className="space-y-1">
                        <span className="font-mono-tech text-purple-300 uppercase font-bold block">
                          1. Mural Paint Finish
                        </span>
                        <div className="flex items-center gap-2">
                          {[
                            { color: '#a855f7', name: 'Purple Haze' },
                            { color: '#ec4899', name: 'Neon Pink' },
                            { color: '#f59e0b', name: 'Solar Amber' },
                            { color: '#10b981', name: 'Emerald City' }
                          ].map((c) => (
                            <button
                              key={c.color}
                              onClick={() => setCustomColor(c.color)}
                              className={`w-5 h-5 rounded-full border transition-all ${customColor === c.color ? 'scale-125 border-white ring-2 ring-purple-500/40' : 'border-transparent opacity-70 hover:opacity-100'}`}
                              style={{ backgroundColor: c.color }}
                              title={c.name}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Neon Glow Option */}
                      <div className="space-y-1">
                        <span className="font-mono-tech text-pink-300 uppercase font-bold block">
                          2. Neon Lighting
                        </span>
                        <div className="grid grid-cols-2 gap-1 font-mono-tech text-[9px]">
                          {['purple', 'cyan', 'magenta', 'gold'].map((n) => (
                            <button
                              key={n}
                              onClick={() => setCustomNeon(n)}
                              className={`px-2 py-0.5 rounded border uppercase transition-all ${customNeon === n ? 'bg-pink-600 text-white border-pink-400 font-bold' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'}`}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Sound System Option */}
                      <div className="space-y-1">
                        <span className="font-mono-tech text-amber-300 uppercase font-bold block">
                          3. Subwoofer Audio Rig
                        </span>
                        <div className="space-y-1 font-mono-tech text-[9px]">
                          {['3000W Street', '5000W Dual', '8000W Stadium'].map((s) => (
                            <button
                              key={s}
                              onClick={() => setCustomSound(s)}
                              className={`w-full text-left px-2 py-0.5 rounded border transition-all ${customSound === s ? 'bg-amber-600 text-white border-amber-400 font-bold' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'}`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <button
                    onClick={() => scrollToChapter(6)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-600/60 hover:bg-purple-600 border border-purple-400 text-[10px] font-mono-tech uppercase text-white font-bold transition-all shadow-md"
                  >
                    <ChevronDown className="w-3 h-3" />
                    <span>View Showcase</span>
                  </button>

                  <button
                    onClick={onClose}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-[10px] font-mono-tech font-bold uppercase tracking-wider shadow-lg transition-all hover:scale-105"
                  >
                    <span>Back to 3D Stage</span>
                  </button>
                </div>
              </motion.div>
            )}
          </section>
        </div>

        {/* ========================================================
            FOOTER SHOWCASE PAGE: KENYA NGANYA 3D GALLERY
        ======================================================== */}
        <footer id="nganya-showcase-footer" className="relative z-30 w-full min-h-screen bg-[#05070a] border-t border-purple-500/30 py-20 text-slate-100 shadow-[0_-25px_60px_rgba(0,0,0,0.95)]">
          <NganyaShowcaseSection toggleAudioSynth={toggleAudioSynth} isPlayingAudio={isPlayingAudio} />
        </footer>
      </div>
    </motion.div>
  );
}
