import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from './components/ui/Navbar';
import ChapterNavigation from './components/ui/ChapterNavigation';
import KaribuPreloader from './components/ui/Preloader';
import ChapterTransition from './components/ui/ChapterTransition';
import HeroChapter from './components/sections/HeroChapter';
import MatatuShowcaseChapter from './components/sections/MatatuShowcaseChapter';
import SmochaExplodedChapter from './components/sections/SmochaExplodedChapter';
import EpilogueChapter from './components/sections/EpilogueChapter';
import { getPinnedChapterScrollY } from './constants/scrollTargets';

export default function App() {
  const [activeSection, setActiveSection] = useState('hero');
  const [preloaderDone, setPreloaderDone] = useState(false);

  const cachedOffsetsRef = useRef({
    heroSpacerTop: 0,
    heroSpacerScroll: 0,
    matatuTop: 0,
    smochaTop: 0,
    epilogueTop: 0,
  });

  const animFrameIdRef = useRef(null);
  const targetScrollYRef = useRef(0);
  const isUpdatingRef = useRef(false);

  const handlePreloaderComplete = useCallback(() => {
    setPreloaderDone(true);
  }, []);

  // Cache layout measurements on mount & resize only to prevent layout trashing during scroll
  const updateCachedOffsets = useCallback(() => {
    const heroExp = document.getElementById('hero-experience');
    const pinSpacer = heroExp?.parentElement?.classList.contains('pin-spacer') ? heroExp.parentElement : heroExp;

    const vh = window.innerHeight;
    const spacerTop = pinSpacer ? pinSpacer.offsetTop : 0;
    const spacerHeight = pinSpacer ? pinSpacer.offsetHeight : 0;
    const heroSpacerScroll = Math.max(0, spacerHeight - vh);

    const matatuEl = document.getElementById('matatu');
    const smochaEl = document.getElementById('smocha');
    const epilogueEl = document.getElementById('epilogue');

    cachedOffsetsRef.current = {
      heroSpacerTop: spacerTop,
      heroSpacerScroll,
      matatuTop: matatuEl ? matatuEl.offsetTop : 0,
      smochaTop: smochaEl ? smochaEl.offsetTop : 0,
      epilogueTop: epilogueEl ? epilogueEl.offsetTop : 0,
    };
  }, []);

  useEffect(() => {
    updateCachedOffsets();
    const handleResize = () => {
      updateCachedOffsets();
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    const timer = setTimeout(updateCachedOffsets, 800);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      clearTimeout(timer);
    };
  }, [updateCachedOffsets, preloaderDone]);

  // High-performance decoupled scroll tracking (zero layout thrashing in loop)
  useEffect(() => {
    const evaluateActiveSection = () => {
      const scrollY = targetScrollYRef.current;
      const vh = window.innerHeight;
      const offsets = cachedOffsetsRef.current;

      if (offsets.epilogueTop && scrollY + vh * 0.35 >= offsets.epilogueTop) {
        setActiveSection('epilogue');
        isUpdatingRef.current = false;
        return;
      }
      if (offsets.smochaTop && scrollY + vh * 0.35 >= offsets.smochaTop) {
        setActiveSection('smocha');
        isUpdatingRef.current = false;
        return;
      }
      if (offsets.matatuTop && scrollY + vh * 0.35 >= offsets.matatuTop) {
        setActiveSection('matatu');
        isUpdatingRef.current = false;
        return;
      }

      if (offsets.heroSpacerScroll > 0) {
        const progress = (scrollY - offsets.heroSpacerTop) / offsets.heroSpacerScroll;
        if (progress >= 0.65) {
          setActiveSection('bigfive');
          isUpdatingRef.current = false;
          return;
        } else if (progress >= 0.18) {
          setActiveSection('discovery');
          isUpdatingRef.current = false;
          return;
        } else {
          setActiveSection('hero');
          isUpdatingRef.current = false;
          return;
        }
      }

      setActiveSection('hero');
      isUpdatingRef.current = false;
    };

    const handleScroll = () => {
      targetScrollYRef.current = window.scrollY;
      if (!isUpdatingRef.current) {
        isUpdatingRef.current = true;
        animFrameIdRef.current = requestAnimationFrame(evaluateActiveSection);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, []);

  const handleExploreClick = () => {
    window.scrollTo({ top: getPinnedChapterScrollY('discovery'), behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#030508] text-slate-100 flex flex-col font-sans selection:bg-[#de2010] selection:text-white">
      {/* Cinematic Preloader — unmounts completely when done */}
      {!preloaderDone && (
        <KaribuPreloader onComplete={handlePreloaderComplete} />
      )}

      {/* Top Glassmorphic Navigation */}
      <Navbar activeSection={activeSection} />

      {/* Fixed Right Chapter Indicator */}
      <ChapterNavigation activeSection={activeSection} />

      {/* Continuous Chapters */}
      <main className="flex-1">
        {/* Chapter 01–03: Hero + Discovery + Big Five (GSAP pinned scroll) */}
        <HeroChapter onExploreClick={handleExploreClick} onSectionChange={setActiveSection} />

        {/* Chapter transition wipe: Big Five → Nganya */}
        <ChapterTransition
          fromNum="03"
          toNum="04"
          fromLabel="Big Five"
          toLabel="Nganya"
          accentColor="#a855f7"
        />

        {/* Chapter 04: Matatu / Nganya */}
        <MatatuShowcaseChapter />

        {/* Chapter transition wipe: Nganya → Smocha */}
        <ChapterTransition
          fromNum="04"
          toNum="05"
          fromLabel="Nganya"
          toLabel="Smocha"
          accentColor="#eab308"
        />

        {/* Chapter 05: Smocha Deconstruction */}
        <SmochaExplodedChapter />

        {/* Chapter transition wipe: Smocha → Epilogue */}
        <ChapterTransition
          fromNum="05"
          toNum="06"
          fromLabel="Smocha"
          toLabel="Epilogue"
          accentColor="#10b981"
        />

        {/* Chapter 06: Harambee Epilogue */}
        <EpilogueChapter />
      </main>
    </div>
  );
}
