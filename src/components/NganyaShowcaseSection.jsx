import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bus,
  Sparkles,
  Volume2,
  Trophy,
  Zap,
  Radio,
  Flame,
  Music,
  Maximize2,
  Sliders,
  ShieldCheck,
  Play,
  Pause,
  Award,
  Compass,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Box
} from 'lucide-react';
import { MatatuViewerCanvas } from './OptimusModel';

const MATATU_3D_MODELS = [
  {
    id: 'optimus',
    slotNumber: 1,
    name: 'Optimus Prime',
    route: 'Route 111 • Ngong Road',
    slogan: 'Roll Out The Bass',
    badge: '3D Model #1 • Active',
    modelUrl: '/models/optimus1-transformed.glb',
    image: '/images/optimus_showcase.png',
    wattage: '8,000W',
    artist: 'Matwana Cultural Lab',
    soundRig: '12x 15" Subwoofers + Quad Monoblock Amps',
    neonColor: '#3b82f6',
    features: ['3D WebGL Model', 'Air Suspension Stance', 'Transformers Murals', 'RGB Matrix Ceiling'],
    awards: 'King of Ngong Road 2025',
    description: 'The iconic Transformer-themed Nganya that redefined Nairobi matatu street culture. Features full air-bag suspension, massive sub-bass rig, and hand-painted metallic murals.'
  },
  {
    id: 'moneyfest',
    slotNumber: 2,
    name: 'Moneyfest',
    route: 'Route 125 • Rongai Expressway',
    slogan: 'The Yellow Gold Rush',
    badge: '3D Model #2 • Active',
    modelUrl: '/models/moneyfest-transformed.glb',
    image: '/images/rongai_showcase.png',
    wattage: '10,000W',
    artist: 'Lithium Customs & Street Masters',
    soundRig: '12x 15" Golden Sub-Bass Array',
    neonColor: '#eab308',
    features: ['3D WebGL Model', 'Golden Solar Paint', 'Yellow VIP Lounge', 'Quad Chrome Exhausts'],
    awards: 'Best Vibrant Design 2025',
    description: 'The legendary yellow Nganya machine that rules the Rongai route. Outfitted with vibrant solar yellow paint, 10,000W golden subwoofers, and dynamic yellow ambient glow.'
  },
  {
    id: 'mood',
    slotNumber: 3,
    name: 'Mood',
    route: 'Route 58 • Buruburu',
    slogan: 'Electric Vibe & Cyber Pulse',
    badge: '3D Model #3 • Active',
    modelUrl: '/models/mood-transformed.glb',
    fallbackUrl: '/models/Mood.glb',
    image: '/images/buruburu_showcase.png',
    wattage: '12,000W',
    artist: 'Buruburu Art Syndicate',
    soundRig: '16x 15" Cyber-Sub Array + RGB Neon LED',
    neonColor: '#a855f7',
    features: ['3D WebGL Model', 'Cyberpunk Neon Paint', 'RGB LED Ceiling', 'High-Octane Bass'],
    awards: 'King of Buruburu 2025',
    description: 'The legendary Mood Nganya that rules Route 58. Outfitted with high-decibel subwoofers, electric purple neon vibes, and dynamic ambient glow.'
  }
];

