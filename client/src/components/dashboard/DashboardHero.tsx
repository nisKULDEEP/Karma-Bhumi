import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, MeshWobbleMaterial, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

// Floating object that will rotate and move slightly
const FloatingCube = ({ position, color, size, speed, wobble }) => {
  const mesh = useRef();
  
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    mesh.current.position.y = position[1] + Math.sin(time * speed) * 0.1;
    mesh.current.rotation.x = Math.sin(time * speed * 0.4) * 0.2;
    mesh.current.rotation.y += 0.01 * speed;
    mesh.current.rotation.z = Math.sin(time * speed * 0.3) * 0.1;
  });

  return (
    <mesh ref={mesh} position={position} castShadow>
      <RoundedBox args={[size, size, size]} radius={0.1} smoothness={4}>
        <MeshWobbleMaterial 
          color={color} 
          factor={wobble} 
          speed={1} 
          metalness={0.1}
          roughness={0.5}
        />
      </RoundedBox>
    </mesh>
  );
};

// Main dashboard animation scene
const DashboardScene = () => {
  const group = useRef();
  
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    group.current.rotation.y = Math.sin(time * 0.2) * 0.1;
  });
  
  return (
    <group ref={group}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} castShadow />
      
      {/* Cubes positioned to the right side of the canvas to leave space for text */}
      <FloatingCube position={[2, 0.2, 0]} color="#4f46e5" size={0.5} speed={0.8} wobble={0.4} />
      <FloatingCube position={[3, 0.5, -1]} color="#0ea5e9" size={0.4} speed={1.2} wobble={0.2} />
      <FloatingCube position={[2.5, -0.3, 0.5]} color="#ec4899" size={0.3} speed={1.0} wobble={0.3} />
      <FloatingCube position={[2.8, -0.6, -1.0]} color="#22c55e" size={0.35} speed={0.7} wobble={0.5} />
      <FloatingCube position={[3.2, 0.1, 0.7]} color="#eab308" size={0.25} speed={1.5} wobble={0.1} />
    </group>
  );
};

interface DashboardHeroProps {
  userName?: string;
}

const DashboardHero: React.FC<DashboardHeroProps> = ({ userName = "User" }) => {
  return (
    <div className="relative w-full h-56 mb-8 overflow-hidden rounded-lg bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-slate-900/60 dark:to-slate-800/60">
      {/* Text content positioned to the left */}
      <div className="absolute top-0 left-0 h-full z-10 flex flex-col justify-center px-8 w-2/3">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-2">
          Welcome back, {userName}!
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md">
          Here's an overview of your workspace activity
        </p>
      </div>
      
      {/* 3D Canvas positioned to the right */}
      <div className="absolute inset-0 left-auto w-1/2">
        <Canvas shadows camera={{ position: [0, 0, 5], fov: 45 }}>
          <DashboardScene />
          <OrbitControls 
            enablePan={false}
            enableZoom={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2.5}
            enableRotate={false}
          />
        </Canvas>
      </div>
    </div>
  );
};

export default DashboardHero;