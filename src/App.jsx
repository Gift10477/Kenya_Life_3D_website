import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import CulturalGrid from './components/CulturalGrid';
import EdgeFlagAccent from './components/EdgeFlagAccent';
import { useContentScale } from './hooks/useContentScale';
import { Heart, Globe, Sparkles } from 'lucide-react';

export default function App() {
  const [activeSection, setActiveSection] = useState('hero');
  useContentScale();

  const handleNavigate = (sectionId) => {
    setActiveSection(sectionId);
    if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const target = document.getElementById(sectionId) || document.getElementById('cultural-grid');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-100 flex flex-col font-sans selection:bg-[#de2010] selection:text-white">
      {/* Ambient Edge Flag Accents */}
      <EdgeFlagAccent />

      {/* Top Glassmorphic Navigation */}
      <Navbar onNavigate={handleNavigate} activeSection={activeSection} />

      {/* Hero Section with 3D Canvas, Parliament Model, 3D Typography & Liquid Ripple */}
      <main className="flex-1">
        <HeroSection onExploreClick={() => handleNavigate('cultural-grid')} />
        <CulturalGrid />
      </main>

      {/* Footer Section */}
      <footer className="border-t border-white/10 bg-[#080c14] py-12 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🇰🇪</span>
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-white text-base tracking-wider">
                KARIBU KENYA
              </span>
              <span className="text-xs font-mono-tech text-slate-400">
                Interactive WebGL Cultural Showcase
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono-tech text-slate-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>using React Three Fiber & Custom GLSL Shaders</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono-tech text-slate-400">
            <span className="hover:text-amber-400 cursor-pointer transition-colors">Nairobi, Kenya</span>
            <span>•</span>
            <span className="hover:text-emerald-400 cursor-pointer transition-colors">Harambee Spirit</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
