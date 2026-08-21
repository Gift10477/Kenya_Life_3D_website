import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { getPinnedChapterScrollY } from '../../constants/scrollTargets';

export default function Navbar({ activeSection = 'hero' }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'hero', label: '01 / Signal' },
    { id: 'discovery', label: '02 / Discovery' },
    { id: 'bigfive', label: '03 / Big Five' },
    { id: 'matatu', label: '04 / Matatu Art' },
    { id: 'smocha', label: '05 / Smocha' },
    { id: 'epilogue', label: '06 / Epilogue' },
  ];

  const handleNavigate = (id) => {
    setMobileMenuOpen(false);
    if (id === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (id === 'discovery' || id === 'bigfive') {
      window.scrollTo({ top: getPinnedChapterScrollY(id), behavior: 'smooth' });
      return;
    }
    const target = document.getElementById(id);
    if (target) {
      const top = target.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-[100] px-4 sm:px-8 transition-all duration-500 pointer-events-auto ${scrolled ? 'py-3' : 'py-5'}`}>
      <nav className="max-w-7xl mx-auto flex items-center justify-between glass-nav rounded-full px-5 py-2.5 border border-white/10 shadow-2xl">
        {/* Sleek Vector Emblem Branding */}
        <button onClick={() => handleNavigate('hero')} className="flex items-center gap-3 group text-left cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-slate-900 border border-white/20 flex items-center justify-center p-1.5 transition-transform group-hover:scale-105 group-hover:border-[#de2010]">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Maasai Shield Silhouette & Sun Core (NO TRIANGLES) */}
              <path
                d="M 50 8 C 74 24, 80 54, 50 92 C 20 54, 26 24, 50 8 Z"
                fill="none"
                stroke="white"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              <line x1="50" y1="4" x2="50" y2="96" stroke="#d9b36c" strokeWidth="3" strokeLinecap="round" />
              <path d="M 31 38 Q 50 48 69 38" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 31 62 Q 50 52 69 62" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="50" cy="50" r="10" fill="#de2010" />
              <circle cx="50" cy="50" r="5" fill="#006a4e" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-black text-sm tracking-wider text-white group-hover:text-amber-300 transition-colors">
              KARIBU KENYA
            </span>
            <span className="text-[9px] font-mono-tech text-slate-400 uppercase tracking-widest">
              Spatial 3D Archive
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links with Framer Motion Sliding Active Pill */}
        <div className="hidden md:flex items-center gap-1 bg-white/[0.03] p-1 rounded-full border border-white/5 relative">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`relative px-4 py-1.5 rounded-full text-xs font-mono-tech uppercase transition-colors duration-200 z-10 ${isActive ? 'text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="navbar-active-pill"
                    className="absolute inset-0 bg-white/20 border border-amber-400/50 rounded-full shadow-[0_0_14px_rgba(245,158,11,0.3)] z-[-1]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full border border-white/10 bg-white/5 text-slate-300"
            aria-label="Toggle Mobile Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 max-w-7xl mx-auto glass-nav rounded-2xl p-4 border border-white/10 flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-mono-tech uppercase transition-all ${activeSection === item.id
                  ? 'bg-white/20 text-amber-300 font-bold border border-amber-400/30'
                  : 'text-slate-400 hover:bg-white/5'
                }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
