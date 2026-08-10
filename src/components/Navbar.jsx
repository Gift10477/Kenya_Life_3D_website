import React, { useState } from 'react';
import { Compass, Volume2, VolumeX, Sparkles, Menu, X } from 'lucide-react';

export default function Navbar({ onNavigate, activeSection = 'hero' }) {
  const [isMuted, setIsMuted] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'hero', label: 'Home' },
    { id: 'matatu', label: 'Nganya' },
    { id: 'market', label: 'Market Stage' },
    { id: 'city', label: 'City Stage' },
    { id: 'food', label: 'Food Stage' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-5 transition-all duration-300 pointer-events-auto">
      <nav className="max-w-7xl mx-auto flex items-center justify-between glass-panel rounded-full px-6 py-3 border border-white/10 backdrop-blur-xl">
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('hero')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#de2010] via-white to-[#006a4e] p-[2px] shadow-lg shadow-[#de2010]/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#05070a] rounded-full flex items-center justify-center font-bold text-sm">
              🇰🇪
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-black text-lg tracking-wider text-white group-hover:text-amber-400 transition-colors">
              KARIBU KENYA
            </span>
            <span className="text-[10px] font-mono-tech text-slate-400 tracking-widest uppercase">
              Immersive 3D Experience
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-300 ${
                activeSection === item.id
                  ? 'bg-gradient-to-r from-[#de2010] to-[#006a4e] text-white shadow-md shadow-red-900/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Mute/Sound Toggle Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-full glass-card text-slate-300 hover:text-amber-400 hover:border-amber-400/40 transition-colors relative"
            title={isMuted ? "Unmute Ambient Sound" : "Mute Sound"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />}
          </button>

          {/* Quick Cultural Explore Button */}
          <button
            onClick={() => onNavigate('cultural-grid')}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#006a4e] to-emerald-600 text-white text-xs font-semibold hover:shadow-lg hover:shadow-emerald-900/40 hover:scale-105 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explore Stages</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full glass-card text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 max-w-7xl mx-auto glass-panel rounded-2xl p-4 border border-white/10 flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeSection === item.id
                  ? 'bg-gradient-to-r from-[#de2010] to-[#006a4e] text-white'
                  : 'text-slate-300 hover:bg-white/10'
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
