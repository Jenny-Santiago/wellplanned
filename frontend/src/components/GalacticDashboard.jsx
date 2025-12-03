import { useState, useMemo, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { UniverseView } from './dashboard/UniverseView';
import { ClientAnalysisPanel } from './dashboard/ClientAnalysisPanel';
import { SearchBar } from './dashboard/SearchBar';
import { MetricsPanel } from './dashboard/MetricsPanel';
import { ClientInfoPanel } from './dashboard/ClientInfoPanel';
import { SpinnerDashboard } from './dashboard/SpinnerDashboard';
import { WellPlannedCore } from './dashboard/WellPlannedCore';
import { DimmableStars } from './dashboard/DimmableStars';
import { Nebulas } from './dashboard/Nebulas';
import { navigateToClient, resetCamera } from './dashboard/cameraUtils';

export const GalacticDashboard = ({ clientes = [], isLoading = false }) => {
  const [activeTab, setActiveTab] = useState('universe');
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedClientId, setFocusedClientId] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const controlsRef = useRef();
  const clientPositionsRef = useRef([]);

  const metrics = useMemo(() => {
    const totalClients = clientes.length;
    const totalWorkloads = clientes.reduce((sum, c) => sum + (c.workloads_resumen?.totales || 0), 0);

    return { totalClients, totalWorkloads };
  }, [clientes]);

  const filteredClients = useMemo(() => {
    if (!searchTerm) return [];
    return clientes.filter(client => 
      client.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.id_cuenta.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 8);
  }, [clientes, searchTerm]);

  const focusedClient = useMemo(() => {
    if (!focusedClientId) return null;
    return clientes.find(c => c.id_cuenta === focusedClientId);
  }, [focusedClientId, clientes]);

  const handleClientClick = (client) => {
    setSelectedClient(client);
    setActiveTab('analysis');
  };

  const handleNavigateToClient = (client) => {
    navigateToClient(client, clientPositionsRef, controlsRef, setFocusedClientId);
  };

  const handleResetCamera = () => {
    resetCamera(controlsRef, setFocusedClientId);
  };

  const handleSearchSelect = (client) => {
    setSearchTerm('');
    setShowSuggestions(false);
    handleNavigateToClient(client);
  };

  const handleBackToUniverse = () => {
    setActiveTab('universe');
    setSelectedClient(null);
    setFocusedClientId(null);
    setSearchTerm('');
    setShowSuggestions(false);
    handleResetCamera();
  };

  // Marcar como listo cuando termine de cargar (ya sea con clientes o sin ellos)
  useEffect(() => {
    if (!isLoading) {
      // La API ya respondió (con o sin clientes)
      const timer = setTimeout(() => {
        setIsReady(true);
      }, clientes.length > 0 ? 1500 : 500); // Más rápido si no hay clientes
      return () => clearTimeout(timer);
    }
  }, [isLoading, clientes.length]);

  return (
    <div className="w-full max-w-full xl:max-w-7xl mx-auto mb-12">
      {/* Pestañas */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => {
            setActiveTab('universe');
            setSelectedClient(null);
            setFocusedClientId(null);
            handleResetCamera();
          }}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === 'universe'
              ? 'text-purple-300 border-b-2 border-purple-400'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          UNIVERSO
        </button>
        {selectedClient && (
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'analysis'
                ? 'text-purple-300 border-b-2 border-purple-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            📊 ANÁLISIS
          </button>
        )}
      </div>

      {/* Contenido */}
      {activeTab === 'universe' ? (
        <div className="rounded-lg overflow-hidden relative h-[400px] md:h-[450px] lg:h-[500px] xl:h-[550px]">
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            showSuggestions={showSuggestions}
            setShowSuggestions={setShowSuggestions}
            filteredClients={filteredClients}
            onSearchSelect={handleSearchSelect}
            onResetCamera={handleResetCamera}
          />

          <div className="bg-black h-full relative">
            {/* Canvas 3D - siempre montado pero oculto hasta que esté listo */}
            <div className={`w-full h-full ${!isReady ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500 relative`}>
              {/* Canvas 3D - siempre se muestra (con o sin clientes) */}
              <Canvas 
                camera={{ position: [0, 2, 5], fov: 65 }}
                style={{ cursor: clientes.length > 0 ? 'pointer' : 'default' }}
              >
                <color attach="background" args={['#000000']} />
                <fog attach="fog" args={['#000000', 15, 30]} />
                
                {/* Overlay oscuro 3D cuando hay cliente seleccionado */}
                {focusedClientId && (
                  <mesh position={[0, 0, -1]} scale={[50, 50, 1]}>
                    <planeGeometry />
                    <meshBasicMaterial color="#000000" transparent opacity={0.4} depthTest={false} />
                  </mesh>
                )}
                
                <ambientLight intensity={0.2} />
                <directionalLight position={[10, 10, 5]} intensity={0.5} color="#ffffff" />
                <pointLight position={[5, 5, 5]} intensity={0.4} color="#8b5cf6" />
                <pointLight position={[-5, -5, -5]} intensity={0.3} color="#3b82f6" />
                
                {/* Elementos del universo - siempre visibles */}
                <DimmableStars isDimmed={false} />
                <Nebulas />
                <WellPlannedCore isPaused={false} isDimmed={false} />
                
                {/* Clientes - solo si hay datos */}
                {clientes.length > 0 && (
                  <UniverseView 
                    clients={clientes} 
                    onClientClick={handleClientClick}
                    clientPositionsRef={clientPositionsRef}
                    selectedClientId={focusedClientId}
                  />
                )}
                
                <OrbitControls
                  ref={controlsRef}
                  enableZoom={true}
                  enablePan={true}
                  minDistance={2}
                  maxDistance={35}
                  autoRotate
                  autoRotateSpeed={0.2}
                  enableDamping
                  dampingFactor={0.05}
                />
              </Canvas>

              {/* Métricas o mensaje según si hay clientes */}
              {clientes.length > 0 ? (
                <>
                  {!focusedClientId && <MetricsPanel metrics={metrics} />}
                  {focusedClientId && <ClientInfoPanel client={focusedClient} />}
                </>
              ) : (
                // Mensaje destacado en esquina superior derecha cuando no hay clientes
                <div className="absolute top-28 right-6 pointer-events-none">
                  <div className="text-right">
                    <p 
                      className="text-purple-300 text-sm font-semibold mb-1" 
                      style={{ 
                        textShadow: '0 0 20px rgba(168, 85, 247, 0.8), 0 2px 10px rgba(0,0,0,0.9)' 
                      }}
                    >
                      El universo está vacío
                    </p>
                    <p 
                      className="text-gray-300 text-xs" 
                      style={{ 
                        textShadow: '0 0 15px rgba(168, 85, 247, 0.5), 0 2px 8px rgba(0,0,0,0.9)' 
                      }}
                    >
                      Agrega clientes para visualizarlos
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Spinner - se muestra encima hasta que el Canvas esté listo */}
            {!isReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-black z-50">
                <div className="text-center">
                  <SpinnerDashboard />
                  <p className="text-white mt-4 text-sm font-normal">Cargando clientes...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-b from-gray-900 via-black to-gray-900 rounded-lg overflow-hidden h-[400px] md:h-[450px] lg:h-[500px] xl:h-[550px]">
          {selectedClient && (
            <ClientAnalysisPanel client={selectedClient} onBack={handleBackToUniverse} />
          )}
        </div>
      )}
    </div>
  );
};
