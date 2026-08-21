import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Center, ContactShadows, PerspectiveCamera, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export const PARLIAMENT_MODEL_URL = `${import.meta.env.BASE_URL}models/parliament-transformed.glb`;

const isMobileViewport = () =>
  typeof window !== 'undefined' &&
  (window.innerWidth < 768 || ('ontouchstart' in window && window.innerWidth < 1024));

/**
 * GlowingSpatialParticles — High-efficiency 3D glowing particle field.
 * Optimized for mobile: renders lightweight points with GPU-only transformation (no CPU buffer mutation).
 */
function GlowingSpatialParticles({ active, reducedMotion, isMobile }) {
  const pointsRef = useRef();
  const { mouse } = useThree();

  const particleCount = isMobile ? 36 : 100;

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
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, []);

  useEffect(() => {
    return () => {
      glowTexture?.dispose();
    };
  }, [glowTexture]);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);

    const amber = new THREE.Color('#fbbf24');
    const gold = new THREE.Color('#ffd580');
    const sunsetOrange = new THREE.Color('#f97316');
    const crimson = new THREE.Color('#de2010');
    const palette = [amber, gold, sunsetOrange, crimson];

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const radius = 2.5 + Math.random() * 8.0;
      const x = Math.cos(theta) * radius;
      const y = (Math.random() - 0.4) * 7.0;
      const z = Math.sin(theta) * radius;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      const chosenColor = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = chosenColor.r;
      col[i * 3 + 1] = chosenColor.g;
      col[i * 3 + 2] = chosenColor.b;
    }

    return [pos, col];
  }, [particleCount]);

  useFrame((state, delta) => {
    if (!active || reducedMotion || !pointsRef.current || document.hidden) return;
    const time = state.clock.getElapsedTime();

    // Smooth GPU rotation & gentle pointer sway without mutating CPU buffer arrays
    const targetRotY = time * 0.04 + mouse.x * 0.2;
    const targetRotX = -mouse.y * 0.12 + Math.sin(time * 0.3) * 0.04;
    pointsRef.current.rotation.y += (targetRotY - pointsRef.current.rotation.y) * Math.min(1, delta * 2.0);
    pointsRef.current.rotation.x += (targetRotX - pointsRef.current.rotation.x) * Math.min(1, delta * 2.0);
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
        size={isMobile ? 0.24 : 0.22}
        map={glowTexture}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation={true}
      />
    </points>
  );
}

/**
 * ResponsiveCameraController — Dynamically adapts camera perspective and distance.
 * Crucially avoids extreme wide-angle FOV expansion on narrow mobile screens (which creates conical/distorted buildings),
 * instead holding a natural 44° architectural perspective and adjusting Z-distance proportionally.
 */
