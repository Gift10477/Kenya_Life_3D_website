import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Utensils, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Ultra-lightweight tactile Web Audio synthesizer
const playTactileClick = (freq = 520) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch (e) {}
};

const TOTAL_FRAMES = 240;
const INITIAL_BATCH = 30;    // Load first N frames immediately
const BATCH_SIZE = 30;       // Subsequent batch size
const BATCH_DELAY_MS = 80;   // Stagger delay between batches

const getFramePath = (index) => {
  const padded = String(index).padStart(4, '0');
  return `${import.meta.env.BASE_URL}frames_smocha/frame_${padded}.webp`;
};

const ANNOTATIONS = [
  {
    id: 'whole',
    shortTitle: 'The Whole',
    label: '01 / THE WHOLE',
    headline: 'MORE THAN A SNACK.',
    body: 'Born on the streets of Nairobi, the Smocha is Kenya\'s most democratic meal — crafted fresh, eaten fast, and remembered forever. A lesson in resourcefulness wrapped in one soft chapati.',
    startPct: 0.0,
    endPct: 0.12,
  },
  {
    id: 'chapati',
    shortTitle: 'Chapati Base',
    label: '02 / THE FOUNDATION',
    headline: 'HANDMADE CHAPATI',
    body: 'Kneaded daily before sunrise by skilled street vendors, the chapati\'s soft, unleavened layers absorb every flavour beneath it. It is not just a wrap — it is the structural backbone of Nairobi street culture.',
    startPct: 0.12,
    endPct: 0.25,
  },
  {
    id: 'smokie',
    shortTitle: 'Smokie Core',
    label: '03 / THE HEART',
    headline: 'SAVOURY SMOKIE',
    body: 'Grilled over glowing charcoal roadside jikos, Kenya\'s smokie carries a distinct char that no oven can replicate. Firm, smoky, and unmistakably Nairobi — the protein anchor at the centre of everything.',
    startPct: 0.25,
    endPct: 0.38,
  },
  {
    id: 'tomato',
    shortTitle: 'Tomato',
    label: '04 / FRESHNESS',
    headline: 'FRESH TOMATO',
    body: 'Market-sourced Roma tomatoes, chopped minutes before service, bring a burst of natural acidity that cuts the richness of the smokie. In the kachumbari tradition, freshness is non-negotiable.',
    startPct: 0.38,
    endPct: 0.51,
  },
  {
    id: 'onion',
    shortTitle: 'Red Onion',
    label: '05 / THE CRUNCH',
    headline: 'SLICED ONION',
    body: 'Red onion — cut so thin it borders on translucent — provides a sharp, mouth-opening contrast that wakes up every other layer. This is the ingredient that transforms the Smocha from food into experience.',
    startPct: 0.51,
    endPct: 0.64,
  },
  {
    id: 'coriander',
    shortTitle: 'Dhania',
    label: '06 / HERBAL FINISH',
    headline: 'FRESH CORIANDER',
    body: 'Dhania. The green finale that ties the Smocha to East African culinary tradition. A small handful of fresh coriander carries centuries of coastal Swahili cooking in its fragrance.',
    startPct: 0.64,
    endPct: 0.76,
  },
  {
    id: 'sauce',
    shortTitle: 'Street Sauce',
    label: '07 / THE FINAL LAYER',
    headline: 'STREET SAUCE',
    body: 'Part tomato paste, part chili fire, part vendor secret — the Smocha sauce is the layer that belongs to no recipe. Every street corner has its own formula. Every formula is the right one.',
    startPct: 0.76,
    endPct: 0.88,
  },
  {
    id: 'exploded',
    shortTitle: 'Exploded View',
    label: '08 / EVERY LAYER MATTERS',
    headline: 'SIMPLE INGREDIENTS.\nBIG CHARACTER.',
    body: 'Seven components. Zero compromise. The Smocha is proof that the most iconic things in any culture are built not from complexity, but from intention. This is Nairobi street food at its finest.',
    startPct: 0.88,
    endPct: 1.0,
  }
];

