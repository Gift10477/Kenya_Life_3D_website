import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Center, OrbitControls, PerspectiveCamera, Sparkles, useGLTF } from '@react-three/drei';
import { RotateCcw, Zap, Maximize2, Box, ChevronLeft, ChevronRight } from 'lucide-react';

export const OPTIMUS_MODEL_URL = '/models/optimus1-transformed.glb';
export const MONEYFEST_MODEL_URL = '/models/moneyfest-transformed.glb';
export const MOOD_MODEL_URL = '/models/mood-transformed.glb';

// Enable Draco decoder path for compressed GLTF models
useGLTF.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.5/');

function MatatuAsset({ active = true, autoRotate = true, scale = 1.2, modelUrl = OPTIMUS_MODEL_URL }) {
  const pivot = useRef();
  // Enable draco decoding (true)
  const { scene } = useGLTF(modelUrl, true);
  
  // Clone scene cleanly so GLTF instance is fresh for render
  const model = useMemo(() => {
    if (!scene) return null;
    return scene.clone(true);
  }, [scene]);

  useEffect(() => {
    if (!model) return;
    model.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = true;
      child.receiveShadow = true;
      
      // Apply matte plain colors directly to scene materials (zero metallic shine, high roughness)
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((mat) => {
        if (!mat) return;
        if ('metalness' in mat) {
          mat.metalness = 0.0;
        }
        if ('roughness' in mat) {
          mat.roughness = 0.85;
        }
        if ('envMapIntensity' in mat) {
          mat.envMapIntensity = 0.0;
        }
      });
    });
  }, [model]);

  useFrame((state, delta) => {
    const group = pivot.current;
    if (!group || !active) return;
    if (autoRotate) {
      group.rotation.y += delta * 0.4;
    }
    group.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.05;
  });

  if (!model) return null;

  return (
    <group ref={pivot} scale={scale} position={[0, 0, 0]} dispose={null}>
      <Center>
        <primitive object={model} dispose={null} />
      </Center>
    </group>
  );
}

// Fallback stage when 3D model slot is waiting for user's additional GLB files
function ModelSlotFallback({ modelName, slotNumber, neonColor = '#f59e0b' }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div 
        className="w-20 h-20 rounded-3xl flex items-center justify-center border shadow-2xl animate-pulse"
        style={{ backgroundColor: `${neonColor}20`, borderColor: neonColor }}
      >
        <Box className="w-10 h-10" style={{ color: neonColor }} />
      </div>

      <div className="space-y-1">
        <span className="px-3 py-1 rounded-full bg-white/10 text-amber-200 text-xs font-mono-tech uppercase">
          3D Model Slot #{slotNumber}
        </span>
        <h4 className="font-heading text-2xl font-bold text-white uppercase">{modelName}</h4>
        <p className="text-slate-400 text-xs max-w-sm">
          Slot ready! Drop your 3D GLB model into <code className="text-amber-300">/public/models/</code> to view in full WebGL.
        </p>
      </div>
    </div>
  );
}