function ResponsiveCameraController({ active, reducedMotion, dragOffsetRef }) {
  const { camera, size } = useThree();

  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height);

    // Narrow mobile portrait screens (e.g. aspect < 0.85)
    if (aspect < 0.85) {
      // Natural 44° FOV avoids wide-angle edge warping; adjust distance to fit frame cleanly
      camera.fov = 44;
      camera.position.z = 8.6 * (0.85 / Math.max(0.48, aspect)) * 0.86;
      camera.position.y = 0.5;
    } else if (aspect < 1.2) {
      // Tablets / square viewports
      camera.fov = 45;
      camera.position.z = 9.2;
      camera.position.y = 0.6;
    } else {
      // Desktop widescreen landscape
      camera.fov = 46;
      camera.position.z = 8.8;
      camera.position.y = 0.75;
    }
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
  }, [camera, size]);

  useFrame((state, delta) => {
    if (!active || reducedMotion || document.hidden) return;

    const isMobile = size.width < 768;
    if (!isMobile) {
      const targetCamX = state.pointer.x * 0.35;
      const targetCamY = 0.75 + state.pointer.y * 0.2;
      camera.position.x += (targetCamX - camera.position.x) * Math.min(1, delta * 3.0);
      camera.position.y += (targetCamY - camera.position.y) * Math.min(1, delta * 3.0);
    }
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
  const { gl } = useThree();

  const model = useMemo(() => {
    if (!scene) return null;
    return scene.clone(true);
  }, [scene]);

  useEffect(() => {
    if (!model) return;

    const maxAnisotropy = Math.min(gl.capabilities?.getMaxAnisotropy?.() || 4, 8);

    model.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = false;
      child.receiveShadow = false;

      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((mat) => {
        if (!mat) return;

        // Render both sides to avoid missing polygons / dark see-through patches
        mat.side = THREE.DoubleSide;

        // Clean natural architectural matte finish (prevents dark mirror blotches)
        if ('metalness' in mat) {
          mat.metalness = Math.min(mat.metalness ?? 0, 0.08);
        }
        if ('roughness' in mat) {
          mat.roughness = Math.max(mat.roughness ?? 0.72, 0.65);
        }
        if ('envMapIntensity' in mat) {
          mat.envMapIntensity = 0.25;
        }

        // Texture filtering, normal map preservation, and SRGB color space configuration
        ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'bumpMap'].forEach((texKey) => {
          const texture = mat[texKey];
          if (texture && texture.isTexture) {
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = true;
            if (texKey === 'map') {
              texture.colorSpace = THREE.SRGBColorSpace;
            }
            texture.anisotropy = maxAnisotropy;
            texture.needsUpdate = true;
          }
        });

        mat.needsUpdate = true;
      });
    });

    return () => {
      // Clean up resources on unmount
      model.traverse((child) => {
        if (!child.isMesh) return;
        child.geometry?.dispose();
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((mat) => {
          ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'bumpMap'].forEach((texKey) => {
            mat[texKey]?.dispose();
          });
          mat?.dispose();
        });
      });
    };
  }, [model, gl]);

  useFrame((state) => {
    const group = groupRef.current;
    if (!group || !active || document.hidden) return;
    if (reducedMotion) {
      group.rotation.set(0, 0, 0);
      return;
    }
    const extraY =
      scrollRotationRef && typeof scrollRotationRef.current === 'number'
        ? scrollRotationRef.current
        : (scrollRotationRef?.current?.y ?? 0);
    const dragY = dragOffsetRef?.current?.offset ?? 0;

    // Turntable rotation + scroll timeline offset + interactive drag offset
    group.rotation.y = extraY + dragY + state.clock.elapsedTime * 0.12;
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
  const containerRef = useRef(null);
  const dragOffsetRef = useRef({ offset: 0, velocity: 0 });
  const isDraggingRef = useRef(false);
  const lastPointerXRef = useRef(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(isMobileViewport());
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    window.addEventListener('orientationchange', checkMobile, { passive: true });
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    lastPointerXRef.current = clientX;
    if (e.target && e.target.setPointerCapture && e.pointerId !== undefined) {
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch (_) {}
    }
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    const deltaX = clientX - lastPointerXRef.current;
    lastPointerXRef.current = clientX;
    const speed = (deltaX / Math.max(window.innerWidth, 1)) * Math.PI * 2.0;
    dragOffsetRef.current.offset += speed;
    dragOffsetRef.current.velocity = speed * 30;
  };

  const handlePointerUp = (e) => {
    isDraggingRef.current = false;
    if (e.target && e.target.releasePointerCapture && e.pointerId !== undefined) {
      try {
        e.target.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
  };

  const modelScale = isMobile ? 17.5 : 20.0;

  const handleCreated = ({ gl }) => {
    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.15;
    if (gl.shadowMap) {
      gl.shadowMap.enabled = false;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`w-full h-full touch-pan-y ${isHovered ? 'cursor-grab active:cursor-grabbing' : ''}`}
      style={{ touchAction: 'pan-y' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerEnter={() => setIsHovered(true)}
    >
      <Canvas
        dpr={[1, isMobile ? 1.5 : 2.0]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        onCreated={handleCreated}
        className="w-full h-full"
      >
        <PerspectiveCamera makeDefault position={[0, 0.6, 9.0]} fov={46} />

        <ResponsiveCameraController
          active={active}
          reducedMotion={reducedMotion}
          dragOffsetRef={dragOffsetRef}
        />

        {/* Soft, balanced ambient base lighting for even architectural illumination */}
        <ambientLight intensity={0.95} color="#ffffff" />

        {/* Primary warm golden sun key light */}
        <directionalLight position={[6, 9, 6]} intensity={2.6} color="#fff6e5" />

        {/* Cool atmospheric sky fill from top-left */}
        <directionalLight position={[-6, 6, -3]} intensity={1.0} color="#c7d2fe" />

        {/* Warm sunset rim light from behind for clean architectural silhouette */}
        <directionalLight position={[0, 5, -8]} intensity={1.5} color="#f59e0b" />

        {/* Subtle ground reflection bounce */}
        <directionalLight position={[0, -5, 2]} intensity={0.4} color="#fed7aa" />

        <Suspense fallback={null}>
          {/* Luminous Glowing 3D Particle Field */}
          <GlowingSpatialParticles active={active} reducedMotion={reducedMotion} isMobile={isMobile} />

          <ParliamentMesh
            active={active}
            reducedMotion={reducedMotion}
            scale={modelScale}
            scrollRotationRef={scrollRotationRef}
            dragOffsetRef={dragOffsetRef}
          />

          {/* Static ground shadow catcher (renders once on load to conserve mobile GPU) */}
          <ContactShadows
            position={[0, -2.1, 0]}
            opacity={0.45}
            scale={isMobile ? 9 : 12}
            blur={2.2}
            far={3.5}
            resolution={isMobile ? 256 : 512}
            frames={1}
            color="#0f0905"
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
