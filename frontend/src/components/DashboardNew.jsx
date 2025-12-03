import { useState, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

// Generar datos de clientes
const generateMockData = () => {
  const baseNames = [
    'TechCorp', 'Global Industries', 'Asia Pacific', 'Euro Systems', 'South America Tech',
    'Nordic Solutions', 'Middle East Corp', 'Australia Group', 'Canada Systems', 'India Tech Hub',
    'Digital Ventures', 'Cloud Innovations', 'Data Systems', 'Smart Solutions', 'Future Tech',
    'Quantum Labs', 'Cyber Security', 'AI Dynamics', 'Blockchain Corp', 'IoT Solutions',
  ];

  const suffixes = ['Inc', 'Ltd', 'Corp', 'Group', 'Solutions', 'Systems'];
  
  const clients = Array.from({ length: 20 }, (_, i) => {
    const baseName = baseNames[i % baseNames.length];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    return {
      id: `CLI${String(i + 1).padStart(5, '0')}`,
      name: `${baseName} ${suffix}`,
    };
  });

  const statuses = ['completadas', 'en_progreso', 'canceladas', 'en_pausa'];
  const years = [2023, 2024, 2025];
  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

  return clients.map(client => {
    const numWorkloads = Math.floor(Math.random() * 13) + 3;
    const workloads = [];

    for (let i = 0; i < numWorkloads; i++) {
      const year = years[Math.floor(Math.random() * years.length)];
      const month = months[Math.floor(Math.random() * months.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      workloads.push({
        id: `WL${client.id}_${year}${month}_${i}`,
        clientId: client.id,
        year,
        month,
        status,
        title: `Workload ${i + 1}`,
        createdAt: `${year}-${month}-${Math.floor(Math.random() * 28) + 1}`
      });
    }

    return { ...client, workloads };
  });
};

// Núcleo AWS - Nube central
const AWSCloudCore = ({ isPaused }) => {
  const groupRef = useRef();
  const glowRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current && !isPaused) {
      groupRef.current.rotation.y += 0.002;
    }
    if (glowRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 1.5) * 0.5 + 0.5;
      glowRef.current.scale.setScalar(1 + pulse * 0.1);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Nube central (forma orgánica) */}
      <mesh>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial
          color="#ff9900"
          emissive="#ff9900"
          emissiveIntensity={1.5}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>

      {/* Capas de nube */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.3}
          emissive="#ff9900"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Aura externa */}
      <mesh>
        <sphereGeometry args={[1.3, 32, 32]} />
        <meshBasicMaterial
          color="#ff9900"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Logo AWS grande y visible */}
      <Text 
        position={[0, 0, 0]} 
        fontSize={0.4} 
        color="#ffffff" 
        anchorX="center" 
        anchorY="middle" 
        fontWeight="bold"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        AWS
      </Text>

      {/* Luz central potente */}
      <pointLight position={[0, 0, 0]} intensity={5} color="#ff9900" distance={8} />
    </group>
  );
};

