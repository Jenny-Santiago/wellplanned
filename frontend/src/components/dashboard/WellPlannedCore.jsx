import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export const WellPlannedCore = ({ isPaused, isDimmed }) => {
  const groupRef = useRef();
  const glowRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current && !isPaused) {
      groupRef.current.rotation.y += 0.002;
    }
    if (glowRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 1.5) * 0.5 + 0.5;
      glowRef.current.scale.setScalar(1 + pulse * 0.15);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color="#ff9900"
          emissive="#ff9900"
          emissiveIntensity={isDimmed ? 0.2 : 1.5}
          transparent
          opacity={isDimmed ? 0.15 : 0.6}
        />
      </mesh>

      <mesh ref={glowRef}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshBasicMaterial
          color="#ff9900"
          transparent
          opacity={isDimmed ? 0.02 : 0.15}
          side={THREE.BackSide}
        />
      </mesh>

      <Text 
        position={[0, 0, 0]} 
        fontSize={0.2} 
        color="#ffffff" 
        anchorX="center" 
        anchorY="middle" 
        fontWeight="bold"
        outlineWidth={0.015}
        outlineColor="#000000"
        fillOpacity={isDimmed ? 0.2 : 1}
      >
        AWS
      </Text>

      <pointLight position={[0, 0, 0]} intensity={isDimmed ? 0.3 : 3} color="#ff9900" distance={6} />
    </group>
  );
};
