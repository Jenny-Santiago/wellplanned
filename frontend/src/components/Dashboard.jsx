import { useState, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Html } from '@react-three/drei';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import * as THREE from 'three';

// Datos simulados
const generateMockData = () => {
  const baseNames = [
    'TechCorp', 'Global Industries', 'Asia Pacific', 'Euro Systems', 'South America Tech',
    'Nordic Solutions', 'Middle East Corp', 'Australia Group', 'Canada Systems', 'India Tech Hub',
    'Digital Ventures', 'Cloud Innovations', 'Data Systems', 'Smart Solutions', 'Future Tech',
    'Quantum Labs', 'Cyber Security', 'AI Dynamics', 'Blockchain Corp', 'IoT Solutions',
    'Mobile First', 'Web Services', 'Enterprise Tech', 'Startup Hub', 'Innovation Labs',
    'Tech Giants', 'Software House', 'Dev Studios', 'Code Factory', 'Digital Agency'
  ];

  const suffixes = ['Inc', 'Ltd', 'Corp', 'Group', 'Solutions', 'Systems', 'Technologies', 'Enterprises'];
  
  const clients = Array.from({ length: 100 }, (_, i) => {
    const baseName = baseNames[i % baseNames.length];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const number = i > 29 ? ` ${Math.floor(i / 10)}` : '';
    
    return {
      id: `CLI${String(i + 1).padStart(5, '0')}`,
      name: `${baseName}${number} ${suffix}`,
      lat: (Math.random() * 180) - 90,
      lon: (Math.random() * 360) - 180,
      country: 'Global'
    };
  });

  const statuses = ['completadas', 'en_progreso', 'canceladas', 'en_pausa'];
  const years = [2023, 2024, 2025];
  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

  const clientsWithWorkloads = clients.map(client => {
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
        title: `Workload ${i + 1} - ${status}`,
        createdAt: `${year}-${month}-${Math.floor(Math.random() * 28) + 1}`
      });
    }

    return { ...client, workloads };
  });

  return clientsWithWorkloads;
};

// Partículas espaciales realistas
const SpaceParticles = ({ maxRadius }) => {
  const particlesRef = useRef();
  const particleCount = 500;
  
  const { positions, sizes } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const siz = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * maxRadius * 2;
      const height = (Math.random() - 0.5) * 8;
      
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = height;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
      siz[i] = Math.random() * 0.05 + 0.01;
    }
    return { positions: pos, sizes: siz };
  }, [maxRadius]);

  useFrame(() => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.0001;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={particleCount}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.03}
        color="#ffffff" 
        transparent 
        opacity={0.6} 
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Conexiones de energía realistas
const EnergyConnections = ({ positions }) => {
  const connectionsRef = useRef();

  useFrame((state) => {
    if (connectionsRef.current) {
      connectionsRef.current.material.opacity = 0.15 + Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
    }
  });

  const points = useMemo(() => {
    const pts = [];
    // Conexiones selectivas para clientes cercanos
    positions.forEach((pos, index) => {
      if (pos.distance < 3.5 && index % 4 === 0) {
        pts.push(new THREE.Vector3(0, 0, 0));
        pts.push(new THREE.Vector3(pos.position[0], pos.position[1], pos.position[2]));
      }
    });
    return pts;
  }, [positions]);

  return (
    <lineSegments ref={connectionsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial 
        color="#00d4ff" 
        transparent 
        opacity={0.2}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
};

// Núcleo AWS ultra realista y poderoso
const AWSCore = ({ isPaused }) => {
  const groupRef = useRef();
  const coreRef = useRef();
  const coronaRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current && !isPaused) {
      groupRef.current.rotation.y += 0.002;
    }
    if (coreRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.5 + 0.5;
      coreRef.current.scale.setScalar(1 + pulse * 0.08);
    }
    if (coronaRef.current) {
      coronaRef.current.rotation.z += 0.005;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Corona externa brillante */}
      <mesh ref={coronaRef}>
        <torusGeometry args={[1.2, 0.4, 16, 64]} />
        <meshBasicMaterial
          color="#ff6600"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Aura de energía */}
      <mesh>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshBasicMaterial
          color="#ff9900"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Núcleo central ultra brillante */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.6, 64, 64]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffaa00"
          emissiveIntensity={2}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Capa de plasma */}
      <mesh>
        <sphereGeometry args={[0.8, 64, 64]} />
        <meshStandardMaterial
          color="#ff9900"
          transparent
          opacity={0.4}
          emissive="#ff6600"
          emissiveIntensity={1.5}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Texto AWS */}
      <Text position={[0, 0, 0]} fontSize={0.3} color="#ffffff" anchorX="center" anchorY="middle" fontWeight="bold">
        AWS
      </Text>

      {/* Luces potentes */}
      <pointLight position={[0, 0, 0]} intensity={8} color="#ff9900" distance={8} decay={1.5} />
      <pointLight position={[0, 0, 0]} intensity={4} color="#ffffff" distance={12} decay={2} />
    </group>
  );
};

