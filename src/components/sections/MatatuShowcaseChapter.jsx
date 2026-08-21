import React, { useState } from 'react';
import MatatuViewer from '../canvas/MatatuViewer';

const MATATU_MODELS = [
  { id: 'optimus', name: 'Optimus Prime', route: 'Route 111 • Ngong Road', slogan: 'Roll Out The Bass', modelUrl: '/models/optimus1-transformed.glb', award: 'King of Ngong Road', description: 'The Transformer-themed Nganya that redefined Nairobi matatu street culture, with custom air-bag suspension, a powerful sound rig, and hand-painted metallic murals.' },
  { id: 'moneyfest', name: 'Moneyfest', route: 'Route 125 • Rongai Expressway', slogan: 'The Yellow Gold Rush', modelUrl: '/models/moneyfest-transformed.glb', award: 'Best Vibrant Design', description: 'A Rongai-route Nganya defined by solar-yellow paint, a golden sub-bass array, and a deliberately exuberant visual presence.' },
  { id: 'mood', name: 'Mood', route: 'Route 58 • Buruburu', slogan: 'Electric Vibe & Cyber Pulse', modelUrl: '/models/mood-transformed.glb', award: 'King of Buruburu', description: 'A Buruburu Nganya with a high-output sound system, electric purple visual character, and the restless energy of a Nairobi route in motion.' },
];

export default function MatatuShowcaseChapter() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const activeModel = MATATU_MODELS[currentIndex];
  const selectRelative = (direction) => setCurrentIndex((index) => (index + direction + MATATU_MODELS.length) % MATATU_MODELS.length);

  return (
    <section id="matatu" className="relative overflow-hidden bg-[#030508] py-20 sm:py-28">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d9a514]/60 to-transparent" />
      <div className="mx-auto max-w-7xl px-6 sm:px-12">
        <header className="grid gap-8 border-b border-white/10 pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="font-mono-tech text-[10px] uppercase tracking-[.22em] text-[#d9a514]">04 / Nganya archive</p>
            <h2 className="mt-4 max-w-3xl font-serif-display text-5xl font-light leading-[.86] text-[#f3f4f6] sm:text-7xl lg:text-8xl">NGANYA<br /><span className="text-slate-500">Culture in motion.</span></h2>
          </div>
          <p className="max-w-sm text-sm font-light leading-relaxed text-slate-400">An evolving archive of Nairobi’s customized matatus—moving canvases where route, sound, paint and public life meet.</p>
        </header>

        <div className="mt-10 sm:mt-14">
          <MatatuViewer models={MATATU_MODELS} currentIndex={currentIndex} onPrev={() => selectRelative(-1)} onNext={() => selectRelative(1)} onSelect={setCurrentIndex} />
        </div>

        <div className="grid gap-10 border-b border-white/10 py-10 sm:py-14 lg:grid-cols-[1.25fr_.75fr] lg:gap-20">
          <div>
            <p className="font-mono-tech text-[10px] uppercase tracking-[.2em] text-[#d9a514]">Exhibit note / {String(currentIndex + 1).padStart(2, '0')}</p>
            <h3 className="mt-3 font-serif-display text-4xl font-light text-[#f3f4f6] sm:text-5xl">{activeModel.name}</h3>
            <p className="mt-1 text-sm text-slate-500">“{activeModel.slogan}”</p>
            <p className="mt-6 max-w-2xl text-base font-light leading-8 text-slate-300">{activeModel.description}</p>
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-8 self-end border-l border-white/10 pl-6 sm:grid-cols-1">
            <div><dt className="font-mono-tech text-[9px] uppercase tracking-[.16em] text-[#717b87]">Route</dt><dd className="mt-2 text-sm text-[#f3f4f6]">{activeModel.route}</dd></div>
            <div><dt className="font-mono-tech text-[9px] uppercase tracking-[.16em] text-[#717b87]">Style</dt><dd className="mt-2 text-sm text-[#f3f4f6]">Custom matatu art</dd></div>
            <div><dt className="font-mono-tech text-[9px] uppercase tracking-[.16em] text-[#717b87]">Archive recognition</dt><dd className="mt-2 text-sm text-[#f3f4f6]">{activeModel.award}</dd></div>
          </dl>
        </div>

        <div className="grid gap-6 py-10 sm:grid-cols-3 sm:py-14">
          <p className="font-mono-tech text-[10px] uppercase tracking-[.2em] text-[#717b87]">Reading the object</p>
          <p className="text-sm leading-relaxed text-slate-400">Paint and graphics turn every surface into a public visual statement.</p>
          <p className="text-sm leading-relaxed text-slate-400">The route is not just a destination; it is the social context that gives each Nganya its character.</p>
        </div>
      </div>
    </section>
  );
}
