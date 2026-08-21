import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Center, ContactShadows, Environment, PerspectiveCamera, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export const PARLIAMENT_MODEL_URL = `${import.meta.env.BASE_URL}models/parliament-transformed.glb`;

/**
 * GlowingSpatialParticles — Pure 3D glowing particle field.
 * Uses procedural radial glow texture, additive blending, and smooth cursor parallax response.
 */
function GlowingSpatialParticles({ active, reducedMotion }) {
  const pointsRef = useRef();
  const { mouse } = useThree();

  const particleCount = 420;

  // Procedural radiant particle glow texture (feathered star orb)
  const glowTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.2, 'rgba(255, 225, 140, 0.9)');
    grad.addColorStop(0.5, 'rgba(245, 158, 11, 0.4)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  const [positions, colors, scales, initialY] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    const sc = new Float32Array(particleCount);
    const initY = new Float32Array(particleCount);

    const amber = new THREE.Color('#fbbf24');
    const gold = new THREE.Color('#ffd580');
    const sunsetOrange = new THREE.Color('#f97316');
    const crimson = new THREE.Color('#de2010');
    const emerald = new THREE.Color('#00e599');
    const palette = [amber, gold, sunsetOrange, crimson, emerald];

    for (let i = 0; i < particleCount; i++) {
      // Spatial volume around landmark
      const theta = Math.random() * Math.PI * 2;
      const radius = 2.8 + Math.random() * 9.5;
      const x = Math.cos(theta) * radius;
      const y = (Math.random() - 0.45) * 8.5;
      const z = Math.sin(theta) * radius;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      initY[i] = y;

      const chosenColor = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = chosenColor.r;
      col[i * 3 + 1] = chosenColor.g;
      col[i * 3 + 2] = chosenColor.b;

      sc[i] = 0.9 + Math.random() * 2.0;
    }

    return [pos, col, sc, initY];
  }, []);

  useFrame((state, delta) => {
    if (!active || reducedMotion || !pointsRef.current) return;
    const time = state.clock.getElapsedTime();

    // Gentle 3D rotation & cursor sway
    const targetRotY = time * 0.05 + mouse.x * 0.35;
    const targetRotX = -mouse.y * 0.2;
    pointsRef.current.rotation.y += (targetRotY - pointsRef.current.rotation.y) * delta * 2.5;
    pointsRef.current.rotation.x += (targetRotX - pointsRef.current.rotation.x) * delta * 2.5;

    // Organic vertical floating drift
    const posAttr = pointsRef.current.geometry.attributes.position;
    const arr = posAttr.array;
    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3 + 1;
      arr[idx] = initialY[i] + Math.sin(time * 0.6 + i * 0.5) * 0.35;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.22}
        map={glowTexture}
        vertexColors
        transparent
        opacity={0.88}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation={true}
      />
    </points>
  );
}

function SceneController({ active, reducedMotion, scrollRotationRef, dragOffsetRef }) {
  const { camera } = useThree();

  useFrame((state, delta) => {
    if (!active || reducedMotion) return;

    // Smooth cursor parallax sway for camera
    const targetCamX = state.pointer.x * 0.45;
    const targetCamY = 0.8 + state.pointer.y * 0.25;
    camera.position.x += (targetCamX - camera.position.x) * Math.min(1, delta * 3.5);
    camera.position.y += (targetCamY - camera.position.y) * Math.min(1, delta * 3.5);
    camera.lookAt(0, 0, 0);

    // Apply damping / inertia decay to drag offset
    if (dragOffsetRef.current) {
      dragOffsetRef.current.velocity *= Math.pow(0.92, delta * 60);
      dragOffsetRef.current.offset += dragOffsetRef.current.velocity * delta;
    }
  });

  return null;
}