// Base de datos del cliente
const DatabaseBase = ({ client, position, onClientClick, onHoverChange }) => {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef();

  const completadas = client.workloads.filter(w => w.status === 'completadas').length;
  const enProgreso = client.workloads.filter(w => w.status === 'en_progreso').length;
  const canceladas = client.workloads.filter(w => w.status === 'canceladas').length;
  const enPausa = client.workloads.filter(w => w.status === 'en_pausa').length;
  const total = client.workloads.length;

  let color = '#10b981';
  let statusText = 'Completadas';
  let maxCount = completadas;

  if (enProgreso > maxCount) {
    color = '#f59e0b';
    statusText = 'En Progreso';
    maxCount = enProgreso;
  }
  if (canceladas > maxCount) {
    color = '#ef4444';
    statusText = 'Canceladas';
    maxCount = canceladas;
  }
  if (enPausa > maxCount) {
    color = '#3b82f6';
    statusText = 'En Pausa';
  }

  useFrame((state) => {
    if (groupRef.current && !hovered) {
      groupRef.current.rotation.y += 0.005;
      const pulse = Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.03;
      groupRef.current.position.y = position[1] + pulse;
    }
  });

  const handleHoverStart = () => {
    setHovered(true);
    if (onHoverChange) onHoverChange(true);
  };

  const handleHoverEnd = () => {
    setHovered(false);
    if (onHoverChange) onHoverChange(false);
  };

  const baseHeight = 0.3;
  const baseRadius = 0.15;

  return (
    <group position={position} ref={groupRef}>
      {/* Base de datos (cilindro) */}
      <mesh
        onPointerOver={handleHoverStart}
        onPointerOut={handleHoverEnd}
        onClick={() => onClientClick(client)}
      >
        <cylinderGeometry args={[baseRadius, baseRadius, baseHeight, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 1.5 : 0.8}
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* Anillos de la base de datos */}
      {[0.1, 0, -0.1].map((offset, i) => (
        <mesh key={i} position={[0, offset, 0]}>
          <torusGeometry args={[baseRadius, 0.01, 8, 32]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
        </mesh>
      ))}

      {/* Plataforma base */}
      <mesh position={[0, -baseHeight / 2 - 0.02, 0]}>
        <cylinderGeometry args={[baseRadius * 1.2, baseRadius * 1.3, 0.04, 32]} />
        <meshStandardMaterial color="#2a2a3e" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Nombre del cliente debajo */}
      <Html position={[0, -baseHeight / 2 - 0.2, 0]} center>
        <div 
          className={`text-[11px] whitespace-nowrap transition-all duration-300 font-medium ${
            hovered ? 'scale-125 font-bold' : ''
          }`}
          style={{ 
            color: hovered ? color : '#d1d5db',
            textShadow: hovered ? `0 0 10px ${color}` : '0 0 6px rgba(0,0,0,0.9)',
            pointerEvents: 'none'
          }}
        >
          {client.name}
        </div>
      </Html>

      {/* Indicador de workloads */}
      <Html position={[0, baseHeight / 2 + 0.12, 0]} center>
        <div 
          className="text-[9px] font-mono bg-black/80 px-2 py-1 rounded"
          style={{ 
            color: color,
            pointerEvents: 'none',
            border: `1px solid ${color}60`,
            fontWeight: 'bold'
          }}
        >
          {total} Workloads
        </div>
      </Html>

      {/* Efecto de hover */}
      {hovered && (
        <>
          <pointLight position={[0, 0, 0]} intensity={4} color={color} distance={2} />
          <mesh position={[0, baseHeight / 2 + 0.05, 0]}>
            <cylinderGeometry args={[baseRadius * 1.8, baseRadius * 1.8, 0.01, 32]} />
            <meshBasicMaterial color={color} transparent opacity={0.4} />
          </mesh>

          {/* Card de información detallada */}
          <Html position={[0, 0.7, 0]} center>
            <div 
              className="bg-gray-900/98 backdrop-blur-md px-5 py-4 rounded-xl border-2 shadow-2xl"
              style={{ 
                pointerEvents: 'none',
                borderColor: color,
                boxShadow: `0 0 30px ${color}60`,
                minWidth: '240px'
              }}
            >
              <div className="text-base font-bold text-white mb-3" style={{ color }}>
                📊 {client.name}
              </div>
              <div className="text-xs text-gray-400 mb-3 font-mono">
                ID: {client.id}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total Workloads:</span>
                  <span className="text-white font-bold text-lg">{total}</span>
                </div>
                <div className="h-px bg-gray-700 my-2"></div>
                <div className="flex justify-between">
                  <span className="text-green-400">✓ Completadas:</span>
                  <span className="text-white font-semibold">{completadas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-400">⟳ En Progreso:</span>
                  <span className="text-white font-semibold">{enProgreso}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-400">✗ Canceladas:</span>
                  <span className="text-white font-semibold">{canceladas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-400">⏸ En Pausa:</span>
                  <span className="text-white font-semibold">{enPausa}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t-2 border-gray-700 text-sm">
                <span className="text-gray-400">Estado predominante: </span>
                <span className="font-bold" style={{ color }}>{statusText}</span>
              </div>
            </div>
          </Html>
        </>
      )}
    </group>
  );
};

// Conexiones de datos
const DataConnections = ({ positions }) => {
  const linesRef = useRef();

  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.material.opacity = 0.15 + Math.sin(state.clock.elapsedTime) * 0.08;
    }
  });

  const points = useMemo(() => {
    const pts = [];
    positions.forEach((pos, index) => {
      if (index % 2 === 0) {
        pts.push(new THREE.Vector3(0, 0, 0));
        pts.push(new THREE.Vector3(pos.position[0], pos.position[1], pos.position[2]));
      }
    });
    return pts;
  }, [positions]);

  return (
    <lineSegments ref={linesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#00d4ff" transparent opacity={0.2} />
    </lineSegments>
  );
};

