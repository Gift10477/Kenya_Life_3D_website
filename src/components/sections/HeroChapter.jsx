import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { ChevronDown, Sparkles, MapPin, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ParliamentScene from '../canvas/ParliamentScene';
import LiquidCursor from '../LiquidCursor';
import { useBigFiveCarousel, BIG_FIVE_DATA } from '../../hooks/useBigFiveCarousel';
import { getPinnedChapterScrollY } from '../../constants/scrollTargets';

gsap.registerPlugin(ScrollTrigger);

const DISCOVERY_PAGES_SLIDES = [
  {
    id: 'hero-page',
    pageId: 'hero',
    chapterNum: '01',
    badge: 'Civic Architecture',
    title: 'The Welcome Signal',
    subtitle: 'Nairobi Sunset & 3D Parliament Landmark',
    desc: 'The National Parliament clock tower and sunset skyline, reflecting sovereign heritage and modernist civic form.',
    stat: 'Est. 1954 • Interactive 3D Spatial Canvas',
    image: `${import.meta.env.BASE_URL}images/nairobi_sunset.jpg`,
    accentColor: '#f59e0b',
    actionText: 'Scroll to Signal',
  },
  {
    id: 'bigfive-page',
    pageId: 'bigfive',
    chapterNum: '03',
    badge: 'Sacred Savannah',
    title: 'The Big Five Safari',
    subtitle: 'Lion, Leopard, Elephant, Buffalo & Rhino',
    desc: 'Interactive 3D wildlife carousel celebrating Kenya’s majestic keystone species across the Maasai Mara and Amboseli.',
    stat: '5 Keystone Species • Morphing 3D Carousel',
    image: `${import.meta.env.BASE_URL}images/lion.jpg`,
    accentColor: '#fbbf24',
    actionText: 'Explore Big Five →',
  },
  {
    id: 'matatu-page',
    pageId: 'matatu',
    chapterNum: '04',
    badge: 'Street Pulse',
    title: 'Nganya Matatu Art',
    subtitle: 'Optimus Prime, Moneyfest & Mood 3D Models',
    desc: 'Customized Nairobi transit icons with bespoke audio rigs, glowing LED matrix ceilings, and airbrushed street graffiti.',
    stat: '3 3D GLB Models • 15,000+ Active Nganyas',
    image: `${import.meta.env.BASE_URL}images/nganya.jpeg`,
    accentColor: '#a855f7',
    actionText: 'View Matatu Gallery →',
  },
  {
    id: 'smocha-page',
    pageId: 'smocha',
    chapterNum: '05',
    badge: 'Kenyan Street Food',
    title: 'Smocha Deconstructed',
    subtitle: '240-Frame Interactive Food Anatomy',
    desc: 'Cinematic scroll-scrubbed deconstruction of golden handmade chapati, savoury smokie, fresh kachumbari, and sauce.',
    stat: '240 Interactive Frames • Layer Breakdown',
    image: `${import.meta.env.BASE_URL}frames_smocha/frame_0001.jpg`,
    accentColor: '#eab308',
    actionText: 'Scrub Smocha Layers →',
  },
  {
    id: 'epilogue-page',
    pageId: 'epilogue',
    chapterNum: '06',
    badge: 'National Ethos',
    title: 'Harambee Epilogue',
    subtitle: 'Architectural Duality & Future Horizon',
    desc: 'Reflecting on Kenya’s national unity ethos, bridging ancestral roots with modern spatial digital craft.',
    stat: 'Harambee Spirit • Spatial Web Archive',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    accentColor: '#10b981',
    actionText: 'Read Epilogue →',
  },
];

export default function HeroChapter({ onExploreClick, onSectionChange }) {
  const containerRef = useRef(null);
  const modelRotationRef = useRef({ y: 0 });
  const onSectionChangeRef = useRef(onSectionChange);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [activeSlide, setActiveSlide] = useState(1);
  const [hoveredDot, setHoveredDot] = useState(null);

  useEffect(() => {
    onSectionChangeRef.current = onSectionChange;
  }, [onSectionChange]);

  // Big Five Carousel custom hook with 4-stage sequential morphing & scrubbing
  const {
    currentIndex,
    currentAnimal,
    totalSlides,
    isTransitioning,
    holdProgress,
    isHolding,
    isScrubbing,
    scrubPreviewIndex,
    goToSlide,
    goToNext,
    startHold,
    cancelHold,
    handleScrubStart,
    handleScrubMove,
    handleScrubEnd,
    handleTouchStart,
    handleTouchEnd,
    textGroupRef,
    fullBleedBgRef,
    morphStageRef,
    cardLeftRef,
    cardCenterRef,
    cardRightRef,
    scrubTrackRef,
  } = useBigFiveCarousel();

  // SVG circular ring calculations for ~96px button
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - holdProgress * circumference;

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(query.matches);
    const update = () => setReducedMotion(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  const handlePageSlideClick = (slide) => {
    if (slide.pageId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (slide.pageId === 'bigfive') {
      window.scrollTo({ top: getPinnedChapterScrollY('bigfive'), behavior: 'smooth' });
    } else if (slide.pageId === 'discovery') {
      window.scrollTo({ top: getPinnedChapterScrollY('discovery'), behavior: 'smooth' });
    } else {
      const target = document.getElementById(slide.pageId);
      if (target) {
        const top = target.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  };

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const context = gsap.context(() => {
      // Set explicit initial coordinate baseline to match CSS translate(-50%, -50%)
      gsap.set('.hero-wordmark-kenya', { xPercent: -50, yPercent: -50, opacity: 0.40 });
      gsap.set('.hero-wordmark-karibu', { xPercent: -180, yPercent: -50, opacity: 0 });

      // Main Pinned Scroll Timeline for Multi-Plane Parallax Transition into Big Five
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: () => (window.innerWidth < 768 ? '+=560%' : '+=460%'),
          pin: true,
          scrub: 1.0,
          anticipatePin: 1,
          onUpdate: (self) => {
            const p = self.progress;
            const currentSlide = p >= 0.60 ? 2 : 1;
            setActiveSlide(currentSlide);

            if (onSectionChangeRef.current) {
              if (p >= 0.65) {
                onSectionChangeRef.current('bigfive');
              } else if (p >= 0.18) {
                onSectionChangeRef.current('discovery');
              } else {
                onSectionChangeRef.current('hero');
              }
            }
          },
          onEnterBack: (self) => {
            if (onSectionChangeRef.current) {
              const p = self.progress;
              if (p >= 0.65) {
                onSectionChangeRef.current('bigfive');
              } else if (p >= 0.18) {
                onSectionChangeRef.current('discovery');
              } else {
                onSectionChangeRef.current('hero');
              }
            }
          },
        },
      });

      if (!reducedMotion) {
        // =========================================================================
        // 1. PHASE 1: INITIAL RESTING BUFFER (0.00->0.06) & WORDMARK EXCHANGE (0.06 -> 0.22)
        // =========================================================================
        // Initial text KENYA exits horizontally to the right after a calm dead-zone buffer
        tl.to(
          '.hero-wordmark-kenya',
          { xPercent: 90, opacity: 0, ease: 'power2.inOut', duration: 0.16 },
          0.06
        );

        // KARIBU enters horizontally from the left and settles in the exact center
        tl.to(
          '.hero-wordmark-karibu',
          { xPercent: -50, yPercent: -50, opacity: 0.40, ease: 'power2.inOut', duration: 0.16 },
          0.06
        );

        // 3D Model directionally rotates clockwise/rightward along with the typography movement
        tl.to(
          modelRotationRef.current,
          { y: Math.PI * 2, ease: 'power2.inOut', duration: 0.16 },
          0.06
        );

        // Initial captions fade out smoothly
        tl.to(
          '.hero-editorial-1',
          { y: -35, opacity: 0, ease: 'power1.out', duration: 0.12 },
          0.06
        );

        // Discovery editorial captions fade in as Karibu text comes into play
        tl.fromTo(
          '.hero-editorial-discovery',
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, ease: 'power2.out', duration: 0.14 },
          0.10
        );

        // Subtle background skyline depth shift
        tl.to(
          '.hero-skyline-img',
          { yPercent: -6, scale: 1.05, ease: 'none', duration: 0.16 },
          0.06
        );

        // =========================================================================
        // 2. PHASE 2: DISCOVERY CARDS EXPAND & GLIDE (0.18 -> 0.58)
        // Dynamically calculates scroll distance to reveal all 5 cards across screen
        // =========================================================================
        // Reveal horizontal slides container in lower third
        tl.fromTo(
          '.hero-horizontal-slides',
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, ease: 'power2.out', duration: 0.08 },
          0.18
        );

        // Horizontal track translates smoothly across the viewport to show all 5 cards (including Epilogue)
        tl.fromTo(
          '.hero-horizontal-track',
          {
            x: () => (window.innerWidth < 640 ? 16 : window.innerWidth * 0.08),
          },
          {
            x: () => {
              const track = document.querySelector('.hero-horizontal-track');
              if (!track) return -900;
              const overflow = track.scrollWidth - window.innerWidth;
              const padding = window.innerWidth < 640 ? 28 : 56;
              return -(Math.max(0, overflow) + padding);
            },
            ease: 'none',
            duration: 0.34,
          },
          0.20
        );

        // Dwell buffer on discovery cards so user can comfortably read them before transition
        tl.to({}, { duration: 0.04 }, 0.54);

        // =========================================================================
        // 3. PHASE 3 & 4: SEAMLESS CROSS-FADE DIRECTLY INTO BIG FIVE (0.58 -> 0.70)
        // No blank dip: Slide 1 cross-dissolves directly into Slide 2 simultaneously
        // =========================================================================
        tl.to(
          '.hero-wordmark-karibu',
          { yPercent: -90, opacity: 0, ease: 'power2.in', duration: 0.10 },
          0.58
        );

        tl.to(
          '.hero-editorial-discovery',
          { y: -30, opacity: 0, ease: 'power2.in', duration: 0.08 },
          0.58
        );

        tl.to(
          '.hero-3d-scene',
          { y: -80, scale: 0.80, opacity: 0, ease: 'power2.inOut', duration: 0.10 },
          0.58
        );

        tl.to(
          '.hero-horizontal-slides',
          { opacity: 0, y: 30, ease: 'power2.in', duration: 0.08 },
          0.58
        );

        tl.to(
          '.hero-slide-1',
          { opacity: 0, ease: 'power2.inOut', duration: 0.10 },
          0.58
        );

        // Big Five ambient background simultaneously fades in (overlap!)
        tl.fromTo(
          '.bigfive-ambient-bg',
          { opacity: 0, scale: 1.08 },
          { opacity: 1, scale: 1.0, ease: 'power2.out', duration: 0.10 },
          0.58
        );

        // Big Five editorial & controls float in gracefully
        tl.fromTo(
          '.bigfive-editorial-layer',
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, ease: 'power2.out', duration: 0.08 },
          0.62
        );

        tl.fromTo(
          '.bigfive-controls-layer',
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, ease: 'power2.out', duration: 0.08 },
          0.64
        );

        // =========================================================================
        // 5. PHASE 5: BIG FIVE FULL RESTING WINDOW (0.70 -> 1.00)
        // Generous 30% resting stage before pin releases into Matatu
        // =========================================================================
        tl.to(
          {},
          { duration: 0.30 },
          0.70
        );
      }
    }, container);

    return () => context.revert();
  }, [reducedMotion]);

  return (
    <div ref={containerRef} id="hero-experience" className="relative w-full bg-[#05070a] overflow-hidden">
      {/* 100svh Fixed Viewport Pin Container */}
      <section id="hero" className="hero relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-[#05070a]">

        {/* ========================================================================= */}
        {/* SLIDE 1: THE WELCOME SIGNAL / NAIROBI SUNSET, PARLIAMENT 3D & CHOREOGRAPHY */}
        {/* ========================================================================= */}
        <div className={`hero-slide-1 absolute inset-0 w-full h-full ${activeSlide === 1 ? 'pointer-events-auto' : 'pointer-events-none'}`}>
          {/* Nairobi Sunset Skyline Background Layer */}
          <div className="hero-skyline-bg absolute inset-0 z-0 pointer-events-none overflow-hidden select-none" aria-hidden="true">
            <img
              src={`${import.meta.env.BASE_URL}images/nairobi_sunset.jpg`}
              alt="Nairobi Skyline at Sunset"
              className="hero-skyline-img w-full h-full object-cover object-[center_55%] opacity-70 filter saturate-[1.25] contrast-[1.12] brightness-[0.96]"
            />

            {/* Radiant Golden Hour Sunburst Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_62%_46%,rgba(251,191,36,0.28)_0%,rgba(245,158,11,0.16)_30%,rgba(234,88,12,0.06)_55%,transparent_75%)] mix-blend-screen pointer-events-none" />

            {/* Atmospheric Edge Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_55%_48%,transparent_35%,rgba(5,7,10,0.38)_70%,rgba(5,7,10,0.85)_100%)] pointer-events-none" />

            {/* Top Gradient for Glass Navbar Legibility */}
            <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#05070a] via-[#05070a]/60 to-transparent pointer-events-none" />

            {/* Bottom Gradient for Seamless Transition */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#05070a] via-[#05070a]/80 to-transparent pointer-events-none" />
          </div>

          {/* Subtle Warm Kenya Grid Pattern Overlay */}
          <div className="hero-grid z-[1]" aria-hidden="true" />

          {/* 3D WebGL Spatial Canvas (Synchronized rotation driven by scroll timeline) */}
          <div className="hero-3d-scene absolute inset-0 z-[2] pointer-events-auto">
            <ParliamentScene
              active={activeSlide === 1}
              visible={activeSlide === 1}
              reducedMotion={reducedMotion}
              scrollRotationRef={modelRotationRef}
            />
          </div>

          {/* Synchronized Foreground Wordmark Exchange: KENYA exits right -> KARIBU enters from left */}
          <div className="hero-wordmark-container absolute inset-0 z-[5] pointer-events-none flex items-center justify-center overflow-hidden">
            {/* Initial Center Wordmark: KENYA (slides horizontally to right) */}
            <div className="hero-wordmark hero-wordmark-kenya select-none will-change-transform" aria-hidden="true">
              KENYA
            </div>

            {/* New Central Wordmark: KARIBU (slides horizontally in from left) */}
            <div className="hero-wordmark hero-wordmark-karibu select-none will-change-transform opacity-0" aria-hidden="true">
              KARIBU
            </div>
          </div>

          {/* Foreground Editorial DOM Overlay 1 (Initial Welcome Signal) */}
          <div className="hero-editorial-1 relative z-10 flex h-full flex-col justify-between px-5 pb-9 pt-28 sm:px-10 sm:pt-32 pointer-events-none max-w-7xl mx-auto">
            <div className="hero-caption max-w-sm">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 border border-amber-400/40 text-[10px] font-mono-tech uppercase text-[#ffd580] mb-3 backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ffd580] animate-pulse" />
                <span>001 / The Welcome Signal</span>
              </div>
              <p className="max-w-[19rem] text-sm leading-relaxed text-slate-100 font-normal drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                A living emblem of Kenya, caught between heritage, the sunset skyline, and the next horizon.
              </p>
            </div>

            <div className="flex items-end justify-between gap-5">
              <div className="hero-caption max-w-xs">
                <p className="font-mono-tech text-[10px] uppercase tracking-[0.24em] text-amber-200 font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                  Spatial Navigation
                </p>
                <p className="mt-1 text-xs text-slate-200 font-light drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                  Drag through the field — scroll to trigger the Karibu transition.
                </p>
              </div>
            </div>

            <ChevronDown className="absolute bottom-3 left-1/2 h-4 w-4 -translate-x-1/2 text-amber-200/80 drop-shadow-md animate-bounce" aria-hidden="true" />
          </div>

          {/* Foreground Editorial DOM Overlay 2 (Discovery / Karibu In-Play Phase) */}
          <div className="hero-editorial-discovery absolute inset-0 z-10 pointer-events-none max-w-7xl mx-auto px-5 sm:px-10 pt-28 sm:pt-32 opacity-0">
            <div className="hero-caption max-w-sm">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-amber-400/40 text-[10px] font-mono-tech uppercase text-amber-300 mb-3 backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>002 / Discovery • Karibu Experience</span>
              </div>
              <p className="max-w-[20rem] text-sm leading-relaxed text-slate-100 font-normal drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                Karibu — Welcome to the heart of Kenya. Explore the architectural landmarks, heritage crafts, and kinetic pulse below.
              </p>
            </div>
          </div>

          {/* Horizontal Content Slides Underneath 3D Model (Discovery Archive) */}
          <div className="hero-horizontal-slides absolute bottom-6 sm:bottom-10 inset-x-0 z-20 pointer-events-auto overflow-hidden opacity-0 select-none">
            {/* Discovery Section Indicator */}
            <div className="max-w-7xl mx-auto px-6 sm:px-14 mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-black/70 border border-amber-400/40 text-[10px] font-mono-tech uppercase text-amber-300 backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span>02 / Discovery Showcase</span>
                </span>
                <span className="text-[10px] font-mono-tech uppercase text-slate-400 hidden sm:inline-block">
                  • Interactive Spatial Index
                </span>
              </div>
              <span className="text-[10px] font-mono-tech uppercase text-slate-400 hidden md:inline-block">
                Click any chapter card to jump directly
              </span>
            </div>

            <div className="hero-horizontal-track flex items-center gap-4 sm:gap-6 pl-6 sm:pl-[14vw] will-change-transform">
              {DISCOVERY_PAGES_SLIDES.map((slide) => (
                <div
                  key={slide.id}
                  onClick={() => handlePageSlideClick(slide)}
                  className="w-[290px] sm:w-[340px] lg:w-[370px] shrink-0 rounded-2xl sm:rounded-3xl bg-black/80 border border-white/15 backdrop-blur-2xl shadow-2xl hover:border-amber-400/70 hover:bg-black/95 hover:scale-[1.02] transition-all duration-300 group cursor-pointer overflow-hidden flex flex-col justify-between select-none"
                >
                  {/* Thumbnail Image Header */}
                  <div className="relative h-28 sm:h-32 w-full overflow-hidden bg-slate-900">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover object-center filter brightness-90 contrast-105 group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />

                    <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between gap-2">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/80 border border-white/20 text-[9px] sm:text-[10px] font-mono-tech uppercase backdrop-blur-md"
                        style={{ color: slide.accentColor }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: slide.accentColor }} />
                        <span>{slide.chapterNum} • {slide.badge}</span>
                      </span>

                      <span className="text-[9px] font-mono-tech uppercase px-2 py-0.5 rounded bg-black/70 text-slate-300 border border-white/15 backdrop-blur-md group-hover:border-amber-400/50 group-hover:text-amber-300 transition-colors">
                        {slide.actionText}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-heading text-base sm:text-lg font-bold uppercase text-white tracking-wide group-hover:text-amber-300 transition-colors leading-tight">
                        {slide.title}
                      </h3>
                      <p className="mt-0.5 text-[11px] font-mono-tech text-amber-200/80 line-clamp-1">
                        {slide.subtitle}
                      </p>

                      <p className="mt-2 text-xs text-slate-300 font-light leading-relaxed line-clamp-2">
                        {slide.desc}
                      </p>
                    </div>

                    {/* Bottom Stat Footer */}
                    <div className="mt-3.5 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] font-mono-tech text-slate-400">
                      <span className="line-clamp-1">{slide.stat}</span>
                      <span className="shrink-0 flex items-center gap-1 text-white/60 group-hover:text-amber-300 transition-colors font-semibold">
                        <span>GO</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SLIDE 2: THE BIG FIVE SHOWCASE CAROUSEL (WITH 4-PHASE MORPH ANIMATION)    */}
        {/* ========================================================================= */}
        <div
          id="bigfive"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className={`hero-slide-2 absolute inset-0 w-full h-full select-none ${activeSlide === 2 ? 'pointer-events-auto' : 'pointer-events-none'}`}
        >
          {/* 1. Full-Bleed Animal Background Layer (Stacked Pre-Decoded Imagery) */}
          <div
            ref={fullBleedBgRef}
            className="bigfive-ambient-bg absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-0 select-none transition-transform duration-700 ease-out"
          >
            {BIG_FIVE_DATA.map((animal, idx) => (
              <div
                key={animal.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <img
                  src={animal.image}
                  alt={`${animal.name} - ${animal.latin}`}
                  className="w-full h-full object-cover object-[center_35%] sm:object-center filter brightness-[0.92] contrast-[1.08] saturate-[1.12]"
                  loading="eager"
                  decoding="sync"
                />
              </div>
            ))}

            {/* Subtle Left Gradient (Keeps clean photo aesthetics while maintaining text contrast) */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/25 to-transparent pointer-events-none z-20" />
          </div>

          {/* ======================================================================= */}
          {/* 2. DYNAMIC 3-CARD CAROUSEL TRACK (PREVIOUS, CENTER/ACTIVE, NEXT)       */}
          {/* ======================================================================= */}
          <div
            ref={morphStageRef}
            className="absolute inset-0 z-20 hidden items-center justify-center pointer-events-none overflow-hidden"
            aria-hidden="true"
          >
            {/* Left Flanking Card (Previous Slide) */}
            <div
              ref={cardLeftRef}
              className="absolute rounded-2xl overflow-hidden border border-white/20 bg-[#05070a] select-none will-change-transform shadow-2xl"
              style={{
                width: '320px',
                height: '460px',
              }}
            >
              <img
                alt="Previous Wildlife"
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Center Focal Card (Active Slide -> Expands/Shrinks) */}
            <div
              ref={cardCenterRef}
              className="absolute rounded-2xl overflow-hidden border-2 border-amber-400/80 bg-[#05070a] select-none z-30 will-change-transform shadow-2xl"
              style={{
                width: '320px',
                height: '460px',
              }}
            >
              <img
                alt="Center Wildlife"
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Right Flanking Card (Next Slide) */}
            <div
              ref={cardRightRef}
              className="absolute rounded-2xl overflow-hidden border border-white/20 bg-[#05070a] select-none will-change-transform shadow-2xl"
              style={{
                width: '320px',
                height: '460px',
              }}
            >
              <img
                alt="Next Wildlife"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>

          {/* ======================================================================= */}
          {/* 3. PER-SLIDE EDITORIAL CONTENT (MASKED KINETIC LINE REVEAL)            */}
          {/* ======================================================================= */}
          <div className="bigfive-editorial-layer relative z-20 h-full max-w-7xl mx-auto px-6 sm:px-12 flex flex-col justify-center pointer-events-none opacity-0">
            <div
              ref={textGroupRef}
              className="max-w-2xl space-y-3 sm:space-y-4 pt-16 sm:pt-0"
            >
              {/* 1. Masked Badges Line */}
              <div className="overflow-hidden py-1">
                <div className="kinetic-item flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/60 border border-amber-400/40 text-[10px] sm:text-xs font-mono-tech uppercase text-amber-300 backdrop-blur-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span>03 / Big Five of Kenya • 0{currentIndex + 1} of 0{totalSlides}</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-[10px] font-mono-tech text-slate-300 backdrop-blur-md">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    <span>{currentAnimal.habitat}</span>
                  </div>
                </div>
              </div>

              {/* 2. Masked Main Heading */}
              <div className="overflow-hidden py-1">
                <h2 className="kinetic-item font-serif-display text-5xl sm:text-7xl lg:text-[6.5rem] font-light text-white tracking-tight leading-[0.92] block">
                  {currentAnimal.name}
                </h2>
              </div>

              {/* 3. Masked Latin Binomial */}
              <div className="overflow-hidden py-0.5">
                <div className="kinetic-item font-serif-display text-2xl sm:text-3xl lg:text-4xl italic text-slate-300/90 font-light block">
                  {currentAnimal.latin}
                </div>
              </div>

              {/* 4. Masked Narrative Description Paragraph */}
              <div className="overflow-hidden py-1">
                <p className="kinetic-item max-w-[480px] text-xs sm:text-sm lg:text-[15px] text-white/80 font-light leading-relaxed block">
                  {currentAnimal.description}
                </p>
              </div>

              {/* 5. Masked Quick Stat / Lore Chip */}
              <div className="overflow-hidden py-1">
                <div className="kinetic-item flex flex-wrap items-center gap-4">
                  <div className="inline-flex items-center gap-2 text-xs font-mono-tech text-slate-300">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{currentAnimal.stat}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================================= */}
          {/* 4. PERSISTENT BOTTOM CONTROL & DRAGGABLE TIMELINE SCRUBBER             */}
          {/* ======================================================================= */}
          <div className="bigfive-controls-layer absolute bottom-6 sm:bottom-10 inset-x-0 z-30 px-6 sm:px-12 pointer-events-auto opacity-0">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 sm:gap-8">
              {/* Left: Pill Button */}
              <button
                onClick={goToNext}
                disabled={isTransitioning}
                className="group shrink-0 inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full border border-white/40 bg-black/40 hover:bg-white/15 hover:border-white transition-all backdrop-blur-md cursor-pointer active:scale-95"
                title="Advance to Next Safari Stage"
              >
                <span className="font-ui-sans uppercase text-xs sm:text-sm font-semibold tracking-wider text-white group-hover:text-amber-300 transition-colors">
                  Explore Wildlife Safari
                </span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 transition-transform group-hover:translate-x-1" />
              </button>

              {/* Center: Draggable Timeline Scrubber & Dots */}
              <div
                ref={scrubTrackRef}
                onMouseDown={handleScrubStart}
                onMouseMove={isScrubbing ? handleScrubMove : undefined}
                onMouseUp={handleScrubEnd}
                onTouchStart={handleScrubStart}
                onTouchMove={isScrubbing ? handleScrubMove : undefined}
                onTouchEnd={handleScrubEnd}
                className="relative flex-1 flex items-center justify-between min-w-[140px] sm:min-w-[300px] max-w-md mx-2 sm:mx-6 py-3 cursor-ew-resize group/scrubber"
              >
                {/* Background 1px Track Line */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1.5px] bg-white/20 group-hover/scrubber:bg-white/40 transition-colors pointer-events-none" />

                {/* Active Segment Fill */}
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300 pointer-events-none"
                  style={{ width: `${(currentIndex / (totalSlides - 1)) * 100}%` }}
                />

                {/* Five Animal Navigation Dots */}
                {BIG_FIVE_DATA.map((animal, idx) => {
                  const isActive = idx === currentIndex;
                  const isHovered = hoveredDot === idx || scrubPreviewIndex === idx;

                  return (
                    <div key={animal.id} className="relative group/dot flex items-center justify-center">
                      {/* Tooltip */}
                      <div className={`absolute -top-9 left-1/2 -translate-x-1/2 pointer-events-none transition-all duration-200 bg-black/90 border border-amber-400/40 px-2.5 py-1 rounded text-[10px] font-mono-tech whitespace-nowrap text-amber-300 backdrop-blur-md shadow-xl z-40 ${isHovered ? 'opacity-100 -translate-y-1' : 'opacity-0 translate-y-1'
                        }`}>
                        0{idx + 1} • {animal.name}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          goToSlide(idx);
                        }}
                        disabled={isTransitioning}
                        onMouseEnter={() => setHoveredDot(idx)}
                        onMouseLeave={() => setHoveredDot(null)}
                        className={`relative z-10 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full transition-all duration-300 cursor-pointer ${isActive
                          ? 'bg-white scale-125 shadow-[0_0_15px_rgba(255,255,255,1)] border-2 border-amber-400'
                          : 'bg-[#05070a] border border-white/40 hover:border-amber-300 hover:scale-115'
                          }`}
                        aria-label={`Jump to ${animal.name}`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Right: Circular Hold to Explore Button (~96px) */}
              <div className="relative shrink-0 flex items-center justify-center">
                <button
                  onPointerDown={startHold}
                  onPointerUp={cancelHold}
                  onPointerLeave={cancelHold}
                  onPointerCancel={cancelHold}
                  onClick={() => {
                    if (!isHolding && holdProgress < 0.25) {
                      goToNext();
                    }
                  }}
                  disabled={isTransitioning}
                  className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-white/30 hover:border-white/60 bg-black/50 backdrop-blur-md flex flex-col items-center justify-center text-center transition-all cursor-pointer active:scale-95 ${isHolding ? 'scale-105 shadow-[0_0_25px_rgba(245,158,11,0.5)] border-amber-400/80' : ''
                    }`}
                  title="Press and Hold to Advance or Click to Jump"
                  aria-label="Hold to Explore Next Slide"
                >
                  <svg
                    className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-1"
                    viewBox="0 0 96 96"
                  >
                    <circle
                      cx="48"
                      cy="48"
                      r={radius}
                      className="stroke-white/10 fill-none"
                      strokeWidth="2.5"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r={radius}
                      className="stroke-amber-400 fill-none transition-all duration-75"
                      strokeWidth="3.5"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </svg>

                  <div className="relative z-10 flex flex-col items-center justify-center px-2 pointer-events-none">
                    <span className="font-ui-sans uppercase text-[9px] sm:text-[10px] font-bold tracking-widest text-white leading-tight">
                      Hold to
                    </span>
                    <span className="font-ui-sans uppercase text-[8px] sm:text-[9px] font-medium tracking-wider text-amber-300 leading-tight mt-0.5">
                      Explore
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Global Liquid Refraction Cursor Overlay */}
        <LiquidCursor enabled={!reducedMotion} />
      </section>
    </div>
  );
}
