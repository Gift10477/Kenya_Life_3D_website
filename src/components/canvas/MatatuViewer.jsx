import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Center, ContactShadows, Environment, OrbitControls, PerspectiveCamera, useGLTF } from '@react-three/drei';
import { Pause, Play, ZoomIn, ZoomOut, RotateCcw, Hand } from 'lucide-react';
import * as THREE from 'three';

// Set Draco decoder path once at module level
useGLTF.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.5/');

const DEFAULT_CAMERA_DISTANCE = 4.3;
const MIN_CAMERA_DISTANCE = 2.4;
const MAX_CAMERA_DISTANCE = 6.2;
const ZOOM_STEP = 0.65;

const MATATU_MODEL_URLS = [
  `${import.meta.env.BASE_URL}models/optimus1-transformed.glb`,
  `${import.meta.env.BASE_URL}models/moneyfest-transformed.glb`,
  `${import.meta.env.BASE_URL}models/mood-transformed.glb`,
];

function VehicleAsset({ modelUrl, autoRotate = true, scale = 1.95, isMobile = false }) {
  const pivotRef = useRef();
  const { scene } = useGLTF(modelUrl, true);
  const model = useMemo(() => scene?.clone(true), [scene]);

  useEffect(() => {
    if (!model) return;
    model.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = !isMobile;
      child.receiveShadow = !isMobile;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        if (!material) return;
        if ('metalness' in material) material.metalness = Math.max(material.metalness || 0, 0.26);
        if ('roughness' in material) material.roughness = Math.min(material.roughness || 1, 0.42);

        ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap'].forEach((texKey) => {
          const texture = material[texKey];
          if (texture && texture.isTexture) {
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = true;
            if (texKey === 'map') {
              texture.colorSpace = THREE.SRGBColorSpace;
            }
          }
        });
      });
    });

    return () => {
      // Clean up cloned model resources to prevent memory leaks across vehicle switching
      model.traverse((child) => {
        if (!child.isMesh) return;
        child.geometry?.dispose();
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((mat) => {
          ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap'].forEach((texKey) => {
            mat[texKey]?.dispose();
          });
          mat?.dispose();
        });
      });
    };
  }, [model, isMobile]);

  useFrame((state, delta) => {
    if (document.hidden) return;
    const group = pivotRef.current;
    if (!group) return;
    if (autoRotate) group.rotation.y += delta * 0.2;
    group.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.035;
  });

  if (!model) return null;
  return (
    <group ref={pivotRef} scale={scale} dispose={null}>
      <Center>
        <primitive object={model} dispose={null} />
      </Center>
    </group>
  );
}

function SmoothCameraController({ targetDistance, controlsRef }) {
  useFrame((_, delta) => {
    if (!controlsRef.current || document.hidden) return;
    const controls = controlsRef.current;
    const camera = controls.object;
    const target = controls.target;

    const dx = camera.position.x - target.x;
    const dy = camera.position.y - target.y;
    const dz = camera.position.z - target.z;
    const currentDist = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (currentDist > 0.01 && Math.abs(currentDist - targetDistance) > 0.01) {
      const lerpFactor = Math.min(1, delta * 8);
      const newDist = currentDist + (targetDistance - currentDist) * lerpFactor;
      const scale = newDist / currentDist;

      camera.position.x = target.x + dx * scale;
      camera.position.y = target.y + dy * scale;
      camera.position.z = target.z + dz * scale;
      controls.update();
    }
  });
  return null;
}

