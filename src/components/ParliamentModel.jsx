import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Center, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { MathUtils } from 'three';

export const PARLIAMENT_MODEL_URL = '/models/parliament-transformed.glb';
export const PARLIAMENT_ROTATION_SPEED = 0.15;

function ParliamentAsset({ active, reducedMotion, scale = 20.0 }) {
  const pivot = useRef();
  const { scene } = useGLTF(PARLIAMENT_MODEL_URL);
  // Clone once, never per-frame: the GLTF cache stays reusable across scene mounts.
  const model = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    model.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = false;
      child.receiveShadow = false;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        if (!material?.isMeshStandardMaterial) return;
        material.flatShading = false;
        material.roughness = Math.min(material.roughness, 0.7);
        material.metalness = Math.max(material.metalness, 0.12);
      });
    });
  }, [model]);

  useFrame((state, delta) => {
    const group = pivot.current;
    if (!group || !active || reducedMotion) return;
    group.rotation.y += delta * PARLIAMENT_ROTATION_SPEED;
    group.rotation.x = MathUtils.lerp(group.rotation.x, state.pointer.y * 0.11, 0.065);
    group.rotation.z = MathUtils.lerp(group.rotation.z, -state.pointer.x * 0.11, 0.065);
    group.position.y = MathUtils.lerp(group.position.y, Math.sin(state.clock.elapsedTime * 0.8) * 0.08, 0.05);
  });

  return (
    <group ref={pivot} scale={scale} position={[0, 0, 0]} dispose={null}>
      <Center>
        <primitive object={model} dispose={null} />
      </Center>
    </group>
  );
}

export default function ParliamentModel({ active = true, reducedMotion = false, scale = 20.0 }) {
  return (
    <Suspense fallback={null}>
      <ParliamentAsset active={active} reducedMotion={reducedMotion} scale={scale} />
    </Suspense>
  );
}

useGLTF.preload(PARLIAMENT_MODEL_URL);
