import * as THREE from 'three';

export const Nebulas = ({ isDimmed = false }) => {
  return (
    <group>
      {[
        { pos: [5, 3, -8], color: '#4a148c', size: 5 },
        { pos: [-6, -2, -10], color: '#1a237e', size: 4 },
        { pos: [3, -4, -7], color: '#0d47a1', size: 4.5 },
      ].map((nebula, i) => (
        <mesh key={i} position={nebula.pos}>
          <sphereGeometry args={[nebula.size, 32, 32]} />
          <meshBasicMaterial 
            color={nebula.color} 
            transparent 
            opacity={isDimmed ? 0.02 : 0.08}
            side={THREE.BackSide}
          />
        </mesh>
      ))}
    </group>
  );
};
