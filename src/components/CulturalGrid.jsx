import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Bus, ShoppingBag, Building2, Utensils, ArrowRight, X, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CULTURAL_STAGES = [
  {
    id: 'matatu',
    index: '01',
    title: 'Nganya',
    titleJa: 'Urban Pulse & Kinetic Art',
    badge: 'Urban Energy',
    icon: Bus,
    description: "Experience Nairobi's iconic mobile art galleries—graffiti-covered buses with custom sound systems, LED displays, and raw urban street energy.",
    image: `${import.meta.env.BASE_URL}images/nganya.jpeg`,
    color: '#a855f7',
    accentGrad: 'from-purple-500/20 to-purple-900/40',
    stats: ['15,000+ Active Matatus', 'Custom Bass Audio', 'Street Graffiti Art'],
    highlights: [
      'Hand-painted pop culture murals and glowing neon interiors',
      'Matatu Culture Awards celebrating top customized designs',
      'Original Afrobeat & Sheng urban music playlists'
    ]
  },
  {
    id: 'market',
    index: '02',
    title: 'Maasai Market Stage',
    titleJa: 'Artisanal Craft & Color',
    badge: 'Heritage & Craft',
    icon: ShoppingBag,
    description: 'Immerse in open-air markets brimming with hand-carved soapstone, intricate Maasai beadwork, vibrant Kiondo baskets, and Leso textiles.',
    image: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=1200&q=80',
    color: '#006a4e',
    accentGrad: 'from-emerald-500/20 to-teal-600/30',
    stats: ['Centuries of Craft', 'Natural Dyes & Wood', 'Authentic Maasai Beads'],
    highlights: [
      'Intricate color-coded beadwork telling stories of tribal heritage',
      'Eco-friendly handwoven sisal Kiondo tote bags',
      'Kisii soapstone carvings sculpted by master artisans'
    ]
  },
  {
    id: 'parliament',
    index: '03',
    title: 'Parliament & Skyline',
    titleJa: 'Civic Pride & Modernity',
    badge: 'Civic Heritage',
    icon: Building2,
    description: 'Explore Kenya’s iconic National Parliament clock tower and Nairobi skyline, reflecting democratic history, resilience, and future ambition.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    color: '#0055a5',
    accentGrad: 'from-blue-500/20 to-indigo-600/30',
    stats: ['Established 1954', 'Clock Tower Landmark', 'Modern Architecture'],
    highlights: [
      'Historical legislative chamber & constitutional assembly',
      'Architectural blend of independence-era & modern design',
      'Symbol of national unity and governance'
    ]
  },
  {
    id: 'smocha',
    index: '04',
    title: 'Smocha',
    titleJa: 'Street Food Reimagined',
    badge: 'Kenyan Street Food',
    icon: Utensils,
    description: 'The Kenyan street-food icon — a smokie wrapped in a golden chapati with kachumbari and sauce. Deconstructed across 240 cinematic frames.',
    image: `${import.meta.env.BASE_URL}frames_smocha/frame_0001.jpg`,
    color: '#C99A55',
    accentGrad: 'from-amber-500/20 to-yellow-900/30',
    stats: ['240 Frames', 'Chapati & Smokie', 'Kachumbari'],
    highlights: [
      'Scroll-controlled 3D deconstruction of a classic Kenyan street snack',
      'Chapati, smokie, kachumbari and sauce — every layer revealed',
      'An interactive cinematic food experience unlike anything else'
    ]
  }
];

function createRoundedPlaneGeometry(width, height, radius, smoothness = 12) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);

  const geom = new THREE.ShapeGeometry(shape, smoothness);
  geom.computeBoundingBox();
  const { min, max } = geom.boundingBox;
  const rangeX = max.x - min.x;
  const rangeY = max.y - min.y;
  const pos = geom.attributes.position;
  const uvs = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uvs[i * 2] = (pos.getX(i) - min.x) / rangeX;
    uvs[i * 2 + 1] = (pos.getY(i) - min.y) / rangeY;
  }
  geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

  return { geometry: geom, shape };
}