// Visualización principal
const CloudVisualization = ({ clients, onClientClick }) => {
  const groupRef = useRef();
  const [isPaused, setIsPaused] = useState(false);

  useFrame(() => {
    if (groupRef.current && !isPaused) {
      groupRef.current.rotation.y += 0.0005;
    }
  });

  const clientPositions = useMemo(() => {
    return clients.map((client, index) => {
      const angle = (index / clients.length) * Math.PI * 2;
      const radius = 3 + Math.random() * 0.5;
      const height = Math.sin(angle * 2) * 0.5;
      
      return {
        ...client,
        position: [
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        ]
      };
    });
  }, [clients]);

  return (
    <group ref={groupRef}>
      <AWSCloudCore isPaused={isPaused} />
      <DataConnections positions={clientPositions} />
      
      {clientPositions.map((client) => (
        <DatabaseBase
          key={client.id}
          client={client}
          position={client.position}
          onClientClick={onClientClick}
          onHoverChange={setIsPaused}
        />
      ))}
    </group>
  );
};

// Componente principal
export const DashboardNew = () => {
  const [clients] = useState(() => generateMockData());
  const [selectedClient, setSelectedClient] = useState(null);

  const metrics = useMemo(() => {
    const totalClients = clients.length;
    const allWorkloads = clients.flatMap(c => c.workloads);
    const totalWorkloads = allWorkloads.length;
    const activeWorkloads = allWorkloads.filter(w => w.status === 'en_progreso').length;
    const completedWorkloads = allWorkloads.filter(w => w.status === 'completadas').length;

    return { totalClients, totalWorkloads, activeWorkloads, completedWorkloads };
  }, [clients]);

  const handleClientClick = (client) => {
    setSelectedClient(client);
  };

  return (
    <div className="w-full mb-12">
      {/* Header con métricas */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg border border-gray-700">
          <div className="text-gray-400 text-sm mb-2">Total Clientes</div>
          <div className="text-3xl font-bold text-gray-100">{metrics.totalClients}</div>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg border border-gray-700">
          <div className="text-gray-400 text-sm mb-2">Total Workloads</div>
          <div className="text-3xl font-bold text-gray-100">{metrics.totalWorkloads}</div>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg border border-gray-700">
          <div className="text-gray-400 text-sm mb-2">Workloads Activas</div>
          <div className="text-3xl font-bold text-orange-400">{metrics.activeWorkloads}</div>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg border border-gray-700">
          <div className="text-gray-400 text-sm mb-2">Completadas</div>
          <div className="text-3xl font-bold text-green-400">{metrics.completedWorkloads}</div>
        </div>
      </div>

      {/* Visualización 3D */}
      <div className="bg-gradient-to-b from-gray-900 via-black to-gray-900 rounded-lg overflow-hidden relative shadow-2xl" style={{ height: '700px' }}>
        <Canvas camera={{ position: [0, 3, 8], fov: 60 }}>
          <color attach="background" args={['#000000']} />
          <fog attach="fog" args={['#000000', 12, 25]} />
          
          <ambientLight intensity={0.3} />
          <directionalLight position={[10, 10, 5]} intensity={0.8} color="#ffffff" />
          <pointLight position={[5, 5, 5]} intensity={0.5} color="#0088ff" />
          <pointLight position={[-5, -5, -5]} intensity={0.3} color="#ff6600" />
          
          <Stars radius={200} depth={150} count={15000} factor={8} saturation={0} fade speed={0.2} />
          
          <CloudVisualization clients={clients} onClientClick={handleClientClick} />
          
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            minDistance={5}
            maxDistance={15}
            autoRotate
            autoRotateSpeed={0.3}
            enableDamping
            dampingFactor={0.05}
          />
        </Canvas>

        {/* Leyenda */}
        <div className="absolute bottom-4 left-4 bg-black/90 backdrop-blur-sm p-4 rounded-lg border border-gray-700">
          <div className="text-gray-300 text-sm font-bold mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            WellPlanned Cloud
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-gray-400">AWS Core</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-2 bg-cyan-400"></div>
              <span className="text-gray-400">Data Flow</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500"></div>
              <span className="text-gray-400">Client Database</span>
            </div>
          </div>
        </div>

        {/* Título narrativo */}
        <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm p-4 rounded-lg border border-orange-500/30 max-w-md">
          <h3 className="text-orange-400 font-bold text-lg mb-2">🦔 Ecosistema WellPlanned</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            En el centro, AWS Cloud conecta y da energía a {metrics.totalClients} bases de datos de clientes, 
            gestionando {metrics.totalWorkloads} workloads en tiempo real. Cada base representa un cliente único 
            con su propia historia y datos.
          </p>
        </div>
      </div>
    </div>
  );
};
