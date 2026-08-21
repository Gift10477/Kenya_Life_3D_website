import React, { useEffect, useRef, useState } from 'react';
import { ArrowUp } from 'lucide-react';

/**
 * EpilogueChapter — Cinematic close to the Karibu Kenya spatial archive.
 *
 * Redesigned from the original text-card grid into a full-bleed
 * spatial epilogue with:
 *  1. Full-bleed parallax Kenya flag gradient backdrop
 *  2. "Harambee" animated hero quote with masked reveal
 *  3. Animated stat counters (Observer-triggered)
 *  4. Kenya flag tricolor horizontal rule
 *  5. Credit bar with Back to Top CTA
 */

const STATS = [
  { value: 54, suffix: '+', label: 'Years of Independence' },
  { value: 47, suffix: '', label: 'Diverse Counties' },
  { value: 42, suffix: '+', label: 'Ethnic Communities' },
  { value: 3, suffix: 'D', label: 'Spatial Chapters Built' },
];

function useCountUp(target, duration = 1800, trigger) {
  const [count, setCount] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!trigger) return;
    const start = performance.now();

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, trigger]);

  return count;
}

function StatCounter({ value, suffix, label }) {
  const ref = useRef(null);
  const [fired, setFired] = useState(false);
  const count = useCountUp(value, 1600, fired);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setFired(true); observer.disconnect(); } },
      { threshold: 0.6 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="flex flex-col items-center gap-1 text-center">
      <span
        className="font-heading font-black text-5xl sm:text-6xl lg:text-7xl tabular-nums leading-none"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #d9b36c 60%, #f59e0b 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {count}{suffix}
      </span>
      <span className="font-mono-tech text-[10px] uppercase tracking-[0.22em] text-slate-400 max-w-[8rem]">
        {label}
      </span>
    </div>
  );
}