function createCardTexture(stage, index, total) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');

  // The slide engine is preserved; its texture becomes an edge-to-edge scene.
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 640);
  bgGrad.addColorStop(0, stage.color);
  bgGrad.addColorStop(1, '#030405');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1024, 640);

  // Tech grid pattern
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 1024; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 640);
    ctx.stroke();
  }
  for (let y = 0; y < 640; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = stage.image;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const renderCard = () => {
    if (img.complete && img.naturalWidth !== 0) {
      try {
        ctx.save();
        ctx.globalAlpha = 0.92;
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const canvasRatio = 1024 / 640;
        let dw, dh, dx, dy;
        if (imgRatio > canvasRatio) {
          dh = 640;
          dw = 640 * imgRatio;
          dx = (1024 - dw) / 2;
          dy = 0;
        } else {
          dw = 1024;
          dh = 1024 / imgRatio;
          dx = 0;
          dy = (640 - dh) / 2;
        }
        ctx.drawImage(img, dx, dy, dw, dh);
        ctx.restore();
      } catch (e) { }
    }

    const overlayGrad = ctx.createLinearGradient(0, 0, 1024, 640);
    overlayGrad.addColorStop(0, 'rgba(2, 4, 6, 0.78)');
    overlayGrad.addColorStop(0.45, 'rgba(2, 4, 6, 0.12)');
    overlayGrad.addColorStop(1, 'rgba(2, 4, 6, 0.58)');
    ctx.fillStyle = overlayGrad;
    ctx.fillRect(0, 0, 1024, 640);

    // The editorial typography lives in the DOM overlay so the moving plane
    // reads as an environment, not a labelled product card.
    ctx.globalAlpha = 0;

    // Accent top bar
    ctx.fillStyle = stage.color;
    ctx.fillRect(0, 0, 1024, 3);

    // Single sleek thin border stroke along the edge
    ctx.strokeStyle = `${stage.color}aa`;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(2, 2, 1020, 636);

    // Index string
    ctx.font = 'bold 24px "Space Grotesk", sans-serif';
    ctx.fillStyle = stage.color;
    ctx.fillText(`${stage.index} / 04 — ${stage.badge.toUpperCase()}`, 40, 56);

    // Title
    ctx.font = 'bold 44px "Outfit", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(stage.title, 40, 500);

    // Subtitle
    ctx.font = '20px "Space Grotesk", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
    ctx.fillText(stage.titleJa, 40, 538);

    // Category Tags
    let tagX = 40;
    ctx.font = '14px "Space Grotesk", monospace';
    stage.stats.forEach((stat) => {
      const textWidth = ctx.measureText(stat).width;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.beginPath();
      ctx.roundRect(tagX, 565, textWidth + 20, 28, 14);
      ctx.fill();
      ctx.strokeStyle = `${stage.color}66`;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(stat, tagX + 10, 584);
      tagX += textWidth + 28;
    });

    ctx.globalAlpha = 1;
    const vignette = ctx.createRadialGradient(512, 310, 80, 512, 310, 620);
    vignette.addColorStop(0.45, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.72)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, 1024, 640);
    texture.needsUpdate = true;
  };

  img.onload = renderCard;
  renderCard();

  return texture;
}

const START_BUFFER = 0.08;
const END_BUFFER = 0.92;

