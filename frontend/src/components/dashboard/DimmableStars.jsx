import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';

export const DimmableStars = ({ isDimmed }) => {
  const starsRef = useRef();
  
  useFrame(() => {
    if (starsRef.current) {
      starsRef.current.material.opacity = isDimmed ? 0.05 : 1;
    }
  });
  
  return <Stars ref={starsRef} radius={200} depth={150} count={20000} factor={4} saturation={0} fade speed={0.15} />;
};
