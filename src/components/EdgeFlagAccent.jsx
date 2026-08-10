import React, { useEffect, useState } from 'react';

export default function EdgeFlagAccent() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    let tick = false;
    const handleScroll = () => {
      if (!tick) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          tick = false;
        });
        tick = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const parallaxTop = scrollY * 0.04;
  const parallaxBottom = -scrollY * 0.04;

  return (
    <div className="fixed inset-0 z-20 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* 1. TOP-LEFT SMOKY COLOR MESH */}
      <div
        className="absolute -top-16 -left-16 w-96 h-96 pointer-events-none transition-transform duration-500"
        style={{ transform: `translate3d(0, ${parallaxTop}px, 0)` }}
      >
        {/* Layer 1: Crimson Red Smoky Cloud */}
        <div
          className="absolute top-0 left-0 w-80 h-80 rounded-full blur-[80px] opacity-55 animate-pulse"
          style={{
            background: 'radial-gradient(circle at 20% 20%, rgba(206,17,38,0.7) 0%, rgba(184,20,8,0.3) 50%, transparent 80%)',
            animationDuration: '9s',
          }}
        />
        {/* Layer 2: Emerald Green & White Smoky Vapor */}
        <div
          className="absolute top-10 left-10 w-72 h-72 rounded-full blur-[90px] opacity-45"
          style={{
            background: 'radial-gradient(circle at 40% 40%, rgba(0,100,0,0.6) 0%, rgba(255,255,255,0.25) 40%, transparent 75%)',
          }}
        />
        {/* Layer 3: Obsidian Black Core Shadow */}
        <div
          className="absolute -top-10 -left-10 w-64 h-64 rounded-full blur-[60px] opacity-70"
          style={{
            background: 'radial-gradient(circle at 10% 10%, rgba(0,0,0,0.95) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* 2. TOP-RIGHT SMOKY COLOR MESH */}
      <div
        className="absolute -top-16 -right-16 w-96 h-96 pointer-events-none transition-transform duration-500"
        style={{ transform: `translate3d(0, ${parallaxTop}px, 0)` }}
      >
        {/* Layer 1: Emerald Green Smoky Cloud */}
        <div
          className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[80px] opacity-55 animate-pulse"
          style={{
            background: 'radial-gradient(circle at 80% 20%, rgba(0,100,0,0.75) 0%, rgba(0,135,81,0.35) 50%, transparent 80%)',
            animationDuration: '11s',
          }}
        />
        {/* Layer 2: Crimson Red & White Vapor */}
        <div
          className="absolute top-12 right-12 w-72 h-72 rounded-full blur-[90px] opacity-45"
          style={{
            background: 'radial-gradient(circle at 60% 30%, rgba(206,17,38,0.6) 0%, rgba(255,255,255,0.3) 40%, transparent 75%)',
          }}
        />
        {/* Layer 3: Deep Black Ambient Fog */}
        <div
          className="absolute -top-10 -right-10 w-64 h-64 rounded-full blur-[60px] opacity-70"
          style={{
            background: 'radial-gradient(circle at 90% 10%, rgba(0,0,0,0.95) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* 3. BOTTOM-LEFT SMOKY COLOR MESH */}
      <div
        className="absolute -bottom-16 -left-16 w-96 h-96 pointer-events-none transition-transform duration-500"
        style={{ transform: `translate3d(0, ${parallaxBottom}px, 0)` }}
      >
        {/* Layer 1: Emerald Green & Red Smoky Blend */}
        <div
          className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-[85px] opacity-50 animate-pulse"
          style={{
            background: 'radial-gradient(circle at 20% 80%, rgba(0,100,0,0.7) 0%, rgba(206,17,38,0.35) 55%, transparent 80%)',
            animationDuration: '10s',
          }}
        />
        {/* Layer 2: White & Crimson Mist */}
        <div
          className="absolute bottom-10 left-10 w-72 h-72 rounded-full blur-[90px] opacity-40"
          style={{
            background: 'radial-gradient(circle at 30% 70%, rgba(255,255,255,0.35) 0%, rgba(206,17,38,0.5) 40%, transparent 75%)',
          }}
        />
        {/* Layer 3: Obsidian Shadow */}
        <div
          className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full blur-[60px] opacity-70"
          style={{
            background: 'radial-gradient(circle at 10% 90%, rgba(0,0,0,0.95) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* 4. BOTTOM-RIGHT SMOKY COLOR MESH */}
      <div
        className="absolute -bottom-16 -right-16 w-96 h-96 pointer-events-none transition-transform duration-500"
        style={{ transform: `translate3d(0, ${parallaxBottom}px, 0)` }}
      >
        {/* Layer 1: Crimson Red & Emerald Green Smoky Blend */}
        <div
          className="absolute bottom-0 right-0 w-80 h-80 rounded-full blur-[85px] opacity-55 animate-pulse"
          style={{
            background: 'radial-gradient(circle at 80% 80%, rgba(206,17,38,0.75) 0%, rgba(0,100,0,0.35) 55%, transparent 80%)',
            animationDuration: '12s',
          }}
        />
        {/* Layer 2: White & Green Vapor */}
        <div
          className="absolute bottom-12 right-12 w-72 h-72 rounded-full blur-[90px] opacity-45"
          style={{
            background: 'radial-gradient(circle at 70% 70%, rgba(255,255,255,0.3) 0%, rgba(0,100,0,0.55) 45%, transparent 75%)',
          }}
        />
        {/* Layer 3: Deep Black Shadow */}
        <div
          className="absolute -bottom-10 -right-10 w-64 h-64 rounded-full blur-[60px] opacity-70"
          style={{
            background: 'radial-gradient(circle at 90% 90%, rgba(0,0,0,0.95) 0%, transparent 70%)',
          }}
        />
      </div>
    </div>
  );
}
