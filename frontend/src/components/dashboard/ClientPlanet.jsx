import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export const ClientPlanet = ({ client, position, onClientClick, onHoverChange, isSelected, hasSelection }) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();
  const indicatorRef = useRef();

  const { status_actual } = client.workloads_resumen || {};

  // Color según status_actual de la API
  let color = '#9333ea'; // Morado por defecto (sin_workloads)
  if (status_actual === 'completado') color = '#10b981'; // Verde
  if (status_actual === 'en_progreso') color = '#f59e0b'; // Amarillo
  if (status_actual === 'pausado') color = '#3b82f6'; // Azul
  if (status_actual === 'cancelado') color = '#ef4444'; // Rojo
  if (status_actual === 'sin_workloads') color = '#9333ea'; // Morado

  // Oscurecer solo si hay selección y este no es el seleccionado
  const isDimmed = hasSelection && !isSelected;

  useFrame((state) => {
    if (meshRef.current && !hovered) {
      meshRef.current.rotation.y += 0.01;
      const pulse = Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.02;
      meshRef.current.scale.setScalar(1 + pulse);
    }
    
    if (indicatorRef.current && isSelected) {
      indicatorRef.current.rotation.y += 0.03;
      indicatorRef.current.rotation.x += 0.02;
    }
  });

  const handleHoverStart = () => {
    setHovered(true);
    if (onHoverChange) onHoverChange(client.id_cuenta);
  };

  const handleHoverEnd = () => {
    setHovered(false);
    if (onHoverChange) onHoverChange(null);
  };

  const handleClick = () => {
    onClientClick(client, position);
  };

  const size = isSelected ? 0.18 : (hovered ? 0.18 : 0.12);
  
  // Brillo: si está seleccionado Y hover = brilla MÁS, si solo hover = brilla, si solo seleccionado = brilla normal
  const emissiveIntensity = isDimmed ? 0.15 : (isSelected && hovered ? 4 : (hovered ? 2.5 : (isSelected ? 1.5 : 1.2)));
  const glowOpacity = isDimmed ? 0.01 : (isSelected && hovered ? 0.5 : (hovered ? 0.25 : (isSelected ? 0.15 : 0.1)));

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={handleHoverStart}
        onPointerOut={handleHoverEnd}
        onClick={handleClick}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          metalness={0.6}
          roughness={0.3}
          opacity={isDimmed ? 0.2 : 1}
          transparent={isDimmed}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[size * 1.4, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={glowOpacity}
          side={THREE.BackSide}
        />
      </mesh>

      {isSelected && (
        <group ref={indicatorRef}>
          {/* Círculo horizontal girando alrededor del cliente */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[size * 2.2, 0.02, 16, 64]} />
            <meshBasicMaterial color="#ff0000" transparent opacity={0.95} />
          </mesh>
          <pointLight position={[0, 0, 0]} intensity={5} color="#ff0000" distance={2} />
        </group>
      )}

      <Html position={[0, isSelected ? -size - 0.5 : -size - 0.15, 0]} center zIndexRange={[0, 0]}>
        <div 
          className={`text-[10px] whitespace-nowrap transition-all duration-300 select-none ${
            hovered || isSelected ? 'scale-110 font-bold' : ''
          }`}
          style={{ 
            color: isSelected ? '#ff0000' : (hovered ? color : '#9ca3af'),
            textShadow: (hovered || isSelected) ? `0 0 10px ${isSelected ? '#ff0000' : color}` : '0 0 6px rgba(0,0,0,0.9)',
            pointerEvents: 'none',
            opacity: isDimmed ? 0.2 : 1,
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none'
          }}
        >
          {client.cliente}
        </div>
      </Html>

      {isSelected && (
        <pointLight position={[0, 0, 0]} intensity={4} color={color} distance={2} />
      )}
    </group>
  );
};