export default function SmochaExplodedChapter() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [currentFrame, setCurrentFrame] = useState(1);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isInitialBatchReady, setIsInitialBatchReady] = useState(false);

  const imagesRef = useRef([]);
  const currentFrameRef = useRef(1);

  // Draw current frame onto HTML5 Canvas
  const drawFrame = useCallback((frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imagesRef.current[frameIndex - 1];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    ctx.clearRect(0, 0, cw, ch);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const isPortrait = cw < 768 && ch > cw;
    const scale = isPortrait
      ? Math.max(cw / iw, (ch * 0.72) / ih)
      : Math.max(cw / iw, ch / ih);
    const x = (cw - iw * scale) / 2;
    const y = (ch - ih * scale) / 2;

    ctx.drawImage(img, x, y, iw * scale, ih * scale);
  }, []);

  // Chunked lazy-loading: load first batch immediately, rest in staggered batches
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    let totalLoaded = 0;
    let initialBatchLoaded = 0;

    const loadFrame = (i) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = getFramePath(i);
        imagesRef.current[i - 1] = img;

        const onDone = () => {
          totalLoaded++;
          setLoadedCount(totalLoaded);

          if (i <= INITIAL_BATCH) {
            initialBatchLoaded++;
            if (initialBatchLoaded === INITIAL_BATCH) {
              setIsInitialBatchReady(true);
              drawFrame(1);
            }
          }

          if (i === currentFrameRef.current) {
            drawFrame(i);
          }
          resolve();
        };

        img.onload = onDone;
        img.onerror = onDone;
      });
    };

    // Load first batch immediately
    const firstBatch = [];
    for (let i = 1; i <= Math.min(INITIAL_BATCH, TOTAL_FRAMES); i++) {
      firstBatch.push(loadFrame(i));
    }

    // Load remaining frames in staggered batches
    Promise.all(firstBatch).then(() => {
      let batchStart = INITIAL_BATCH + 1;

      const loadNextBatch = () => {
        if (batchStart > TOTAL_FRAMES) return;

        const end = Math.min(batchStart + BATCH_SIZE - 1, TOTAL_FRAMES);
        const batch = [];
        for (let i = batchStart; i <= end; i++) {
          batch.push(loadFrame(i));
        }
        batchStart = end + 1;

        Promise.all(batch).then(() => {
          setTimeout(loadNextBatch, BATCH_DELAY_MS);
        });
      };

      setTimeout(loadNextBatch, BATCH_DELAY_MS);
    });

    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        drawFrame(currentFrameRef.current);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawFrame]);

  // Handle scroll progress and frame index calculation
  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const totalScrollable = rect.height - viewportHeight;

      if (totalScrollable <= 0) return;

      const currentScroll = -rect.top;
      const progress = Math.max(0, Math.min(1, currentScroll / totalScrollable));

      setScrollProgress(progress);

      const targetFrame = Math.max(1, Math.min(TOTAL_FRAMES, Math.floor(progress * (TOTAL_FRAMES - 1)) + 1));
      if (targetFrame !== currentFrameRef.current) {
        currentFrameRef.current = targetFrame;
        setCurrentFrame(targetFrame);
        drawFrame(targetFrame);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [drawFrame]);

  const activeAnnotationIndex = ANNOTATIONS.findIndex(
    (a) => scrollProgress >= a.startPct && scrollProgress <= a.endPct
  );
  const activeAnnotation = ANNOTATIONS[activeAnnotationIndex >= 0 ? activeAnnotationIndex : 0];

  const jumpToAnnotation = (idx) => {
    const target = ANNOTATIONS[idx];
    if (!target || !containerRef.current) return;
    playTactileClick(460 + idx * 35);
    const rect = containerRef.current.getBoundingClientRect();
    const totalScrollable = containerRef.current.offsetHeight - window.innerHeight;
    const targetScrollY = window.scrollY + rect.top + (target.startPct + 0.04) * totalScrollable;
    window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
  };

  const loadPercent = Math.round((loadedCount / TOTAL_FRAMES) * 100);

  return (
    <section
      id="smocha"
      ref={containerRef}
      className="relative w-full h-[520vh] bg-[#030508]"
    >
      {/* Sticky Viewport Container */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden z-20 flex flex-col justify-between">
        {/* Background Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover z-0" />

        {/* Ambient Dark Gradient Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#030508] via-transparent to-[#030508]/80 pointer-events-none z-10" />

        {/* Loading overlay — only shown until initial batch is ready */}
        <AnimatePresence>
          {!isInitialBatchReady && (
            <motion.div
              key="smocha-loader"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#030508]"
            >
              {/* Circular progress ring */}
              <div className="relative w-20 h-20 mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="35" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                  <circle
                    cx="40" cy="40" r="35"
                    fill="none"
                    stroke="#eab308"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 35}`}
                    strokeDashoffset={`${2 * Math.PI * 35 * (1 - loadedCount / INITIAL_BATCH)}`}
                    style={{ transition: 'stroke-dashoffset 0.2s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Utensils className="w-6 h-6 text-amber-400" />
                </div>
              </div>
              <span className="font-mono-tech text-[10px] uppercase tracking-widest text-amber-400">
                05 / Deconstructed Street Food
              </span>
              <span className="mt-2 font-mono-tech text-[9px] uppercase tracking-wider text-slate-500">
                Preparing {loadPercent}%
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Editorial Text Overlay */}
        <div className="relative z-20 h-full max-w-7xl mx-auto px-6 sm:px-12 flex flex-col justify-between pt-24 pb-12 pointer-events-none w-full">
          {/* Top Section Header with 8 Interactive Layer Pills */}
          <div className="flex flex-col gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-amber-400" />
                <span className="font-mono-tech text-xs uppercase tracking-widest text-amber-400 font-bold">
                  05 / Smocha Anatomy • 8 Deconstruction Layers
                </span>
              </div>
              <div className="flex items-center gap-4">
                {loadedCount < TOTAL_FRAMES && (
                  <span className="font-mono-tech text-[9px] uppercase text-slate-600 hidden sm:inline-block">
                    {loadPercent}% cached
                  </span>
                )}
                <span className="font-mono-tech text-[10px] uppercase text-amber-300 font-semibold">
                  Layer 0{Math.max(1, activeAnnotationIndex + 1)} of 0{ANNOTATIONS.length}
                </span>
              </div>
            </div>

            {/* Quick-Jump Layer Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pointer-events-auto no-scrollbar">
              {ANNOTATIONS.map((item, idx) => {
                const isActive = activeAnnotation.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => jumpToAnnotation(idx)}
                    onMouseEnter={() => playTactileClick(700)}
                    className={`shrink-0 px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-mono-tech uppercase tracking-wider transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/70 shadow-[0_0_12px_rgba(245,158,11,0.3)] font-bold'
                        : 'bg-black/60 text-slate-400 border border-white/10 hover:text-white hover:border-white/30'
                    }`}
                  >
                    0{idx + 1} {item.shortTitle}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Step Annotation Callout */}
          <div className="flex flex-col items-start pointer-events-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeAnnotation.id}
                initial={{ opacity: 0, y: 18, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-md bg-black/85 p-6 sm:p-8 rounded-3xl border border-white/15 backdrop-blur-xl shadow-2xl"
              >
                <div className="mb-2">
                  <span className="font-mono-tech text-[10px] uppercase tracking-widest text-amber-400 block">
                    {activeAnnotation.label}
                  </span>
                </div>
                <h3 className="font-heading text-2xl sm:text-3xl font-black uppercase text-white tracking-tight whitespace-pre-line leading-tight">
                  {activeAnnotation.headline}
                </h3>
                <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                  {activeAnnotation.body}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Progress Bar + Layer Dots */}
          <div className="space-y-2 pointer-events-auto">
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-75"
                style={{ width: `${scrollProgress * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="font-mono-tech text-[9px] uppercase tracking-widest text-slate-400">
                Scroll or click layer pills above to scrub all 8 culinary components
              </p>
              <div className="flex items-center gap-1.5">
                {ANNOTATIONS.map((a, idx) => {
                  const isActive = activeAnnotation.id === a.id;
                  return (
                    <button
                      key={a.id}
                      onClick={() => jumpToAnnotation(idx)}
                      onMouseEnter={() => playTactileClick(700)}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        isActive ? 'w-6 bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'w-2 bg-white/20 hover:bg-white/50'
                      }`}
                      title={a.headline}
                      aria-label={`Jump to layer ${a.label}`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