// Componente de cliente (esfera brillante)
const ClientNode = ({ client, position, onClientClick, onHoverChange }) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();

  const handleHoverStart = () => {
    setHovered(true);
    if (onHoverChange) onHoverChange(true);
  };

  const handleHoverEnd = () => {
    setHovered(false);
    if (onHoverChange) onHoverChange(false);
  };

  const completadas = client.workloads.filter(w => w.status === 'completadas').length;
  const enProgreso = client.workloads.filter(w => w.status === 'en_progreso').length;
  const canceladas = client.workloads.filter(w => w.status === 'canceladas').length;
  const enPausa = client.workloads.filter(w => w.status === 'en_pausa').length;
  const total = client.workloads.length;

  // Determinar color según el estado predominante
  let color = '#10b981'; // Verde por defecto (completadas)
  let statusText = 'Completadas';
  let maxCount = completadas;

  if (enProgreso > maxCount) {
    color = '#f59e0b'; // Amarillo para en progreso
    statusText = 'En Progreso';
    maxCount = enProgreso;
  }
  if (canceladas > maxCount) {
    color = '#ef4444'; // Rojo para canceladas
    statusText = 'Canceladas';
    maxCount = canceladas;
  }
  if (enPausa > maxCount) {
    color = '#3b82f6'; // Azul para en pausa
    statusText = 'En Pausa';
  }

  const size = hovered ? 0.1 : 0.06;

  useFrame((state) => {
    if (meshRef.current && !hovered) {
      meshRef.current.rotation.y += 0.01;
      const pulse = Math.sin(state.clock.elapsedTime * 3 + position[0]) * 0.02;
      meshRef.current.scale.setScalar(1 + pulse);
    }
  });

  return (
    <group position={position}>
      {/* Esfera principal */}
      <mesh
        ref={meshRef}
        onPointerOver={handleHoverStart}
        onPointerOut={handleHoverEnd}
        onClick={() => onClientClick(client)}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 2 : 1}
          metalness={0.8}
          roughness={0.1}
        />
      </mesh>

      {/* Aura externa */}
      <mesh>
        <sphereGeometry args={[size * 1.3, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.15 : 0.08}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Anillo orbital cuando hover */}
      {hovered && (
        <>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[size * 2.5, 0.015, 16, 32]} />
            <meshBasicMaterial color={color} transparent opacity={0.8} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[size * 3, 0.01, 16, 32]} />
            <meshBasicMaterial color={color} transparent opacity={0.4} />
          </mesh>
          <pointLight position={[0, 0, 0]} intensity={4} color={color} distance={2} />
          
          {/* Partículas orbitando el nodo */}
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <torusGeometry args={[size * 2, 0.005, 8, 32]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
          </mesh>
        </>
      )}

      {/* Card de información al hacer hover */}
      {hovered && (
        <Html position={[0, 0.3, 0]} center>
          <div 
            className="bg-gray-900/95 backdrop-blur-md px-4 py-3 rounded-lg border shadow-2xl"
            style={{ 
              pointerEvents: 'none',
              borderColor: color,
              boxShadow: `0 0 20px ${color}40`,
              minWidth: '200px'
            }}
          >
            <div className="text-sm font-bold text-white mb-2" style={{ color }}>
              {client.name}
            </div>
            <div className="text-xs text-gray-400 mb-2">
              {client.id}
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Workloads:</span>
                <span className="text-white font-medium">{total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-400">✓ Completadas:</span>
                <span className="text-white">{completadas}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-400">⟳ En Progreso:</span>
                <span className="text-white">{enProgreso}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-400">✗ Canceladas:</span>
                <span className="text-white">{canceladas}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-400">⏸ En Pausa:</span>
                <span className="text-white">{enPausa}</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-700 text-xs">
              <span className="text-gray-400">Estado predominante: </span>
              <span className="font-medium" style={{ color }}>{statusText}</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

// Componente principal de visualización
const NetworkVisualization = ({ clients, onClientClick }) => {
  const groupRef = useRef();
  const [isPaused, setIsPaused] = useState(false);

  useFrame(() => {
    if (groupRef.current && !isPaused) {
      groupRef.current.rotation.y += 0.0003;
    }
  });

  const clientPositions = useMemo(() => {
    const totalClients = clients.length;
    
    return clients.map((client, index) => {
      // Distribución orgánica en espiral
      const spiralFactor = index / totalClients;
      const angle = spiralFactor * Math.PI * 6 + (Math.random() - 0.5) * 0.5;
      const radius = 2 + spiralFactor * 3.5 + (Math.random() - 0.5) * 0.8;
      
      // Altura orgánica para profundidad
      const height = Math.sin(angle * 2) * 1.2 + (Math.random() - 0.5) * 0.8;
      
      return {
        ...client,
        position: [
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        ],
        distance: radius
      };
    });
  }, [clients]);

  // Calcular el radio máximo para las partículas
  const maxRadius = useMemo(() => {
    const clientsPerRing = 20;
    const numRings = Math.ceil(clients.length / clientsPerRing);
    return 2.5 + (numRings * 0.5);
  }, [clients.length]);

  return (
    <group ref={groupRef}>
      <SpaceParticles maxRadius={maxRadius} />
      <AWSCore isPaused={isPaused} />
      <EnergyConnections positions={clientPositions} />

      {clientPositions.map((client) => (
        <ClientNode
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

// Componente principal del Dashboard
export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [clients] = useState(() => generateMockData());
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);

  // Calcular métricas globales
  const metrics = useMemo(() => {
    const totalClients = clients.length;
    const allWorkloads = clients.flatMap(c => c.workloads);
    const totalWorkloads = allWorkloads.length;
    const activeWorkloads = allWorkloads.filter(w => w.status === 'en_progreso').length;

    return { totalClients, totalWorkloads, activeWorkloads };
  }, [clients]);

  // Calcular distribución de workloads
  const getWorkloadDistribution = useMemo(() => {
    let workloads = clients.flatMap(c => c.workloads);

    if (selectedClient) {
      workloads = selectedClient.workloads;
      if (selectedYear) {
        workloads = workloads.filter(w => w.year === parseInt(selectedYear));
        if (selectedMonth) {
          workloads = workloads.filter(w => w.month === selectedMonth);
        }
      }
    }

    const distribution = {
      completadas: workloads.filter(w => w.status === 'completadas').length,
      en_progreso: workloads.filter(w => w.status === 'en_progreso').length,
      canceladas: workloads.filter(w => w.status === 'canceladas').length,
      en_pausa: workloads.filter(w => w.status === 'en_pausa').length,
    };

    return [
      { name: 'Completadas', value: distribution.completadas, color: '#10b981' },
      { name: 'En Progreso', value: distribution.en_progreso, color: '#f59e0b' },
      { name: 'Canceladas', value: distribution.canceladas, color: '#ef4444' },
      { name: 'En Pausa', value: distribution.en_pausa, color: '#6b7280' },
    ].filter(item => item.value > 0);
  }, [clients, selectedClient, selectedYear, selectedMonth]);

  const handleGlobeClientClick = (client) => {
    setActiveTab('analysis');
    // Pequeño delay para que la pestaña se renderice primero
    setTimeout(() => {
      setSelectedClient(client);
    }, 50);
  };

  const availableYears = useMemo(() => {
    if (!selectedClient) return [];
    const years = [...new Set(selectedClient.workloads.map(w => w.year))];
    return years.sort((a, b) => b - a);
  }, [selectedClient]);

  const availableMonths = useMemo(() => {
    if (!selectedClient || !selectedYear) return [];
    const months = [...new Set(
      selectedClient.workloads
        .filter(w => w.year === parseInt(selectedYear))
        .map(w => w.month)
    )];
    return months.sort();
  }, [selectedClient, selectedYear]);

  const topClients = useMemo(() => {
    return [...clients]
      .sort((a, b) => b.workloads.length - a.workloads.length)
      .slice(0, 5);
  }, [clients]);

  return (
    <div className="w-full mb-12">
      {/* Header con métricas */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg border border-gray-700">
          <div className="text-gray-400 text-sm mb-2">Total de Clientes</div>
          <div className="text-3xl font-bold text-gray-100">{metrics.totalClients}</div>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg border border-gray-700">
          <div className="text-gray-400 text-sm mb-2">Total de Workloads</div>
          <div className="text-3xl font-bold text-gray-100">{metrics.totalWorkloads}</div>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg border border-gray-700">
          <div className="text-gray-400 text-sm mb-2">Workloads Activas</div>
          <div className="text-3xl font-bold text-orange-400">{metrics.activeWorkloads}</div>
        </div>
      </div>

      {/* Pestañas */}
      <div className="flex gap-2 mb-6 border-b border-gray-700">
        <button
          onClick={() => {
            setActiveTab('general');
            setSelectedClient(null);
            setSelectedYear(null);
            setSelectedMonth(null);
          }}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === 'general'
              ? 'text-gray-100 border-b-2 border-gray-400'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          INFRAESTRUCTURA
        </button>
        {selectedClient && (
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'analysis'
                ? 'text-gray-100 border-b-2 border-gray-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            ANÁLISIS
          </button>
        )}
      </div>

      {/* Contenido de pestañas */}
      {activeTab === 'general' && (
        <div className="relative">
          {/* Visualización 3D */}
          <div className="bg-black rounded-lg overflow-hidden relative shadow-2xl" style={{ height: '700px' }}>
            <Canvas camera={{ 
              position: [0, 3, 9], 
              fov: 60
            }}>
              {/* Fondo negro profundo del espacio */}
              <color attach="background" args={['#000000']} />
              <fog attach="fog" args={['#000000', 18, 40]} />
              
              {/* Iluminación realista */}
              <ambientLight intensity={0.1} />
              
              {/* Luz direccional como luz estelar */}
              <directionalLight position={[10, 10, 5]} intensity={0.5} color="#ffffff" />
              
              {/* Luces de relleno sutiles */}
              <pointLight position={[5, 5, 5]} intensity={0.3} color="#0088ff" distance={20} />
              <pointLight position={[-5, -5, -5]} intensity={0.2} color="#ff6600" distance={20} />
              
              {/* Estrellas de fondo realistas */}
              <Stars 
                radius={250} 
                depth={200} 
                count={20000} 
                factor={10} 
                saturation={0} 
                fade 
                speed={0.1}
              />
              <NetworkVisualization clients={clients} onClientClick={handleGlobeClientClick} />
              <OrbitControls
                enableZoom={true}
                enablePan={true}
                minDistance={5}
                maxDistance={18}
                autoRotate
                autoRotateSpeed={0.2}
                enableDamping
                dampingFactor={0.03}
              />
            </Canvas>

            {/* Leyenda ultra minimalista */}
            <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm p-3 rounded border border-gray-800">
              <div className="text-gray-300 text-xs font-medium mb-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
                WellPlanned Galaxy
              </div>
              <div className="space-y-1.5 text-[10px] text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                  <span>AWS Core</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                  <span>Energy Flow</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analysis' && selectedClient && (
        <div className="grid grid-cols-5 gap-4 animate-fadeIn">
          {/* Columna izquierda - Filtros y gráfica */}
          <div className="col-span-3 space-y-2">
            {/* Filtros */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-3 rounded-lg border border-gray-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Año</label>
                  <select
                    value={selectedYear || ''}
                    onChange={(e) => {
                      setSelectedYear(e.target.value || null);
                      setSelectedMonth(null);
                    }}
                    className="w-full bg-gray-700 text-gray-100 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-gray-500"
                  >
                    <option value="">Todos los años</option>
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Mes</label>
                  <select
                    value={selectedMonth || ''}
                    onChange={(e) => setSelectedMonth(e.target.value || null)}
                    disabled={!selectedYear}
                    className="w-full bg-gray-700 text-gray-100 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-gray-500 disabled:opacity-50"
                  >
                    <option value="">Todos los meses</option>
                    {availableMonths.map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Gráfica de pastel mejorada */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-3 rounded-lg border border-gray-700">
              <div className="text-white text-xs font-medium mb-2">
                {!selectedYear && `Workloads de ${selectedClient.name}`}
                {selectedYear && !selectedMonth && `${selectedClient.name} - ${selectedYear}`}
                {selectedYear && selectedMonth && `${selectedClient.name} - ${selectedYear}/${selectedMonth}`}
              </div>
              <div className="flex items-center justify-center gap-4">
                <ResponsiveContainer width="45%" height={160}>
                  <PieChart>
                    <defs>
                      <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.3"/>
                      </filter>
                    </defs>
                    <Pie
                      data={getWorkloadDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={2}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={800}
                      label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        
                        return (
                          <text 
                            x={x} 
                            y={y} 
                            fill="white" 
                            textAnchor={x > cx ? 'start' : 'end'} 
                            dominantBaseline="central"
                            style={{
                              fontSize: '12px',
                              fontWeight: 'bold',
                              textShadow: '0 2px 8px rgba(0,0,0,0.9)',
                              filter: 'drop-shadow(0 0 6px rgba(0,0,0,1))'
                            }}
                          >
                            {`${(percent * 100).toFixed(0)}%`}
                          </text>
                        );
                      }}
                      labelLine={false}
                      style={{ filter: 'url(#shadow)' }}
                    >
                      {getWorkloadDistribution.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          stroke={entry.color}
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0];
                          const total = getWorkloadDistribution.reduce((sum, item) => sum + item.value, 0);
                          const percentage = ((data.value / total) * 100).toFixed(1);
                          return (
                            <div 
                              className="px-5 py-4 rounded-xl border-4 shadow-2xl"
                              style={{ 
                                backgroundColor: '#000000',
                                borderColor: data.payload.color,
                                boxShadow: `0 0 30px ${data.payload.color}`,
                                minWidth: '180px'
                              }}
                            >
                              <div 
                                className="text-lg font-black mb-2 uppercase tracking-wider"
                                style={{ color: data.payload.color }}
                              >
                                {data.name}
                              </div>
                              <div className="flex items-baseline gap-2 mb-2">
                                <div className="text-5xl font-black text-white">
                                  {data.value}
                                </div>
                                <div className="text-base font-bold text-white">
                                  workloads
                                </div>
                              </div>
                              <div className="text-base font-bold text-white border-t-2 pt-2" style={{ borderColor: data.payload.color }}>
                                {percentage}% del total
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Leyenda vertical a la derecha */}
                <div className="flex flex-col gap-3">
                  {getWorkloadDistribution.map((entry, index) => (
                    <div key={`legend-${index}`} className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <div className="flex flex-col">
                        <span className="text-white font-medium text-sm">
                          {entry.name}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {entry.value} workloads
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha - Detalles */}
          <div className="col-span-2">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg border border-gray-700 sticky top-4">
              {!selectedClient ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-gray-300 text-lg font-medium mb-4">Resumen Global</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Clientes:</span>
                        <span className="text-gray-100 font-medium">{metrics.totalClients}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Workloads:</span>
                        <span className="text-gray-100 font-medium">{metrics.totalWorkloads}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-4">
                    <h4 className="text-gray-300 text-sm font-medium mb-3">Top 5 Clientes</h4>
                    <div className="space-y-2">
                      {topClients.map((client, idx) => (
                        <div key={client.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">{idx + 1}. {client.name}</span>
                          <span className="text-gray-300 font-medium">{client.workloads.length}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button className="w-full bg-gray-700 hover:bg-gray-600 text-gray-100 py-2 px-4 rounded transition-colors">
                    Generar Reporte Global
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-gray-300 text-lg font-medium mb-1">{selectedClient.name}</h3>
                    <p className="text-gray-500 text-sm">{selectedClient.id}</p>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Workloads:</span>
                      <span className="text-gray-100 font-medium">{selectedClient.workloads.length}</span>
                    </div>
                  </div>

                  {!selectedYear && (
                    <div className="border-t border-gray-700 pt-4">
                      <h4 className="text-gray-300 text-sm font-medium mb-3">Desglose por Año</h4>
                      <div className="space-y-2">
                        {availableYears.map(year => {
                          const count = selectedClient.workloads.filter(w => w.year === year).length;
                          return (
                            <div key={year} className="flex items-center justify-between text-sm">
                              <span className="text-gray-400">{year}</span>
                              <span className="text-gray-300 font-medium">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedYear && !selectedMonth && (
                    <div className="border-t border-gray-700 pt-4">
                      <h4 className="text-gray-300 text-sm font-medium mb-3">Breakdown Mensual {selectedYear}</h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {availableMonths.map(month => {
                          const count = selectedClient.workloads.filter(
                            w => w.year === parseInt(selectedYear) && w.month === month
                          ).length;
                          return (
                            <div key={month} className="flex items-center justify-between text-sm">
                              <span className="text-gray-400">Mes {month}</span>
                              <span className="text-gray-300 font-medium">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedMonth && (
                    <div className="border-t border-gray-700 pt-4">
                      <h4 className="text-gray-300 text-sm font-medium mb-3">Workloads del Mes</h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {selectedClient.workloads
                          .filter(w => w.year === parseInt(selectedYear) && w.month === selectedMonth)
                          .map(workload => {
                            const statusColors = {
                              completadas: 'bg-green-500',
                              en_progreso: 'bg-orange-500',
                              canceladas: 'bg-red-500',
                              en_pausa: 'bg-gray-500'
                            };
                            return (
                              <div key={workload.id} className="flex items-center gap-2 text-sm">
                                <div className={`w-2 h-2 rounded-full ${statusColors[workload.status]}`}></div>
                                <span className="text-gray-400 flex-1">{workload.title}</span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {selectedYear && (
                      <button className="w-full bg-gray-700 hover:bg-gray-600 text-gray-100 py-2 px-4 rounded transition-colors">
                        Reporte Anual {selectedYear}
                      </button>
                    )}
                    {selectedMonth && (
                      <button className="w-full bg-gray-700 hover:bg-gray-600 text-gray-100 py-2 px-4 rounded transition-colors">
                        Reporte Mensual {selectedYear}/{selectedMonth}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