// Error Boundary wrapper for safe 3D model loading
class ModelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("3D Model load error:", error);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.modelUrl !== this.props.modelUrl) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export function MatatuViewerCanvas({ 
  modelUrl = OPTIMUS_MODEL_URL, 
  fallbackUrl,
  modelName = 'Optimus Prime',
  slotNumber = 1,
  neonColor = '#3b82f6', 
  interactive = true,
  onPrev,
  onNext,
  totalModels = 3,
  currentIndex = 0
}) {
  const [autoRotate, setAutoRotate] = useState(true);
  const [activeUrl, setActiveUrl] = useState(modelUrl);

  useEffect(() => {
    setActiveUrl(modelUrl);
  }, [modelUrl]);

  return (
    <div 
      className="relative w-full h-full min-h-[420px] sm:min-h-[500px] rounded-3xl overflow-hidden bg-gradient-to-b from-black/95 via-slate-950/60 to-black/95 border backdrop-blur-md shadow-2xl flex flex-col justify-between transition-colors duration-500"
      style={{ borderColor: `${neonColor}55` }}
    >
      {/* Top Header Badge & Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div 
          className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/80 border text-[11px] font-mono-tech backdrop-blur-md transition-colors duration-500"
          style={{ borderColor: `${neonColor}44`, color: neonColor }}
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>3D Matatu Model 0{currentIndex + 1} / 0{totalModels} • {modelName}</span>
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className="px-3 py-1 rounded-full text-[10px] font-mono-tech uppercase tracking-wider border transition-all"
            style={{ 
              backgroundColor: autoRotate ? `${neonColor}40` : 'rgba(0,0,0,0.5)',
              borderColor: autoRotate ? neonColor : 'rgba(255,255,255,0.2)',
              color: '#ffffff'
            }}
          >
            {autoRotate ? 'Auto Orbiting' : 'Paused Orbit'}
          </button>
        </div>
      </div>

      {/* Overlay Floating Arrow Navigation Buttons (Left & Right) */}
      <button
        onClick={onPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3.5 rounded-full bg-black/70 hover:bg-white/10 border border-white/20 text-white shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group backdrop-blur-md"
        title="Previous 3D Model (Left Arrow Key)"
      >
        <ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-0.5" />
      </button>

      <button
        onClick={onNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3.5 rounded-full bg-black/70 hover:bg-white/10 border border-white/20 text-white shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group backdrop-blur-md"
        title="Next 3D Model (Right Arrow Key)"
      >
        <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-0.5" />
      </button>

      {/* 3D Canvas or Fallback */}
      <ModelErrorBoundary 
        key={activeUrl}
        modelUrl={activeUrl}
        fallback={<ModelSlotFallback modelName={modelName} slotNumber={slotNumber} neonColor={neonColor} />}
      >
        <Canvas
          key={activeUrl}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        >
          <PerspectiveCamera makeDefault position={[0, 1.2, 4.5]} fov={45} />
          
          {/* Neutral Studio Lights to Preserve Authentic Model Colors */}
          <ambientLight intensity={2.2} />
          <directionalLight position={[6, 10, 6]} intensity={2.8} color="#ffffff" />
          <directionalLight position={[-6, 4, -4]} intensity={2.0} color="#ffffff" />
          <directionalLight position={[0, -5, 5]} intensity={1.2} color="#ffffff" />

          {/* Dynamic Ambient Space Light (Matches Yellow for Moneyfest, Blue for Optimus, etc.) */}
          <pointLight position={[0, -2, 0]} intensity={5} color={neonColor} distance={8} />
          <pointLight position={[4, 2, -3]} intensity={4} color={neonColor} distance={7} />

          <Suspense fallback={null}>
            <MatatuAsset active={true} autoRotate={autoRotate} scale={1.2} modelUrl={activeUrl} />
            <Sparkles count={45} scale={6} size={1.8} speed={0.3} color={neonColor} opacity={0.6} />
          </Suspense>

          {interactive && (
            <OrbitControls 
              enableZoom={true} 
              maxDistance={8} 
              minDistance={2} 
              enablePan={false}
              autoRotate={false}
            />
          )}
        </Canvas>
      </ModelErrorBoundary>

      {/* Bottom Floating Control & Keyboard Hint */}
      <div 
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none px-4 py-1.5 rounded-full bg-black/80 border text-[10px] font-mono-tech text-slate-300 backdrop-blur-md flex items-center gap-3 transition-colors duration-500"
        style={{ borderColor: `${neonColor}44` }}
      >
        <div className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold border border-white/20">←</kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold border border-white/20">→</kbd>
          <span className="text-slate-300 ml-1">Use Arrow Keys to Switch 3D Models</span>
        </div>
        <span className="text-slate-500">•</span>
        <span className="font-semibold" style={{ color: neonColor }}>Drag to rotate 3D</span>
      </div>
    </div>
  );
}

export function OptimusViewerCanvas(props) {
  return <MatatuViewerCanvas {...props} />;
}

export default function OptimusModel({ active = true, autoRotate = true, scale = 1.0, neonColor = '#3b82f6', modelUrl = OPTIMUS_MODEL_URL }) {
  return (
    <Suspense fallback={null}>
      <MatatuAsset active={active} autoRotate={autoRotate} scale={scale} modelUrl={modelUrl} />
    </Suspense>
  );
}

useGLTF.preload(OPTIMUS_MODEL_URL, true);
useGLTF.preload(MONEYFEST_MODEL_URL, true);