export default function EpilogueChapter() {
  const sectionRef = useRef(null);
  const quoteRef = useRef(null);
  const [quoteVisible, setQuoteVisible] = useState(false);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  useEffect(() => {
    const el = quoteRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setQuoteVisible(true); observer.disconnect(); } },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Parallax scroll on the gradient backdrop
  useEffect(() => {
    const el = sectionRef.current;
    const bg = el?.querySelector('.epilogue-parallax-bg');
    if (!bg) return;

    const handleScroll = () => {
      const rect = el.getBoundingClientRect();
      const progress = -rect.top / (rect.height + window.innerHeight);
      bg.style.transform = `translateY(${progress * -40}px)`;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <footer
      id="epilogue"
      ref={sectionRef}
      className="relative overflow-hidden bg-[#020305]"
    >
      {/* ===================================================================== */}
      {/* 1. FULL-BLEED PARALLAX GRADIENT BACKDROP                             */}
      {/* ===================================================================== */}
      <div
        className="epilogue-parallax-bg absolute inset-0 pointer-events-none will-change-transform"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% -5%, rgba(222,32,16,0.12) 0%, transparent 55%),
            radial-gradient(ellipse 60% 40% at 20% 80%, rgba(0,106,78,0.10) 0%, transparent 55%),
            radial-gradient(ellipse 50% 35% at 80% 70%, rgba(217,179,108,0.07) 0%, transparent 55%)
          `,
        }}
      />

      {/* Fine grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)`,
          backgroundSize: '44px 44px',
        }}
      />

      {/* Top border — Kenya flag tricolor line */}
      <div className="absolute inset-x-0 top-0 h-[3px] flex overflow-hidden">
        <div className="flex-1 bg-[#de2010]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#006a4e]" />
      </div>

      {/* ===================================================================== */}
      {/* MAIN CONTENT                                                          */}
      {/* ===================================================================== */}
      <div className="relative max-w-7xl mx-auto px-6 sm:px-12 pt-20 sm:pt-28 pb-16 sm:pb-24 space-y-20 sm:space-y-28">

        {/* ================================================================= */}
        {/* 2. HARAMBEE HERO QUOTE                                            */}
        {/* ================================================================= */}
        <div
          ref={quoteRef}
          className="text-center space-y-6 sm:space-y-8"
        >
          {/* Chapter tag */}
          <div className="flex justify-center">
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border font-mono-tech text-[10px] uppercase tracking-widest"
              style={{ borderColor: 'rgba(217,179,108,0.3)', color: '#d9b36c' }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: '#d9b36c' }}
              />
              06 / Epilogue • Harambee Spirit
            </span>
          </div>

          {/* Giant Harambee wordmark */}
          <div className="overflow-hidden">
            <h2
              className="font-heading font-black uppercase leading-none select-none"
              style={{
                fontSize: 'clamp(4rem, 14vw, 13rem)',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(217,179,108,0.9) 45%, rgba(222,32,16,0.7) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                transform: quoteVisible ? 'translateY(0)' : 'translateY(60px)',
                opacity: quoteVisible ? 1 : 0,
                transition: 'transform 1.1s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.1s ease',
              }}
            >
              HARAMBEE
            </h2>
          </div>

          {/* Translation + context */}
          <div
            style={{
              opacity: quoteVisible ? 1 : 0,
              transform: quoteVisible ? 'translateY(0)' : 'translateY(24px)',
              transition: 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.2s, opacity 1.2s ease 0.2s',
            }}
          >
            <p className="font-serif-display text-xl sm:text-3xl italic text-slate-300 leading-snug font-light max-w-2xl mx-auto">
              "We Pull Together"
            </p>
            <p
              className="mt-4 max-w-xl mx-auto text-sm text-slate-400 font-light leading-relaxed"
              style={{ fontSize: '0.875rem' }}
            >
              Kenya's national ethos — a single Swahili word that carries the weight of 54 years
              of sovereignty, 47 distinct counties, and 42+ communities building one nation
              from the Indian Ocean coast to the slopes of Mount Kenya.
            </p>
          </div>

          {/* Decorative horizontal rule — Kenya tricolor */}
          <div
            className="flex items-center gap-2 max-w-xs mx-auto mt-2"
            style={{
              opacity: quoteVisible ? 1 : 0,
              transition: 'opacity 1s ease 0.5s',
            }}
          >
            <div className="flex-1 h-[1px] bg-[#de2010] opacity-60" />
            <span className="font-mono-tech text-[8px] text-slate-500 uppercase tracking-widest px-2">🇰🇪</span>
            <div className="flex-1 h-[1px] bg-[#006a4e] opacity-60" />
          </div>
        </div>

        {/* ================================================================= */}
        {/* 3. ANIMATED STAT COUNTERS                                         */}
        {/* ================================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-12 border-y border-white/[0.06] py-12 sm:py-16">
          {STATS.map((stat) => (
            <StatCounter key={stat.label} value={stat.value} suffix={stat.suffix} label={stat.label} />
          ))}
        </div>

        {/* ================================================================= */}
        {/* 4. EDITORIAL TRIPTYCH                                             */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {[
            {
              color: '#d9b36c',
              label: 'Architectural Duality',
              text: 'From independence-era limestone parliament towers to gleaming Nairobi high-rises, Kenyan design bridges ancestral civic form with progressive ambition — a skyline that tells its own history.',
            },
            {
              color: '#a855f7',
              label: 'Kinetic Street Technology',
              text: 'Matatu vehicle culture stands as one of the world\'s most vibrant mobile pop-art archives — customised transit icons uniting hand-painted graffiti, sub-bass arrays, and the restless pulse of Nairobi routes.',
            },
            {
              color: '#10b981',
              label: 'Culinary Character',
              text: 'From the Smocha\'s street-corner chapati wrap to the Nyama Choma open fire, Kenyan food culture proves that the most timeless urban traditions are built from intention, not complexity.',
            },
          ].map(({ color, label, text }) => (
            <div
              key={label}
              className="space-y-4 p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors duration-300"
            >
              <div
                className="w-8 h-[2px] rounded-full"
                style={{ backgroundColor: color }}
              />
              <span
                className="font-mono-tech text-xs uppercase tracking-wider block"
                style={{ color }}
              >
                {label}
              </span>
              <p className="text-sm text-slate-400 font-light leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        {/* ================================================================= */}
        {/* 5. BOTTOM CREDIT BAR                                              */}
        {/* ================================================================= */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-6 text-xs font-mono-tech text-slate-500">
          <div className="flex items-center gap-3">
            <span className="text-xl">🇰🇪</span>
            <div>
              <span className="text-white font-bold tracking-wider">KARIBU KENYA</span>
              <span className="text-slate-600 mx-2">•</span>
              <span>Spatial 3D Archive</span>
            </div>
          </div>

          <button
            onClick={scrollToTop}
            className="group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-white/15 bg-white/[0.04] text-slate-300 hover:text-white hover:border-amber-400/50 hover:bg-amber-400/[0.06] transition-all duration-300 text-xs font-mono-tech uppercase tracking-wider"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" />
          </button>

          <div className="flex items-center gap-2 text-slate-600">
            <span>React Three Fiber • Three.js • GSAP</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