export default function MatatuViewer({ models = [], currentIndex = 0, onPrev, onNext, onSelect, fullBleed = false }) {
  const [autoRotate, setAutoRotate] = useState(true);
  const [isExploring, setIsExploring] = useState(false);
  const [targetDistance, setTargetDistance] = useState(DEFAULT_CAMERA_DISTANCE);
  const [touchOrbitEnabled, setTouchOrbitEnabled] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const controlsRef = useRef();

  const activeModel = models[currentIndex] || models[0];

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 1024);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') onPrev();
      if (event.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPrev, onNext]);

  const handleZoom = (direction) => {
    setTargetDistance((prev) =>
      Math.max(MIN_CAMERA_DISTANCE, Math.min(MAX_CAMERA_DISTANCE, prev + direction * ZOOM_STEP))
    );
  };

  const handleReset = () => {
    setTargetDistance(DEFAULT_CAMERA_DISTANCE);
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  const handleCreated = ({ gl }) => {
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.1;
    gl.shadowMap.enabled = !isTouchDevice;
  };

  return (
    <div
      className={`relative w-full overflow-hidden ${fullBleed
          ? 'h-full bg-transparent'
          : 'rounded-2xl bg-[#020406] border border-white/10'
        }`}
      style={fullBleed ? undefined : { height: 'clamp(380px, 52vw, 620px)' }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: fullBleed
            ? 'none'
            : `radial-gradient(ellipse 70% 65% at 50% 45%, rgba(168,85,247,0.08) 0%, rgba(30,20,60,0.25) 50%, transparent 80%)`,
        }}
      />

      {/* Canvas */}
      <Canvas
        dpr={[1, isTouchDevice ? 1.5 : 2.0]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          precision: isTouchDevice ? 'mediump' : 'highp',
          stencil: false,
        }}
        onCreated={handleCreated}
        className="w-full h-full"
      >
        <PerspectiveCamera makeDefault position={[0, 1.2, DEFAULT_CAMERA_DISTANCE]} fov={isTouchDevice ? 48 : 40} />
        <Environment preset="warehouse" />

        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 5, 3]} intensity={2.0} color="#fff8f0" />
        {/* Model accent rims */}
        <pointLight position={[-3, 1, 2]} intensity={10} distance={7} color="#a855f7" />
        <pointLight position={[3, -1, 2]} intensity={7} distance={6} color="#6366f1" />
        <pointLight position={[0, 3, -2]} intensity={5} distance={5} color="#fbbf24" />

        <Suspense fallback={null}>
          <VehicleAsset
            key={activeModel.modelUrl}
            modelUrl={activeModel.modelUrl}
            autoRotate={autoRotate && !isExploring}
            scale={1.95}
            isMobile={isTouchDevice}
          />
          <ContactShadows
            position={[0, -1.6, 0]}
            opacity={0.5}
            scale={8}
            blur={2.4}
            far={3}
            resolution={isTouchDevice ? 256 : 512}
            frames={1}
            color="#020406"
          />
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableZoom={false}
          enableRotate={!isTouchDevice || touchOrbitEnabled}
          touches={{
            ONE: touchOrbitEnabled ? THREE.TOUCH.ROTATE : THREE.TOUCH.NONE,
            TWO: THREE.TOUCH.DOLLY_PAN,
          }}
          minPolarAngle={Math.PI / 5}
          maxPolarAngle={Math.PI / 1.7}
          onStart={() => { setIsExploring(true); setAutoRotate(false); }}
          onEnd={() => setIsExploring(false)}
        />
        <SmoothCameraController targetDistance={targetDistance} controlsRef={controlsRef} />
      </Canvas>

      {/* Top model selector tabs */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 pointer-events-auto">
        <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md rounded-full p-1 border border-white/10">
          {models.map((model, idx) => (
            <button
              key={model.id}
              onClick={() => { onSelect(idx); setAutoRotate(true); }}
              className={`px-3 py-1 rounded-full text-[10px] font-mono-tech uppercase tracking-wider transition-all ${idx === currentIndex
                ? 'bg-white/20 text-amber-300 border border-amber-400/50'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              {model.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Mobile Orbit Lock / Touch Toggle */}
          {isTouchDevice && (
            <button
              onClick={() => setTouchOrbitEnabled((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-mono-tech uppercase tracking-wider backdrop-blur-md transition-all ${touchOrbitEnabled
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : 'bg-black/70 text-slate-400 border-white/15 hover:text-white'
                }`}
              title="Toggle touch orbit inspection"
            >
              <Hand className="w-3 h-3" />
              <span>{touchOrbitEnabled ? 'Orbiting 3D' : 'Touch to Orbit'}</span>
            </button>
          )}

          {/* Auto-rotate toggle */}
          <button
            onClick={() => setAutoRotate((v) => !v)}
            className="p-2 rounded-full border border-white/15 bg-black/70 backdrop-blur-md text-slate-300 hover:text-white hover:border-white/40 transition-all"
            title={autoRotate ? 'Pause rotation' : 'Resume rotation'}
          >
            {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-amber-400" />}
          </button>
        </div>
      </div>

      {/* Bottom zoom controls + nav */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
        {/* Prev/Next */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            className="w-8 h-8 rounded-full border border-white/20 bg-black/70 backdrop-blur-md flex items-center justify-center text-slate-300 hover:text-white hover:border-white/50 transition-all text-xs font-bold"
          >
            ‹
          </button>
          <button
            onClick={onNext}
            className="w-8 h-8 rounded-full border border-white/20 bg-black/70 backdrop-blur-md flex items-center justify-center text-slate-300 hover:text-white hover:border-white/50 transition-all text-xs font-bold"
          >
            ›
          </button>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md rounded-full p-1 border border-white/10">
          <button onClick={() => handleZoom(-1)} className="p-1.5 rounded-full text-slate-400 hover:text-white transition-colors" title="Zoom In">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleReset} className="p-1.5 rounded-full text-slate-400 hover:text-white transition-colors" title="Reset Camera">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => handleZoom(1)} className="p-1.5 rounded-full text-slate-400 hover:text-white transition-colors" title="Zoom Out">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Drag hint */}
        {isExploring && (
          <span className="text-[9px] font-mono-tech text-amber-300/70 uppercase tracking-widest">
            Exploring
          </span>
        )}
        {!isExploring && (
          <span className="text-[9px] font-mono-tech text-slate-500 uppercase tracking-widest">
            {isTouchDevice && !touchOrbitEnabled ? 'Swipe past or tap Orbit' : 'Drag to orbit'}
          </span>
        )}
      </div>
    </div>
  );
}

// Preload all 3 Matatu GLBs at module level — fixes cold-start latency
MATATU_MODEL_URLS.forEach((url) => useGLTF.preload(url));