function ParliamentMesh({ active, reducedMotion, scale = 20.0, scrollRotationRef, dragOffsetRef }) {
  const groupRef = useRef();
  const { scene } = useGLTF(PARLIAMENT_MODEL_URL);

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
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((mat) => {
        if (!mat) return;
        const name = (mat.name || '').toLowerCase();
        const isMatte = name.includes('concrete') || name.includes('stone') || name.includes('plaster');
        if ('metalness' in mat) mat.metalness = isMatte ? 0.08 : Math.max(mat.metalness || 0, 0.45);
        if ('roughness' in mat) mat.roughness = isMatte ? 0.80 : Math.min(mat.roughness || 1, 0.32);
      });
    });
  }, [model]);

  useFrame((state) => {
    const group = groupRef.current;
    if (!group || !active) return;
    if (reducedMotion) {
      group.rotation.set(0, 0, 0);
      return;
    }
    const extraY = scrollRotationRef && typeof scrollRotationRef.current === 'number'
      ? scrollRotationRef.current
      : (scrollRotationRef?.current?.y ?? 0);
    const dragY = dragOffsetRef?.current?.offset ?? 0;

    // Turntable rotation + scroll timeline offset + interactive drag offset
    group.rotation.y = extraY + dragY + state.clock.elapsedTime * 0.15;
    group.rotation.x = 0;
    group.rotation.z = 0;
    group.position.set(0, 0, 0);
  });

  if (!model) return null;

  return (
    <group ref={groupRef} scale={scale} position={[0, 0, 0]} dispose={null}>
      <Center>
        <primitive object={model} dispose={null} />
      </Center>
    </group>
  );
}

export default function ParliamentScene({ active = true, reducedMotion = false, scrollRotationRef }) {
  const dragOffsetRef = useRef({ offset: 0, velocity: 0 });
  const isDraggingRef = useRef(false);
  const lastPointerXRef = useRef(0);
  const [isHovered, setIsHovered] = useState(false);

  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    lastPointerXRef.current = e.clientX;
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - lastPointerXRef.current;
    lastPointerXRef.current = e.clientX;
    const speed = (deltaX / window.innerWidth) * Math.PI * 2.2;
    dragOffsetRef.current.offset += speed;
    dragOffsetRef.current.velocity = speed * 30;
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div
      className={`w-full h-full ${isHovered ? 'cursor-grab active:cursor-grabbing' : ''}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerEnter={() => setIsHovered(true)}
    >
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        className="w-full h-full"
      >
        <PerspectiveCamera makeDefault position={[0, 0.8, 9]} fov={52} />

        <SceneController
          active={active}
          reducedMotion={reducedMotion}
          scrollRotationRef={scrollRotationRef}
          dragOffsetRef={dragOffsetRef}
        />

        {/* Studio HDRI Environment Reflections */}
        <Environment preset="city" />

        {/* Warm atmospheric fog — ties the 3D model into the sunset environment */}
        <fog attach="fog" args={['#1a0f05', 12, 28]} />

        {/* === CINEMATIC SPATIAL LIGHTING WITH FLAG RIM ACCENTS === */}
        <ambientLight intensity={0.3} />

        {/* Golden sunset key light — primary form-defining illumination */}
        <directionalLight position={[5, 4, 3]} intensity={3.2} color="#fef3c7" />

        {/* Warm golden back rim */}
        <pointLight position={[3, 2, -2]} intensity={18} distance={9} color="#f59e0b" />

        {/* Kenya Crimson accent rim */}
        <pointLight position={[-4, 1, 3]} intensity={20} distance={8} color="#de2010" />

        {/* Kenya Emerald accent rim */}
        <pointLight position={[4, -1, 2]} intensity={14} distance={7} color="#006a4e" />

        {/* Ground bounce fill — warm sunset reflection from below */}
        <pointLight position={[0, -3, 0]} intensity={4} distance={6} color="#ffd580" />

        <Suspense fallback={null}>
          {/* Luminous Glowing 3D Particle Field */}
          <GlowingSpatialParticles active={active} reducedMotion={reducedMotion} />

          <ParliamentMesh
            active={active}
            reducedMotion={reducedMotion}
            scale={20.0}
            scrollRotationRef={scrollRotationRef}
            dragOffsetRef={dragOffsetRef}
          />

          {/* Ground shadow catcher — warm tone to match sunset */}
          <ContactShadows
            position={[0, -2.2, 0]}
            opacity={0.5}
            scale={12}
            blur={2.5}
            far={4}
            color="#1a0f05"
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload(PARLIAMENT_MODEL_URL);
