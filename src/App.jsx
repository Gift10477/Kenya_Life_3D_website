import React, { useState, useEffect, useCallback } from 'react';
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

  const handlePreloaderComplete = useCallback(() => {
    setPreloaderDone(true);
  }, []);

  // Unified scroll position tracking for all sections
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroExp = document.getElementById('hero-experience');
      const pinSpacer = heroExp?.parentElement?.classList.contains('pin-spacer') ? heroExp.parentElement : heroExp;

      const otherSections = ['epilogue', 'smocha', 'matatu'];
      for (const id of otherSections) {
        const el = document.getElementById(id);
        if (el && scrollY + window.innerHeight * 0.35 >= el.offsetTop) {
          setActiveSection(id);
          return;
        }
      }

      if (pinSpacer) {
        const spacerTop = pinSpacer.offsetTop;
        const totalSpacerScroll = pinSpacer.offsetHeight - window.innerHeight;
        if (totalSpacerScroll > 0) {
          const progress = (scrollY - spacerTop) / totalSpacerScroll;
          if (progress >= 0.65) {
            setActiveSection('bigfive');
            return;
          } else if (progress >= 0.18) {
            setActiveSection('discovery');
            return;
          } else {
            setActiveSection('hero');
            return;
          }
        }
      }

      setActiveSection('hero');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
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
