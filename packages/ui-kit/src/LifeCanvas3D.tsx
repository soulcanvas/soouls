'use client';

import {
  Float,
  MeshDistortMaterial,
  OrbitControls,
  PerspectiveCamera,
  Sphere,
} from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import React, { useRef, useMemo } from 'react';
import type * as THREE from 'three';

const Orb = ({
  position,
  color,
  size,
  speed,
  distort,
}: {
  position: [number, number, number];
  color: string;
  size: number;
  speed: number;
  distort: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.position.y += Math.sin(t * speed) * 0.002;
  });

  return (
    <Float speed={speed * 2} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere ref={meshRef} args={[size, 64, 64]} position={position}>
        <MeshDistortMaterial
          color={color}
          speed={speed}
          distort={distort}
          radius={size}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </Sphere>
    </Float>
  );
};

export const LifeCanvas3D = () => {
  const orbs = useMemo(() => {
    const data = [
      {
        position: [2, 1, -2] as [number, number, number],
        color: '#FDE68A',
        size: 0.8,
        speed: 1.5,
        distort: 0.4,
      }, // Joy
      {
        position: [-2, -1, -3] as [number, number, number],
        color: '#94A3B8',
        size: 1.2,
        speed: 1.0,
        distort: 0.3,
      }, // Melancholy
      {
        position: [1, -2, -1] as [number, number, number],
        color: '#99F6E4',
        size: 0.6,
        speed: 2.0,
        distort: 0.5,
      }, // Focus
      {
        position: [-3, 2, -2] as [number, number, number],
        color: '#FDA4AF',
        size: 0.7,
        speed: 1.2,
        distort: 0.6,
      }, // Anxiety
      {
        position: [0, 0, -5] as [number, number, number],
        color: '#FDE68A',
        size: 1.5,
        speed: 0.8,
        distort: 0.2,
      }, // Background Large
    ];
    return data;
  }, []);

  return (
    <div className="absolute inset-0 z-0 h-screen w-full pointer-events-none">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />

        {orbs.map((orb) => (
          <Orb key={`${orb.color}-${orb.speed}`} {...orb} />
        ))}

        {/* Dynamic Lines (Simplified for now) */}
        <mesh>
          <bufferGeometry />
          <lineBasicMaterial color="#ffffff" opacity={0.1} transparent />
        </mesh>

        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
};