export default function CulturalGrid() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [stageOpacity, setStageOpacity] = useState(0);
  const [selectedStage, setSelectedStage] = useState(null);
  const [isScalingNganya, setIsScalingNganya] = useState(false);
  const [scaleDirection, setScaleDirection] = useState('up');
  const [isNganyaPageOpen, setIsNganyaPageOpen] = useState(false);
  const [isSmochaPageOpen, setIsSmochaPageOpen] = useState(false);

  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);

  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const panelsRef = useRef([]);
  const animFrameRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseVecRef = useRef(new THREE.Vector2());

  const activeIdx = Math.min(CULTURAL_STAGES.length - 1, Math.max(0, Math.round(scrollProgress)));

  const handleStageOpen = useCallback((stage) => {
    setSelectedStage(stage);
  }, []);

  const handleNganyaClose = useCallback(() => {
    setIsNganyaPageOpen(false);
    setScaleDirection('down');
    setIsScalingNganya(true);
    setTimeout(() => {
      setIsScalingNganya(false);
    }, 1050);
  }, []);

  const handleSmochaClose = useCallback(() => {
    setIsSmochaPageOpen(false);
  }, []);

  /* 3D WebGL Scene Init */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const isMobile = window.innerWidth < 768 || ('ontouchstart' in window && window.innerWidth < 1024);
    const maxDpr = isMobile ? 1.5 : 2.0;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      precision: isMobile ? 'mediump' : 'highp',
      stencil: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = false;
    rendererRef.current = renderer;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.8);
    cameraRef.current = camera;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);

    const panels = [];
    const disposedResources = {
      geometries: [],
      materials: [],
      textures: [],
    };

    const { geometry } = createRoundedPlaneGeometry(5.8, 3.65, 0.04, 8);
    disposedResources.geometries.push(geometry);

    CULTURAL_STAGES.forEach((stage, i) => {
      const texture = createCardTexture(stage, i, CULTURAL_STAGES.length);
      disposedResources.textures.push(texture);

      const material = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        roughness: 0.25,
        metalness: 0.1,
        side: THREE.DoubleSide,
      });
      disposedResources.materials.push(material);

      const mesh = new THREE.Mesh(geometry, material);
      mesh.userData = { index: i, stage };

      // Purple/Accent Glow Shadow Backplane (floating aura behind single card)
      const glowCanvas = document.createElement('canvas');
      glowCanvas.width = 256;
      glowCanvas.height = 256;
      const gCtx = glowCanvas.getContext('2d');
      const gGrad = gCtx.createRadialGradient(128, 128, 15, 128, 128, 128);
      const shadowColorStr = stage.id === 'matatu' ? '168, 85, 247' : (stage.color === '#006a4e' ? '16, 185, 129' : '99, 102, 241');
      gGrad.addColorStop(0, `rgba(${shadowColorStr}, 0.7)`);
      gGrad.addColorStop(0.5, `rgba(${shadowColorStr}, 0.25)`);
      gGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      gCtx.fillStyle = gGrad;
      gCtx.fillRect(0, 0, 256, 256);

      const glowTexture = new THREE.CanvasTexture(glowCanvas);
      glowTexture.colorSpace = THREE.SRGBColorSpace;
      disposedResources.textures.push(glowTexture);

      const shadowMat = new THREE.MeshBasicMaterial({
        map: glowTexture,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      });
      disposedResources.materials.push(shadowMat);

      const shadowGeom = new THREE.PlaneGeometry(6.6, 4.3);
      disposedResources.geometries.push(shadowGeom);

      const shadowMesh = new THREE.Mesh(shadowGeom, shadowMat);
      shadowMesh.position.z = -0.03;
      mesh.add(shadowMesh);

      scene.add(mesh);
      panels.push(mesh);
    });
    panelsRef.current = panels;

    let isVisible = true;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.01 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      if (document.hidden || !isVisible) {
        return;
      }

      currentProgressRef.current += (targetProgressRef.current - currentProgressRef.current) * 0.12;
      const curProg = currentProgressRef.current;

      panels.forEach((panel, i) => {
        const offset = i - curProg;
        const distFromCenter = Math.abs(offset);

        const targetX = offset * 5.0;
        const targetZ = -distFromCenter * 1.65;
        const targetRotY = -Math.atan2(offset * 0.38, 3);
        const targetScale = Math.max(0.7, 1.08 - distFromCenter * 0.22);

        let targetOpacity = 0.2;
        if (distFromCenter < 0.5) {
          targetOpacity = 1.0 - distFromCenter * 0.4;
        } else if (distFromCenter < 1.5) {
          targetOpacity = 0.38 - (distFromCenter - 0.5) * 0.16;
        } else {
          targetOpacity = 0.12;
        }

        panel.position.x = targetX;
        panel.position.z = targetZ;
        panel.position.y = -0.15 + Math.sin(curProg * 2 + i) * 0.04;
        panel.rotation.y = targetRotY;

        panel.scale.set(targetScale, targetScale, targetScale);
        panel.material.opacity = targetOpacity;

        if (panel.children[0]) {
          panel.children[0].material.opacity = distFromCenter < 0.5 ? 0.9 : 0.2;
        }

        panel.renderOrder = Math.round(20 - distFromCenter * 5);
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!canvasRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = canvasRef.current.clientWidth || window.innerWidth;
      const h = canvasRef.current.clientHeight || window.innerHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      observer.disconnect();

      // Clean up GPU textures, geometries, and materials
      disposedResources.textures.forEach((t) => t.dispose());
      disposedResources.materials.forEach((m) => m.dispose());
      disposedResources.geometries.forEach((g) => g.dispose());
      renderer.dispose();
    };
  }, []);

  /* Continuous Pinning & Scroll Calculation */
  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;
      const viewportHeight = window.innerHeight;
      const containerTop = scrollY + rect.top;
      const containerHeight = container.offsetHeight;

      const pinStart = containerTop;
      const pinEnd = containerTop + containerHeight - viewportHeight;
      const totalDistance = pinEnd - pinStart;
      const currentDistance = scrollY - pinStart;
      const rawRatio = totalDistance > 0 ? currentDistance / totalDistance : 0;

      let opacity = 0;
      const fadeInStart = containerTop - viewportHeight * 0.6;
      const fadeOutEnd = pinEnd + viewportHeight * 0.6;

      if (scrollY >= fadeInStart && scrollY <= fadeOutEnd) {
        if (scrollY < pinStart) {
          opacity = Math.max(0.2, (scrollY - fadeInStart) / (pinStart - fadeInStart));
        } else if (scrollY > pinEnd) {
          opacity = 1.0 - (scrollY - pinEnd) / (fadeOutEnd - pinEnd);
        } else {
          opacity = 1.0;
        }
      } else {
        opacity = 0;
      }
      setStageOpacity(Math.max(0, Math.min(1, opacity)));

      let progress = 0;
      if (rawRatio < START_BUFFER) {
        progress = 0;
      } else if (rawRatio > END_BUFFER) {
        progress = 1.0;
      } else {
        progress = (rawRatio - START_BUFFER) / (END_BUFFER - START_BUFFER);
      }

      const floatIndex = Math.max(0, Math.min(CULTURAL_STAGES.length - 1, progress * (CULTURAL_STAGES.length - 1)));
      targetProgressRef.current = floatIndex;
      setScrollProgress(floatIndex);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToCard = useCallback((idx) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const scrollY = window.scrollY || window.pageYOffset;
    const containerTop = scrollY + rect.top;
    const scrollableHeight = container.offsetHeight - window.innerHeight;

    const targetRatio = START_BUFFER + (idx / (CULTURAL_STAGES.length - 1)) * (END_BUFFER - START_BUFFER);
    const targetScrollY = containerTop + targetRatio * scrollableHeight;

    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth',
    });
  }, []);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !cameraRef.current || !sceneRef.current) return;

    const rect = canvas.getBoundingClientRect();
    mouseVecRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseVecRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseVecRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(panelsRef.current);

    if (intersects.length > 0) {
      const clickedMesh = intersects[0].object;
      const clickedIndex = clickedMesh.userData.index;

      if (clickedIndex === activeIdx) {
        handleStageOpen(clickedMesh.userData.stage);
      } else {
        scrollToCard(clickedIndex);
      }
    }
  };

  const activeStage = CULTURAL_STAGES[activeIdx];

  return (
    <div
      id="cultural-grid"
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: `${(CULTURAL_STAGES.length + 3) * 120}vh`,
        backgroundColor: 'transparent',
      }}
    >
      {/* Scroll-pinned 3D Stage Viewport */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
          zIndex: 12,
          opacity: stageOpacity,
          pointerEvents: stageOpacity > 0.05 ? 'auto' : 'none',
          transition: 'opacity 0.15s ease-out',
        }}
      >
        {/* Subtle Glass Backdrop */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(5, 7, 10, 0.45)',
            background: `radial-gradient(circle at 70% 35%, ${activeStage.color}38 0%, rgba(5,7,10,0.3) 34%, rgba(5,7,10,0.92) 78%)`,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />

        {/* 3D WebGL Canvas */}
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            cursor: 'pointer',
            zIndex: 1,
          }}
        />

        {/* Editorial framing follows the same scroll progression as the canvas. */}
        <motion.div
          key={activeStage.id}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: (isScalingNganya || isNganyaPageOpen || isSmochaPageOpen) ? 0 : 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-6 sm:left-[10vw] bottom-24 sm:bottom-20 z-10 max-w-md pointer-events-none"
        >
          <p className="font-mono-tech text-[10px] sm:text-xs uppercase tracking-[0.38em] mb-5" style={{ color: activeStage.color }}>
            {activeStage.index} / 04 &nbsp; {activeStage.badge}
          </p>
          <h2 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-bold uppercase text-white leading-[0.88] tracking-[-0.045em] drop-shadow-2xl">
            {activeStage.title}
          </h2>
          <p className="mt-6 max-w-sm text-sm sm:text-base leading-relaxed text-slate-200/85">
            {activeStage.description}
          </p>
          <button onClick={() => handleStageOpen(activeStage)} className="pointer-events-auto mt-7 inline-flex items-center gap-3 border-b border-white/40 pb-2 font-mono-tech text-xs uppercase tracking-[0.22em] text-white transition hover:border-white hover:text-white">
            Enter scene <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>

        {/* Small fixed stage marker: navigation without competing with the scenes. */}
        <motion.div
          animate={{
            opacity: (isScalingNganya || isNganyaPageOpen || isSmochaPageOpen) ? 0 : 1,
            x: (isScalingNganya || isNganyaPageOpen || isSmochaPageOpen) ? -45 : 0,
          }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: (isScalingNganya || isNganyaPageOpen || isSmochaPageOpen) ? 0 : 0.35 }}
          className="absolute right-6 sm:right-12 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-4 pointer-events-auto"
        >
          {CULTURAL_STAGES.map((stage, idx) => {
            const isActive = idx === activeIdx;
            return (
              <div
                key={stage.id}
                onClick={() => scrollToCard(idx)}
                style={{
                  cursor: 'pointer',
                  padding: '3px 0',
                  borderRight: isActive ? `2px solid ${stage.color}` : '2px solid rgba(255, 255, 255, 0.18)',
                  transition: 'all 0.3s ease',
                }}
                className="group text-right pr-3"
              >
                <span className="font-mono-tech text-[10px] uppercase tracking-[0.2em]" style={{ color: isActive ? stage.color : '#94a3b8' }}>{stage.index}</span>
                {isActive && <div className="font-mono-tech text-[9px] uppercase tracking-[0.18em] text-white mt-1 whitespace-nowrap">{stage.title}</div>}
              </div>
            );
          })}
        </motion.div>

        {/* Legacy click controls remain mounted for the original navigation, but the cinematic overlay keeps them out of view. */}
        <motion.div
          animate={{
            opacity: (isScalingNganya || isNganyaPageOpen || isSmochaPageOpen) ? 0 : 1,
            y: (isScalingNganya || isNganyaPageOpen || isSmochaPageOpen) ? 45 : 0,
          }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: (isScalingNganya || isNganyaPageOpen || isSmochaPageOpen) ? 0 : 0.45 }}
          className="hidden"
        >
          <div>
            <div className="font-mono-tech text-xs uppercase tracking-widest text-amber-400 mb-1">
              STAGE {activeStage.index} / 04 — {activeStage.badge}
            </div>
            <h3 className="font-heading text-xl sm:text-2xl font-extrabold text-white">
              {activeStage.title}
            </h3>
            <p className="text-xs text-slate-300 line-clamp-1 mt-0.5 max-w-xl">
              {activeStage.description}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
            <button
              onClick={() => scrollToCard((activeIdx - 1 + CULTURAL_STAGES.length) % CULTURAL_STAGES.length)}
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:border-amber-400 hover:text-amber-400 transition"
              aria-label="Previous Stage"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => scrollToCard((activeIdx + 1) % CULTURAL_STAGES.length)}
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:border-amber-400 hover:text-amber-400 transition"
              aria-label="Next Stage"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => handleStageOpen(activeStage)}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-mono-tech text-xs font-semibold hover:shadow-lg transition flex items-center gap-2 hover:scale-105"
            >
              Explore Details <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Animated Cover Image Scaling Transition for Nganya (Up and Down) */}
      <AnimatePresence>
        {isScalingNganya && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-hidden bg-black/90 backdrop-blur-md flex items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={
                scaleDirection === 'up'
                  ? { width: '50vw', height: '32vw', borderRadius: '28px', scale: 0.5, y: 20 }
                  : { width: '100vw', height: '100vh', borderRadius: '0px', scale: 1.0, y: 0 }
              }
              animate={
                scaleDirection === 'up'
                  ? { width: '100vw', height: '100vh', borderRadius: '0px', scale: 1.0, y: 0 }
                  : { width: '50vw', height: '32vw', borderRadius: '28px', scale: 0.5, y: 20 }
              }
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden border border-purple-500/40 shadow-2xl shadow-purple-900/90 bg-[#06080d]"
            >
              {/* Background Cover Image */}
              <img
                src={`${import.meta.env.BASE_URL}images/nganya.jpeg`}
                alt="Nganya Cover"
                className="w-full h-full object-cover object-center filter brightness-95 contrast-105"
              />

              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050710] via-[#050710]/30 to-transparent" />

              {/* Top Purple Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-purple-500" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stage Detail Modal for Other Stages */}
      {selectedStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <div className="relative w-full max-w-3xl bg-[#0b0f17] border border-white/20 rounded-3xl overflow-hidden shadow-2xl">
            {/* Modal Image Header */}
            <div className="relative h-64 sm:h-80 w-full overflow-hidden">
              <img src={selectedStage.image} alt={selectedStage.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f17] via-[#0b0f17]/40 to-transparent" />

              <button
                onClick={() => setSelectedStage(null)}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 text-white hover:bg-black transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-6 left-6 right-6">
                <span className="px-3 py-1 rounded-full text-xs font-mono-tech bg-white/20 text-amber-300 backdrop-blur-md">
                  STAGE {selectedStage.index} / 04
                </span>
                <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white mt-2">
                  {selectedStage.title}
                </h2>
                <p className="text-sm font-mono-tech text-slate-300 mt-1">{selectedStage.subtitle}</p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8 space-y-6 max-h-[50vh] overflow-y-auto">
              <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                {selectedStage.description}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {selectedStage.stats.map((stat, i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <span className="text-xs font-mono-tech text-amber-400 font-bold block">{stat}</span>
                  </div>
                ))}
              </div>

              {/* Highlights */}
              <div className="space-y-3">
                <h4 className="font-mono-tech text-xs uppercase tracking-widest text-slate-400">Cultural Highlights</h4>
                <ul className="space-y-2">
                  {selectedStage.highlights.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
