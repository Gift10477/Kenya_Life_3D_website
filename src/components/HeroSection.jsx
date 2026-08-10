import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Sparkles } from '@react-three/drei';
import { ChevronDown, Compass } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ParliamentModel from './ParliamentModel';
import LiquidCursor from './LiquidCursor';

gsap.registerPlugin(ScrollTrigger);

export const HERO_WORDMARK = 'KENYA';

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update(); query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

export default function HeroSection({ onExploreClick }) {
  const hero = useRef();
  const [inView, setInView] = useState(true);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.1 });
    observer.observe(hero.current);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      gsap.timeline({ scrollTrigger: { trigger: hero.current, start: 'top top', end: 'bottom top', scrub: 0.6 } })
        .to('.hero-wordmark', { yPercent: 12, opacity: 0.28, ease: 'none' }, 0)
        .to('.hero-caption', { y: -36, opacity: 0, ease: 'none' }, 0);
    }, hero);
    return () => context.revert();
  }, []);

  return (
    <section ref={hero} id="hero" className="hero relative h-[100svh] min-h-[640px] overflow-hidden bg-[#05070a]">
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-wordmark" data-ripple-text aria-hidden="true">{HERO_WORDMARK}</div>
      <div className="absolute inset-0 z-[2]">
        <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}>
          <PerspectiveCamera makeDefault position={[0, 0, 7.2]} fov={42} />
          <ambientLight intensity={1.25} />
          <directionalLight position={[4, 6, 5]} intensity={2.6} color="#f6eee4" />
          <pointLight position={[-4, 1, 3]} intensity={18} distance={8} color="#de2010" />
          <pointLight position={[3, -1, 2]} intensity={12} distance={7} color="#006a4e" />
          <ParliamentModel active={inView} reducedMotion={reducedMotion} scale={20.0} />
          {!reducedMotion && <Sparkles count={40} scale={10} size={1.5} speed={0.22} opacity={0.32} color="#d9b36c" />}
        </Canvas>
      </div>
      <LiquidCursor enabled={inView && !reducedMotion} />
      <div className="relative z-10 flex h-full flex-col justify-between px-5 pb-9 pt-28 sm:px-10 sm:pt-32 pointer-events-none">
        <div className="hero-caption max-w-sm" data-content-scale>
          <p className="mb-3 font-mono-tech text-[10px] uppercase tracking-[0.3em] text-[#d9b36c]">001 / The welcome signal</p>
          <p className="max-w-[18rem] text-sm leading-relaxed text-slate-400">A living emblem of Kenya, caught between heritage and the next horizon.</p>
        </div>
        <div className="flex items-end justify-between gap-5">
          <div className="hero-caption max-w-xs" data-content-scale><p className="font-mono-tech text-[10px] uppercase tracking-[0.24em] text-slate-500">Drag through the field</p><p className="mt-2 text-xs text-slate-400">The trace settles slowly, like ink in water.</p></div>
          <button onClick={onExploreClick} className="group pointer-events-auto flex shrink-0 items-center gap-3 border border-white/20 bg-white/[0.06] px-5 py-3 font-mono-tech text-[10px] uppercase tracking-[0.16em] text-white backdrop-blur-md transition hover:border-[#de2010] hover:bg-[#de2010]/15">
            Explore <Compass className="h-4 w-4 text-[#d9b36c] transition-transform group-hover:rotate-45" />
          </button>
        </div>
        <ChevronDown className="absolute bottom-3 left-1/2 h-4 w-4 -translate-x-1/2 text-slate-500" aria-hidden="true" />
      </div>
    </section>
  );
}
