import React from 'react';
import { getPinnedChapterScrollY } from '../../constants/scrollTargets';

const CHAPTERS = [
  { id: 'hero', num: '01', title: 'Signal' },
  { id: 'discovery', num: '02', title: 'Discovery' },
  { id: 'bigfive', num: '03', title: 'Big Five' },
  { id: 'matatu', num: '04', title: 'Matatu Art' },
  { id: 'smocha', num: '05', title: 'Smocha' },
  { id: 'epilogue', num: '06', title: 'Epilogue' }
];

export default function ChapterNavigation({ activeSection = 'hero' }) {
  const scrollTo = (id) => {
    if (id === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (id === 'discovery' || id === 'bigfive') {
      window.scrollTo({ top: getPinnedChapterScrollY(id), behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <aside className="fixed right-6 top-1/2 -translate-y-1/2 z-[100] hidden md:flex flex-col gap-3 pointer-events-auto" aria-label="Chapter navigation">
      {CHAPTERS.map((ch) => {
        const isActive = activeSection === ch.id;
        return (
          <button
            key={ch.id}
            onClick={() => scrollTo(ch.id)}
            className="group flex items-center justify-end gap-3 text-right cursor-pointer py-1"
          >
            <span
              className={`text-[10px] font-mono-tech uppercase tracking-widest transition-all duration-300 ${isActive ? 'opacity-100 text-amber-300 font-bold translate-x-0' : 'opacity-0 translate-x-2 group-hover:opacity-60 group-hover:translate-x-0 text-slate-400'
                }`}
            >
              {ch.title}
            </span>
            <div
              className={`w-2.5 h-2.5 rounded-full border transition-all duration-300 ${isActive
                ? 'bg-amber-400 border-amber-300 scale-125 shadow-[0_0_10px_rgba(245,158,11,0.9)]'
                : 'bg-transparent border-white/20 group-hover:border-white/60'
                }`}
            />
          </button>
        );
      })}
    </aside>
  );
}
