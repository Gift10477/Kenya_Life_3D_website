import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export default function BackgroundText() {
  const textGroupRef = useRef();

  // Subtle mouse parallax movement for background text to enhance 3D spatial depth
  useFrame((state) => {
    if (!textGroupRef.current) return;
    const { pointer } = state;
    
    // Smooth lerp parallax
    textGroupRef.current.position.x = THREE.MathUtils.lerp(textGroupRef.current.position.x, pointer.x * 0.5, 0.05);
    textGroupRef.current.position.y = THREE.MathUtils.lerp(textGroupRef.current.position.y, pointer.y * 0.3, 0.05);
    textGroupRef.current.rotation.y = THREE.MathUtils.lerp(textGroupRef.current.rotation.y, pointer.x * 0.06, 0.05);
  });

  return (
    <group ref={textGroupRef} position={[0, 0, -2.5]}>
      {/* Massive Bold 3D Typography "KENYA" directly behind Parliament model */}
      <Text
        fontSize={3.6}
        letterSpacing={0.06}
        lineHeight={1}
        position={[0, 0, 0]}
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/outfit/v11/QdB84Fe43madq9yj688.woff"
      >
        KENYA
        <meshPhysicalMaterial
          color="#1e293b"          // Deep slate/dark fill
          emissive="#334155"       // Inner ambient light
          emissiveIntensity={0.4}
          metalness={0.9}
          roughness={0.15}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          transmission={0.2}
          thickness={1.2}
          transparent={true}
          opacity={0.9}
        />
      </Text>

      {/* Backup Text for Instant Render if font loads async */}
      <Text
        fontSize={3.6}
        letterSpacing={0.06}
        lineHeight={1}
        position={[0, 0, -0.05]}
        anchorX="center"
        anchorY="middle"
      >
        KENYA
        <meshStandardMaterial
          color="#0f172a"
          metalness={0.8}
          roughness={0.3}
        />
      </Text>
    </group>
  );
}
