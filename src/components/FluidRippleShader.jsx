import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const MAX_POINTS = 16;

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.9999, 1.0); // Fullscreen background clip space
  }
`;

const fragmentShader = `
  uniform vec2 uResolution;
  uniform float uTime;
  uniform vec3 uPoints[16]; // x, y, intensity/age
  uniform vec2 uVelocities[16];
  
  varying vec2 vUv;

  // Simplex-like noise helper
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 st = gl_FragCoord.xy / uResolution.xy;
    float aspect = uResolution.x / uResolution.y;
    vec2 stAspect = vec2(st.x * aspect, st.y);

    // Deep Obsidian Base
    vec3 baseColor = vec3(0.02, 0.03, 0.04);
    
    // Subtle background organic ambient gradient
    float n = snoise(st * 2.0 + vec2(uTime * 0.1));
    baseColor += vec3(0.015, 0.02, 0.03) * (n + 1.0);

    // Flag Palette Constants
    vec3 kenyaRed = vec3(0.87, 0.125, 0.063);     // #de2010 (Crimson Red)
    vec3 kenyaGreen = vec3(0.0, 0.415, 0.305);    // #006a4e (Emerald Green)
    vec3 kenyaGold = vec3(1.0, 0.78, 0.17);       // White/Gold accent

    vec2 totalDisplacement = vec2(0.0);
    float totalColorIntensity = 0.0;
    vec3 fluidColor = vec3(0.0);

    for (int i = 0; i < 16; i++) {
      float intensity = uPoints[i].z;
      if (intensity <= 0.001) continue;

      vec2 ptPos = uPoints[i].xy;
      vec2 ptAspect = vec2(ptPos.x * aspect, ptPos.y);

      float dist = distance(stAspect, ptAspect);
      
      // Fluid Wave Ripple Math
      float wave = sin(dist * 35.0 - uTime * 6.0) * exp(-dist * 8.0);
      wave *= intensity;

      vec2 dir = normalize(stAspect - ptAspect + vec2(0.0001));
      totalDisplacement += dir * wave * 0.08;

      // Color trail field strength
      float trailGlow = exp(-dist * 6.5) * intensity;
      
      // Color interpolation based on position & index alternating between Crimson Red & Emerald Green
      vec3 trailColor = (mod(float(i), 2.0) > 0.5) ? kenyaRed : kenyaGreen;
      if (dist < 0.08) {
        trailColor = mix(trailColor, kenyaGold, (1.0 - dist / 0.08) * 0.5);
      }

      fluidColor += trailColor * trailGlow;
      totalColorIntensity += trailGlow;
    }

    // Refract background noise with displacement
    vec2 distortedSt = st + totalDisplacement;
    float distNoise = snoise(distortedSt * 4.0 + uTime * 0.2);
    
    // Combine base, glowing fluid trails, and caustics
    vec3 finalColor = baseColor;
    if (totalColorIntensity > 0.001) {
      finalColor += fluidColor * 1.8;
      // Add neon glow core
      finalColor += vec3(smoothstep(0.4, 1.2, totalColorIntensity)) * 0.4;
    }

    // Specular liquid highlights
    float highlight = pow(max(0.0, distNoise + length(totalDisplacement) * 4.0), 3.0);
    finalColor += vec3(highlight * 0.15);

    // Subtle edge vignette
    float vignette = 1.0 - length((st - 0.5) * 1.3);
    vignette = smoothstep(0.0, 0.9, vignette);
    finalColor *= vignette;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export default function FluidRippleShader() {
  const meshRef = useRef();
  const { size } = useThree();

  const pointsRef = useRef(new Array(MAX_POINTS).fill(0).map(() => new THREE.Vector3(0, 0, 0)));
  const velocitiesRef = useRef(new Array(MAX_POINTS).fill(0).map(() => new THREE.Vector2(0, 0)));
  const currentIndexRef = useRef(0);
  const prevMouseRef = useRef(new THREE.Vector2(0.5, 0.5));

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uPoints: { value: pointsRef.current },
      uVelocities: { value: velocitiesRef.current },
    }),
    []
  );

  useEffect(() => {
    uniforms.uResolution.value.set(size.width, size.height);
  }, [size, uniforms]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = 1.0 - e.clientY / window.innerHeight; // Invert Y for GLSL coordinates

      const currentMouse = new THREE.Vector2(x, y);
      const vel = new THREE.Vector2().subVectors(currentMouse, prevMouseRef.current);
      const speed = vel.length();

      if (speed > 0.001) {
        const idx = currentIndexRef.current;
        pointsRef.current[idx].set(x, y, 1.0); // full intensity
        velocitiesRef.current[idx].copy(vel);

        currentIndexRef.current = (currentIndexRef.current + 1) % MAX_POINTS;
      }

      prevMouseRef.current.copy(currentMouse);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // Decay trail points smoothly
    for (let i = 0; i < MAX_POINTS; i++) {
      if (pointsRef.current[i].z > 0) {
        pointsRef.current[i].z -= delta * 1.5; // decay rate
        if (pointsRef.current[i].z < 0) pointsRef.current[i].z = 0;
      }
    }

    uniforms.uTime.value = state.clock.getElapsedTime();
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -5]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}
