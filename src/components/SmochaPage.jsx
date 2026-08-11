import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const TOTAL_FRAMES = 240;

const getFramePath = (index) => {
  const padded = String(index).padStart(4, '0');
  return `/frames_smocha/frame_${padded}.jpg`;
};

// 8 Scroll annotation stages integrated directly into the 240-frame scroll experience
const ANNOTATIONS = [
  {
    id: 'whole',
    stepNum: '01',
    stepName: 'THE WHOLE',
    label: '01 / THE WHOLE',
    headline: 'MORE THAN A SNACK.',
    body: 'A Kenyan street-food classic built from simple ingredients and unforgettable character.',
    startPct: 0.0,
    endPct: 0.12,
    side: 'left',
  },
  {
    id: 'chapati',
    stepNum: '02',
    stepName: 'CHAPATI',
    label: '02 / THE FOUNDATION',
    headline: 'CHAPATI',
    body: 'Soft, golden and handmade, chapati forms the wrap that brings every part of the Smocha together.',
    startPct: 0.12,
    endPct: 0.25,
    side: 'left',
  },
  {
    id: 'smokie',
    stepNum: '03',
    stepName: 'SMOKIE',
    label: '03 / THE HEART',
    headline: 'SMOKIE',
    body: 'The unmistakable centrepiece of the Smocha — smoky, savoury and cooked to bring depth to every bite.',
    startPct: 0.25,
    endPct: 0.38,
    side: 'left',
  },
  {
    id: 'tomato',
    stepNum: '04',
    stepName: 'TOMATO',
    label: '04 / FRESHNESS',
    headline: 'TOMATO',
    body: 'Fresh diced tomato brings brightness, juiciness and a naturally sweet contrast to the savoury smokie.',
    startPct: 0.38,
    endPct: 0.51,
    side: 'right',
  },
  {
    id: 'onion',
    stepNum: '05',
    stepName: 'ONION',
    label: '05 / THE CRUNCH',
    headline: 'ONION',
    body: 'Fresh sliced onion adds a crisp texture and sharpness that balances the richness of the Smocha.',
    startPct: 0.51,
    endPct: 0.64,
    side: 'left',
  },
  {
    id: 'coriander',
    stepNum: '06',
    stepName: 'CORIANDER',
    label: '06 / THE FINISH',
    headline: 'CORIANDER',
    body: 'Fresh coriander adds a bright herbal note that brings the kachumbari together.',
    startPct: 0.64,
    endPct: 0.76,
    side: 'right',
  },
  {
    id: 'sauce',
    stepNum: '07',
    stepName: 'SAUCE',
    label: '07 / THE FINAL LAYER',
    headline: 'SAUCE',
    body: 'A finishing layer of sauce ties the flavours together and gives the Smocha its unmistakable street-food character.',
    startPct: 0.76,
    endPct: 0.88,
    side: 'left',
  },
  {
    id: 'exploded',
    stepNum: '08',
    stepName: 'EXPLODED',
    label: '08 / EVERY LAYER MATTERS',
    headline: 'SIMPLE INGREDIENTS.\nBIG CHARACTER.',
    body: 'Every layer has a role. Together, they make the Smocha.',
    startPct: 0.88,
    endPct: 1.0,
    side: 'left',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
export default function SmochaPage({ onClose }) {
  const containerRef = useRef(null);
  const stickySectionRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const animFrameRef = useRef(null);

  const targetFrameRef = useRef(1);
  const currentFrameRef = useRef(1);
  const lastDrawnRef = useRef(0);

  const cursorDotRef = useRef(null);
  const cursorRingRef = useRef(null);
  const cursorPosRef = useRef({ x: -100, y: -100 });
  const ringPosRef = useRef({ x: -100, y: -100 });

  const [framesLoaded, setFramesLoaded] = useState(0);
  const [isFirstFrameReady, setIsFirstFrameReady] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeAnnotation, setActiveAnnotation] = useState(null);

  // ── Canvas Rendering ─────────────────────────────────────────────────────
  const renderFrame = useCallback((frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imagesRef.current[frameIndex - 1];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const cw = canvas.width / dpr;
    const ch = canvas.height / dpr;

    // Clear + fill black to match page bg
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Object-contain draw, centred
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = cw / ch;
    let dw, dh, dx, dy;
    if (imgRatio > canvasRatio) {
      dw = cw;
      dh = cw / imgRatio;
      dx = 0;
      dy = (ch - dh) / 2;
    } else {
      dh = ch;
      dw = ch * imgRatio;
      dx = (cw - dw) / 2;
      dy = 0;
    }

    ctx.drawImage(img, dx * dpr, dy * dpr, dw * dpr, dh * dpr);
    lastDrawnRef.current = frameIndex;
  }, []);

  // ── Animation Loop ───────────────────────────────────────────────────────
  const startAnimationLoop = useCallback(() => {
    const loop = () => {
      animFrameRef.current = requestAnimationFrame(loop);

      // Lerp frame index for smooth scrubbing
      const diff = targetFrameRef.current - currentFrameRef.current;
      if (Math.abs(diff) > 0.3) {
        currentFrameRef.current += diff * 0.12;
      } else {
        currentFrameRef.current = targetFrameRef.current;
      }

      const frameIndex = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(currentFrameRef.current)));
      if (frameIndex !== lastDrawnRef.current) {
        renderFrame(frameIndex);
      }

      // Cursor ring smooth follow
      const dot = cursorDotRef.current;
      const ring = cursorRingRef.current;
      if (dot && ring) {
        const { x, y } = cursorPosRef.current;
        dot.style.left = `${x}px`;
        dot.style.top = `${y}px`;
        ringPosRef.current.x += (x - ringPosRef.current.x) * 0.1;
        ringPosRef.current.y += (y - ringPosRef.current.y) * 0.1;
        ring.style.left = `${ringPosRef.current.x}px`;
        ring.style.top = `${ringPosRef.current.y}px`;
      }
    };
    animFrameRef.current = requestAnimationFrame(loop);
  }, [renderFrame]);

  // ── Canvas Resize ────────────────────────────────────────────────────────
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    renderFrame(Math.round(currentFrameRef.current));
  }, [renderFrame]);

  // ── Frame Preloading ─────────────────────────────────────────────────────
  useEffect(() => {
    imagesRef.current = new Array(TOTAL_FRAMES);
    let loaded = 0;

    const onLoad = () => {
      loaded++;
      setFramesLoaded(loaded);
    };

    const loadFrame = (i) => {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = () => {
        imagesRef.current[i - 1] = img;
        if (i === 1) {
          setIsFirstFrameReady(true);
          renderFrame(1);
        }
        onLoad();
      };
      img.onerror = onLoad;
    };

    // Priority: frame 1 immediately
    loadFrame(1);
    // Then frames 2–30
    for (let i = 2; i <= 30; i++) loadFrame(i);
    // Rest in small batches to avoid memory spike
    let idx = 31;
    const loadBatch = () => {
      const end = Math.min(idx + 15, TOTAL_FRAMES);
      for (let i = idx; i <= end; i++) loadFrame(i);
      idx = end + 1;
      if (idx <= TOTAL_FRAMES) setTimeout(loadBatch, 60);
    };
    setTimeout(loadBatch, 300);

    return () => { imagesRef.current = []; };
  }, [renderFrame]);

  // ── Canvas Init & Resize Listener ────────────────────────────────────────
  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  // ── Start Animation Loop ─────────────────────────────────────────────────
  useEffect(() => {
    startAnimationLoop();
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [startAnimationLoop]);

  // ── Scroll Tracking (sticky 3D experience section scope) ───────────────
  useEffect(() => {
    const scrollEl = containerRef.current;
    const stickyEl = stickySectionRef.current;
    if (!scrollEl || !stickyEl) return;

    const handleScroll = () => {
      const scrollTop = scrollEl.scrollTop;
      const stickyTop = stickyEl.offsetTop;
      const stickyHeight = stickyEl.offsetHeight;
      const viewportHeight = scrollEl.clientHeight;
      const maxStickyScroll = stickyHeight - viewportHeight;

      if (maxStickyScroll <= 0) return;

      const relativeScroll = scrollTop - stickyTop;
      const rawProgress = relativeScroll / maxStickyScroll;
      const progress = Math.max(0, Math.min(1, rawProgress));

      setScrollProgress(progress);

      // Map progress (0 -> 1) strictly to frames (1 -> 240)
      const frameIndex = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(1 + progress * (TOTAL_FRAMES - 1))));
      targetFrameRef.current = frameIndex;

      // Active annotation during scroll experience section
      if (relativeScroll >= 0 && relativeScroll <= maxStickyScroll) {
        const ann = ANNOTATIONS.find(a => progress >= a.startPct && progress <= a.endPct);
        setActiveAnnotation(ann ? ann.id : null);
      } else {
        setActiveAnnotation(null);
      }
    };

    scrollEl.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => scrollEl.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Custom Cursor Tracking ───────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e) => { cursorPosRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // ── Lock body scroll ─────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const loadPercent = Math.round((framesLoaded / TOTAL_FRAMES) * 100);
  const isReady = isFirstFrameReady && framesLoaded >= 10;

  // ════════════════════════════════════════════════════════════════════════════
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: '#050505',
        overflow: 'hidden',
      }}
    >
      {/* Custom Cursor Elements */}
      <div ref={cursorDotRef} className="smocha-cursor" style={{ display: 'none' }} />
      <div ref={cursorRingRef} className="smocha-cursor-ring" style={{ display: 'none' }} />

      {/* ── LOADING SCREEN ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {!isReady && (
          <motion.div
            key="smocha-loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.9, ease: 'easeOut' } }}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 200,
              backgroundColor: '#050505',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '56px',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '11px',
                letterSpacing: '0.35em',
                color: '#9A9A94',
                textTransform: 'uppercase',
                marginBottom: '24px',
              }}>
                KENYAN STREET FOOD / 01
              </p>
              <h1 style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(4rem, 12vw, 9rem)',
                fontWeight: '300',
                color: '#F5F5F0',
                lineHeight: 0.88,
                letterSpacing: '-0.03em',
              }}>
                SMOCHA
              </h1>
            </div>

            <div style={{ textAlign: 'center' }}>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '11px',
                letterSpacing: '0.25em',
                color: '#9A9A94',
                textTransform: 'uppercase',
                marginBottom: '24px',
              }}>
                PREPARING THE EXPERIENCE
              </p>
              {/* Minimal progress line */}
              <div style={{
                width: '160px',
                height: '1px',
                backgroundColor: 'rgba(255,255,255,0.08)',
                margin: '0 auto',
                position: 'relative',
              }}>
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: `${loadPercent}%` }}
                  transition={{ ease: 'linear' }}
                  style={{
                    position: 'absolute',
                    left: 0, top: 0,
                    height: '100%',
                    backgroundColor: '#C99A55',
                  }}
                />
              </div>
              <p style={{
                marginTop: '16px',
                fontFamily: "'Inter', sans-serif",
                fontSize: '12px',
                color: '#9A9A94',
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '0.15em',
              }}>
                {String(loadPercent).padStart(2, '0')} — 100
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN SCROLLABLE CONTAINER ────────────────────────────────────────── */}
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          inset: 0,
          overflowY: 'scroll',
          overflowX: 'hidden',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(201,154,85,0.25) transparent',
        }}
        onMouseEnter={() => {
          if (cursorDotRef.current) cursorDotRef.current.style.display = 'block';
          if (cursorRingRef.current) cursorRingRef.current.style.display = 'block';
        }}
        onMouseLeave={() => {
          if (cursorDotRef.current) cursorDotRef.current.style.display = 'none';
          if (cursorRingRef.current) cursorRingRef.current.style.display = 'none';
        }}
      >

        {/* ── NAVIGATION ────────────────────────────────────────────────────── */}
        <nav style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 150,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '28px 48px',
          pointerEvents: 'none',
          background: 'linear-gradient(to bottom, rgba(5,5,5,0.7) 0%, transparent 100%)',
        }}>
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '11px',
            fontWeight: '500',
            letterSpacing: '0.3em',
            color: '#9A9A94',
            textTransform: 'uppercase',
          }}>
            KARIBU KENYA
          </span>

          <button
            onClick={onClose}
            style={{
              pointerEvents: 'auto',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: "'Inter', sans-serif",
              fontSize: '11px',
              fontWeight: '500',
              letterSpacing: '0.2em',
              color: '#9A9A94',
              textTransform: 'uppercase',
              padding: '8px 0',
              transition: 'color 0.3s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#F5F5F0'}
            onMouseLeave={e => e.currentTarget.style.color = '#9A9A94'}
          >
            <ArrowLeft size={14} />
            BACK
          </button>
        </nav>

        {/* ── 01 INTRO SECTION ──────────────────────────────────────────────── */}
        <section style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '120px 48px 80px',
          textAlign: 'center',
          backgroundColor: '#050505',
          overflow: 'hidden',
        }}>
          {/* Grain */}
          <div className="smocha-grain" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }} />
          {/* Vignette */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 2,
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(5,5,5,0.85) 100%)',
            pointerEvents: 'none',
          }} />
          {/* Faint preview image behind */}
          {isFirstFrameReady && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 0,
              opacity: 0.12,
              backgroundImage: `url(${getFramePath(1)})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              filter: 'blur(8px)',
              pointerEvents: 'none',
            }} />
          )}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            style={{ position: 'relative', zIndex: 3 }}
          >
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '11px',
              fontWeight: '500',
              letterSpacing: '0.4em',
              color: '#C99A55',
              textTransform: 'uppercase',
              marginBottom: '36px',
            }}>
              SMOCHA — KENYAN STREET FOOD / 01
            </p>

            <h1 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(3.5rem, 11vw, 10rem)',
              fontWeight: '300',
              color: '#F5F5F0',
              lineHeight: 0.88,
              letterSpacing: '-0.025em',
              marginBottom: '48px',
            }}>
              MORE THAN<br />
              <em style={{ fontStyle: 'italic', color: '#E4B66A' }}>A SNACK.</em>
            </h1>

            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 'clamp(14px, 1.5vw, 17px)',
              fontWeight: '300',
              color: '#9A9A94',
              maxWidth: '460px',
              lineHeight: 1.8,
              margin: '0 auto 80px',
            }}>
              A Kenyan street-food classic, built from simple ingredients and unforgettable character.
            </p>

            {/* Scroll indicator */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}
            >
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '10px',
                letterSpacing: '0.35em',
                color: '#9A9A94',
                textTransform: 'uppercase',
              }}>
                SCROLL TO DECONSTRUCT
              </p>
              <div style={{
                width: '1px', height: '52px',
                background: 'linear-gradient(to bottom, rgba(201,154,85,0.8), transparent)',
              }} />
            </motion.div>
          </motion.div>
        </section>

        {/* ── 02 IMMERSIVE 240-FRAME SCROLL & INGREDIENT EXPERIENCE ──────────── */}
        <section ref={stickySectionRef} style={{ position: 'relative', height: '600vh', backgroundColor: '#050505' }}>
          {/* Sticky viewport */}
          <div style={{
            position: 'sticky', top: 0,
            height: '100vh',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {/* Vignette */}
            <div style={{
              position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
              background: 'radial-gradient(ellipse at center, transparent 45%, rgba(5,5,5,0.92) 100%)',
            }} />
            {/* Grain */}
            <div className="smocha-grain" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 3 }} />

            {/* Canvas — Smocha floats in deep black stage */}
            <canvas
              ref={canvasRef}
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                display: 'block', zIndex: 1,
              }}
            />

            {/* Left-side subtle Step Progress Indicator */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: 'clamp(24px, 4vw, 48px)',
              transform: 'translateY(-50%)',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              pointerEvents: 'none',
            }} className="hidden md:flex">
              {ANNOTATIONS.map((ann, idx) => {
                const isActive = activeAnnotation === ann.id;
                return (
                  <div
                    key={ann.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      opacity: isActive ? 1 : 0.25,
                      transition: 'opacity 0.4s ease',
                    }}
                  >
                    <span style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '9px',
                      fontWeight: '600',
                      letterSpacing: '0.2em',
                      color: isActive ? '#C99A55' : '#9A9A94',
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {ann.stepNum}
                    </span>
                    <div style={{
                      width: isActive ? '20px' : '8px',
                      height: '1px',
                      backgroundColor: isActive ? '#C99A55' : 'rgba(255,255,255,0.2)',
                      transition: 'all 0.4s ease',
                    }} />
                    <span style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '9px',
                      fontWeight: '500',
                      letterSpacing: '0.25em',
                      color: isActive ? '#F5F5F0' : '#9A9A94',
                      textTransform: 'uppercase',
                      display: isActive ? 'inline' : 'none',
                    }}>
                      {ann.stepName}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Floating Editorial Text Panel (Alternating Left/Right floating over darkness) */}
            {ANNOTATIONS.map((ann) => {
              const isActive = activeAnnotation === ann.id;
              return (
                <AnimatePresence key={ann.id}>
                  {isActive && (
                    <motion.div
                      key={`${ann.id}-editorial`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -16 }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        [ann.side === 'left' ? 'left' : 'right']: 'clamp(28px, 6vw, 120px)',
                        zIndex: 10,
                        maxWidth: 'min(380px, 85vw)',
                        textAlign: ann.side === 'left' ? 'left' : 'right',
                        pointerEvents: 'none',
                      }}
                    >
                      {/* Step Sublabel */}
                      <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '10px',
                        fontWeight: '600',
                        letterSpacing: '0.35em',
                        color: '#C99A55',
                        textTransform: 'uppercase',
                        marginBottom: '16px',
                      }}>
                        {ann.label}
                      </p>

                      {/* Editorial Headline */}
                      <h2 style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontSize: 'clamp(2.5rem, 5vw, 5rem)',
                        fontWeight: '300',
                        color: '#F5F5F0',
                        lineHeight: 0.92,
                        letterSpacing: '-0.02em',
                        marginBottom: '20px',
                        whiteSpace: 'pre-line',
                      }}>
                        {ann.headline}
                      </h2>

                      {/* Editorial Description */}
                      <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 'clamp(13px, 1.2vw, 16px)',
                        fontWeight: '300',
                        color: '#9A9A94',
                        lineHeight: 1.8,
                        letterSpacing: '0.01em',
                      }}>
                        {ann.body}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              );
            })}

            {/* Scroll progress micro-bar + counter */}
            <div style={{
              position: 'absolute', bottom: '32px', left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
              display: 'flex', alignItems: 'center', gap: '14px',
            }}>
              <div style={{
                width: '100px', height: '1px',
                backgroundColor: 'rgba(255,255,255,0.07)',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, height: '100%',
                  backgroundColor: '#C99A55',
                  width: `${scrollProgress * 100}%`,
                  transition: 'width 0.1s linear',
                }} />
              </div>
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '10px', letterSpacing: '0.2em',
                color: '#9A9A94', fontVariantNumeric: 'tabular-nums',
              }}>
                {String(Math.min(TOTAL_FRAMES, Math.max(1, Math.round(1 + scrollProgress * (TOTAL_FRAMES - 1))))).padStart(3, '0')} / 240
              </span>
            </div>
          </div>
        </section>

        {/* ── 04 KENYAN IDENTITY SECTION ────────────────────────────────────── */}
        <section style={{
          backgroundColor: '#0A0A0A',
          padding: 'clamp(80px, 12vw, 180px) clamp(24px, 6vw, 100px)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Warm ambient glow */}
          <div style={{
            position: 'absolute', bottom: '-15%', right: '-8%',
            width: '55vw', height: '55vw', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(201,154,85,0.04) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'clamp(48px, 7vw, 100px)',
              alignItems: 'start',
              marginBottom: 'clamp(60px, 8vw, 120px)',
            }}>
              {/* Headline */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '11px', fontWeight: '500',
                  letterSpacing: '0.38em', color: '#C99A55',
                  textTransform: 'uppercase', marginBottom: '32px',
                }}>
                  KENYAN IDENTITY
                </p>
                <h2 style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 'clamp(2.5rem, 5.5vw, 6rem)',
                  fontWeight: '300', color: '#F5F5F0',
                  lineHeight: 0.9, letterSpacing: '-0.02em',
                  marginBottom: '20px',
                }}>
                  BORN ON<br />THE STREETS.
                </h2>
                <h2 style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 'clamp(1.8rem, 3.8vw, 4.2rem)',
                  fontWeight: '300', fontStyle: 'italic',
                  color: '#E4B66A', lineHeight: 0.95,
                  letterSpacing: '-0.01em',
                }}>
                  Refined by every<br />generation.
                </h2>
              </motion.div>

              {/* Story text */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}
              >
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 'clamp(14px, 1.3vw, 16px)',
                  fontWeight: '300', color: '#9A9A94', lineHeight: 1.85,
                }}>
                  The Smocha has no single origin story. It was not invented in a kitchen — it materialised on the pavements of Nairobi, Mombasa, Kisumu, shaped by the hands of vendors who understood hunger better than any recipe card.
                </p>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 'clamp(14px, 1.3vw, 16px)',
                  fontWeight: '300', color: '#9A9A94', lineHeight: 1.85,
                }}>
                  A chapati rolled around a smokie — portable, immediate, satisfying. It became the shared language of the city: eaten by students, workers, night-shift nurses and late-night revellers alike.
                </p>
                <p style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 'clamp(14px, 1.3vw, 16px)',
                  fontWeight: '300', color: '#9A9A94', lineHeight: 1.85,
                }}>
                  Each generation refines it — a different sauce, a different fold, a different rhythm. The Smocha is not a product. It is a conversation that never ends.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '8px' }}>
                  <div style={{ width: '36px', height: '1px', backgroundColor: '#C99A55', opacity: 0.6 }} />
                  <span style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '10px', letterSpacing: '0.3em',
                    color: '#C99A55', textTransform: 'uppercase',
                  }}>
                    NAIROBI, KENYA
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Pull quote */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              style={{
                borderTop: '1px solid rgba(255,255,255,0.06)',
                paddingTop: 'clamp(48px, 7vw, 100px)',
                textAlign: 'center',
              }}
            >
              <p style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(1.6rem, 3.5vw, 4rem)',
                fontWeight: '300', fontStyle: 'italic',
                color: '#F5F5F0', lineHeight: 1.25, letterSpacing: '-0.01em',
                maxWidth: '820px', margin: '0 auto',
              }}>
                "The best Smocha is always the one you had standing up,
                at the roadside, in the rain."
              </p>
              <p style={{
                marginTop: '24px',
                fontFamily: "'Inter', sans-serif",
                fontSize: '10px', letterSpacing: '0.3em',
                color: '#9A9A94', textTransform: 'uppercase',
              }}>
                — EVERY KENYAN, ALWAYS
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── 05 FINAL REASSEMBLY SECTION ───────────────────────────────────── */}
        <section style={{
          backgroundColor: '#050505',
          padding: 'clamp(80px, 10vw, 160px) clamp(24px, 6vw, 100px)',
          minHeight: '100vh',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden', textAlign: 'center',
        }}>
          <div className="smocha-grain" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }} />

          {/* Warm ambient behind food */}
          <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '70vw', height: '70vw', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(201,154,85,0.06) 0%, transparent 65%)',
            pointerEvents: 'none',
          }} />

          {/* Final frame — assembled Smocha */}
          {isFirstFrameReady && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'relative',
                width: 'min(560px, 82vw)',
                aspectRatio: '1 / 1',
                marginBottom: 'clamp(48px, 6vw, 80px)',
                zIndex: 2,
              }}
            >
              <img
                src={getFramePath(1)}
                alt="Smocha fully assembled"
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'contain', display: 'block',
                }}
              />
            </motion.div>
          )}

          {/* Statement */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
            style={{ position: 'relative', zIndex: 2 }}
          >
            <h2 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(2.5rem, 7vw, 7.5rem)',
              fontWeight: '300', color: '#F5F5F0',
              lineHeight: 0.88, letterSpacing: '-0.02em',
              marginBottom: '32px',
            }}>
              240 FRAMES.<br />
              <em style={{ fontStyle: 'italic', color: '#E4B66A' }}>ONE ICON.</em>
            </h2>

            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '12px', fontWeight: '400',
              letterSpacing: '0.25em', color: '#9A9A94',
              textTransform: 'uppercase', marginBottom: '10px',
            }}>
              SIMPLE INGREDIENTS.
            </p>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '12px', fontWeight: '400',
              letterSpacing: '0.25em', color: '#9A9A94',
              textTransform: 'uppercase',
              marginBottom: 'clamp(48px, 6vw, 72px)',
            }}>
              BIG CHARACTER.
            </p>

            {/* CTA */}
            <motion.button
              onClick={onClose}
              whileHover={{ gap: '18px' }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '12px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                fontSize: '12px', fontWeight: '500',
                letterSpacing: '0.25em', color: '#F5F5F0',
                textTransform: 'uppercase',
                padding: '12px 0',
                borderBottom: '1px solid rgba(255,255,255,0.15)',
                transition: 'all 0.4s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#E4B66A'; e.currentTarget.style.borderColor = 'rgba(201,154,85,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#F5F5F0'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
            >
              EXPLORE MORE
              <ArrowRight size={14} />
            </motion.button>
          </motion.div>

          {/* Watermark */}
          <div style={{
            position: 'absolute', bottom: '36px', left: '50%',
            transform: 'translateX(-50%)', zIndex: 3,
          }}>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '10px', letterSpacing: '0.3em',
              color: 'rgba(255,255,255,0.1)', textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}>
              A KARIBU KENYA EXPERIENCE
            </p>
          </div>
        </section>

      </div>{/* /scrollable */}
    </motion.div>
  );
}
