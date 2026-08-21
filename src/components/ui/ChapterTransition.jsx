import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * ChapterTransition
 *
 * A full-bleed cinematic chapter-number wipe that renders between sections.
 * Uses an IntersectionObserver to fire the animation once when the element
 * enters the viewport — plays forward automatically, no scroll-scrub required.
 *
 * Props:
 *  fromNum  – outgoing chapter number string, e.g. "03"
 *  toNum    – incoming chapter number string, e.g. "04"
 *  fromLabel – outgoing chapter name, e.g. "Big Five"
 *  toLabel  – incoming chapter name, e.g. "Nganya"
 *  accentColor – CSS colour for the accent line, default amber
 */
export default function ChapterTransition({
  fromNum = '03',
  toNum = '04',
  fromLabel = 'Big Five',
  toLabel = 'Nganya',
  accentColor = '#d9b36c',
}) {
  const wrapRef = useRef(null);
  const hasPlayed = useRef(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasPlayed.current) return;
        hasPlayed.current = true;

        if (prefersReduced) {
          // Just reveal statically
          gsap.set(wrap.querySelectorAll('.ct-anim'), { opacity: 1, y: 0, x: 0 });
          return;
        }

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        // Accent line grows from center
        tl.fromTo(
          wrap.querySelector('.ct-line'),
          { scaleX: 0 },
          { scaleX: 1, duration: 0.55, ease: 'power4.out' }
        );

        // From number fades in + up
        tl.fromTo(
          wrap.querySelector('.ct-from-num'),
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.4 },
          0.1
        );

        // From label slides in
        tl.fromTo(
          wrap.querySelector('.ct-from-label'),
          { opacity: 0, x: -18 },
          { opacity: 1, x: 0, duration: 0.35 },
          0.2
        );

        // Arrow grows
        tl.fromTo(
          wrap.querySelector('.ct-arrow'),
          { opacity: 0, scaleX: 0 },
          { opacity: 1, scaleX: 1, duration: 0.35, transformOrigin: 'left center' },
          0.35
        );

        // To number rises
        tl.fromTo(
          wrap.querySelector('.ct-to-num'),
          { opacity: 0, y: -30 },
          { opacity: 1, y: 0, duration: 0.4 },
          0.4
        );

        // To label slides in from right
        tl.fromTo(
          wrap.querySelector('.ct-to-label'),
          { opacity: 0, x: 18 },
          { opacity: 1, x: 0, duration: 0.35 },
          0.5
        );
      },
      { threshold: 0.15 }
    );

    observer.observe(wrap);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative w-full bg-[#020304] overflow-hidden select-none"
      style={{ height: '160px' }}
      aria-hidden="true"
    >
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      {/* Top edge separator */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      {/* Bottom edge separator */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Centered content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center gap-6 sm:gap-10">

          {/* FROM */}
          <div className="ct-anim ct-from-num-group flex flex-col items-end" style={{ opacity: 0 }}>
            <span
              className="ct-from-num font-heading font-black leading-none text-white/10"
              style={{ fontSize: 'clamp(3.5rem, 10vw, 8rem)', opacity: 0 }}
            >
              {fromNum}
            </span>
            <span
              className="ct-from-label font-mono-tech text-[9px] uppercase tracking-[0.28em] mt-1 text-white/25"
              style={{ opacity: 0 }}
            >
              {fromLabel}
            </span>
          </div>

          {/* Accent line + arrow */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="ct-line h-[1px] w-16 sm:w-24"
              style={{
                background: accentColor,
                opacity: 0.7,
                transformOrigin: 'center',
                transform: 'scaleX(0)',
              }}
            />
            <svg
              className="ct-arrow w-6 h-4 text-white/30"
              style={{ opacity: 0, transformOrigin: 'left center', transform: 'scaleX(0)' }}
              viewBox="0 0 24 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M0 8 L22 8 M16 2 L22 8 L16 14" />
            </svg>
          </div>

          {/* TO */}
          <div className="flex flex-col items-start">
            <span
              className="ct-to-num font-heading font-black leading-none"
              style={{
                fontSize: 'clamp(3.5rem, 10vw, 8rem)',
                color: accentColor,
                opacity: 0,
              }}
            >
              {toNum}
            </span>
            <span
              className="ct-to-label font-mono-tech text-[9px] uppercase tracking-[0.28em] mt-1"
              style={{ color: accentColor, opacity: 0 }}
            >
              {toLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