export default function NganyaShowcaseSection({ toggleAudioSynth, isPlayingAudio }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeModel = MATATU_3D_MODELS[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? MATATU_3D_MODELS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === MATATU_3D_MODELS.length - 1 ? 0 : prev + 1));
  };

  // Keyboard Arrow Keys listener for switching 3D models
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-10 text-slate-100 font-sans">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-mono-tech uppercase tracking-widest backdrop-blur-md">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Interactive 3D Stage • Switch Models with Arrow Keys</span>
        </div>

        <h2 className="font-heading text-3xl sm:text-5xl font-black text-white uppercase tracking-tight leading-tight">
          KENYA <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">NGANYA 3D GALLERY</span>
        </h2>

        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
          Use the <strong className="text-purple-300">Left / Right Arrow Keys</strong> or on-screen controls to switch between 3D Matatu models in real-time.
        </p>

        {/* 3D Model Switcher Indicators (Dots / Pills) */}
        <div className="flex items-center justify-center gap-3 pt-2">
          {MATATU_3D_MODELS.map((model, idx) => {
            const isSelected = idx === currentIndex;
            return (
              <button
                key={model.id}
                onClick={() => setCurrentIndex(idx)}
                className={`px-4 py-2 rounded-full text-xs font-mono-tech uppercase tracking-wider transition-all duration-300 border flex items-center gap-2 ${
                  isSelected
                    ? 'bg-purple-600 border-purple-400 text-white font-bold shadow-lg shadow-purple-900/50 scale-105 ring-2 ring-purple-500/40'
                    : 'bg-black/40 border-white/15 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-400 animate-ping' : 'bg-slate-500'}`} />
                <span>0{idx + 1} • {model.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 3D Model Stage Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Interactive 3D WebGL Canvas Viewer */}
        <div className="lg:col-span-7 flex flex-col relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModel.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full"
            >
              <MatatuViewerCanvas
                modelUrl={activeModel.modelUrl}
                modelName={activeModel.name}
                slotNumber={activeModel.slotNumber}
                neonColor={activeModel.neonColor}
                interactive={true}
                onPrev={handlePrev}
                onNext={handleNext}
                totalModels={MATATU_3D_MODELS.length}
                currentIndex={currentIndex}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Column: Selected Model Detailed Spec Card */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-black/40 border border-white/15 backdrop-blur-md shadow-2xl space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModel.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-purple-600/30 border border-purple-400/30 text-purple-200 text-xs font-mono-tech uppercase">
                  {activeModel.route}
                </span>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-mono-tech">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>{activeModel.wattage} Rig</span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-wide">
                    {activeModel.name}
                  </h3>
                  <span className="text-xs font-mono-tech px-2 py-0.5 rounded bg-white/10 text-purple-300">
                    Slot #{activeModel.slotNumber}
                  </span>
                </div>
                <p className="text-purple-300 text-xs font-mono-tech italic mt-1">"{activeModel.slogan}"</p>
              </div>

              <p className="text-slate-300 text-xs leading-relaxed">
                {activeModel.description}
              </p>

              {/* Spec Details */}
              <div className="grid grid-cols-2 gap-2.5 font-mono-tech text-xs pt-2">
                <div className="p-3 rounded-2xl bg-black/50 border border-white/10 space-y-1">
                  <span className="text-purple-400 block text-[10px] uppercase">Airbrush Artist</span>
                  <span className="text-white font-bold text-xs">{activeModel.artist}</span>
                </div>
                <div className="p-3 rounded-2xl bg-black/50 border border-white/10 space-y-1">
                  <span className="text-pink-400 block text-[10px] uppercase">Award Won</span>
                  <span className="text-white font-bold text-xs">{activeModel.awards}</span>
                </div>
              </div>

              {/* Feature Tags */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-mono-tech text-slate-400 uppercase tracking-widest block font-semibold">
                  Customization Specifications
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeModel.features.map((feat, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-purple-200 text-[11px] font-mono-tech"
                    >
                      ⚡ {feat}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Sound Testing Interactive Bar */}
          <div className="p-4 rounded-2xl bg-black/60 border border-purple-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono-tech text-purple-300 uppercase font-semibold flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-purple-400" />
                <span>Test Rig Audio Profile</span>
              </span>

              <button
                onClick={() => toggleAudioSynth && toggleAudioSynth('bass')}
                className={`px-3 py-1 rounded-full text-xs font-mono-tech font-bold uppercase transition-all flex items-center gap-1.5 ${
                  isPlayingAudio
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-purple-600 hover:bg-purple-500 text-white'
                }`}
              >
                {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlayingAudio ? 'Stop FX' : 'Sub Bass'}</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 font-mono-tech text-[10px]">
              <button
                onClick={() => toggleAudioSynth && toggleAudioSynth('bass')}
                className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-purple-600/40 text-purple-200 border border-white/10 transition-all text-center"
              >
                Sub Bass 45Hz
              </button>
              <button
                onClick={() => toggleAudioSynth && toggleAudioSynth('horn')}
                className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-pink-600/40 text-pink-200 border border-white/10 transition-all text-center"
              >
                Air Horn
              </button>
              <button
                onClick={() => toggleAudioSynth && toggleAudioSynth('synth')}
                className="py-1.5 px-2 rounded-xl bg-white/5 hover:bg-amber-600/40 text-amber-200 border border-white/10 transition-all text-center"
              >
                Sheng Beat
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Model Navigation Bar & Keyboard Instructions */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/60 via-black/80 to-pink-950/60 border border-purple-500/30 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-black/60 p-2 rounded-xl border border-white/10">
            <kbd className="px-2 py-1 rounded bg-purple-600 text-white text-xs font-mono-tech font-bold">←</kbd>
            <kbd className="px-2 py-1 rounded bg-purple-600 text-white text-xs font-mono-tech font-bold">→</kbd>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-mono-tech text-white font-bold uppercase tracking-wider">
              Keyboard Arrow Navigation Active
            </span>
            <span className="text-[11px] font-mono-tech text-slate-400">
              Press Left or Right arrow keys anytime to switch between 3D Matatu models
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 hover:bg-purple-600/50 border border-white/20 text-xs font-mono-tech text-slate-200 hover:text-white transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Model</span>
          </button>
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono-tech font-bold uppercase tracking-wider shadow-lg shadow-purple-900/40 transition-all"
          >
            <span>Next Model</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
