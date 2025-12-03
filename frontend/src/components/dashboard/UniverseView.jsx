import { useState, useMemo, useRef } from 'react';
import { ClientPlanet } from './ClientPlanet';
import { WellPlannedCore } from './WellPlannedCore';
import { Nebulas } from './Nebulas';
import { DimmableStars } from './DimmableStars';

export const UniverseView = ({ clients, onClientClick, clientPositionsRef, selectedClientId }) => {
  const groupRef = useRef();
  const [isPaused, setIsPaused] = useState(false);

  const clientPositions = useMemo(() => {
    const positions = clients.map((client, index) => {
      // Distribución más cercana y aleatoria alrededor del núcleo
      const angle = Math.random() * Math.PI * 2; // Ángulo completamente aleatorio
      const radius = 2.5 + Math.random() * 4; // Radio entre 2.5 y 6.5 (más cercano)
      const height = (Math.random() - 0.5) * 4; // Altura entre -2 y 2 (más compacto)
      
      return {
        ...client,
        position: [
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        ]
      };
    });
    
    if (clientPositionsRef) {
      clientPositionsRef.current = positions;
    }
    
    return positions;
  }, [clients, clientPositionsRef]);

  const hasSelection = !!selectedClientId;

  const handleHoverChange = (clientId) => {
    setIsPaused(!!clientId);
  };

  return (
    <>
      <DimmableStars isDimmed={hasSelection} />
      <group ref={groupRef}>
        <Nebulas />
        <WellPlannedCore isPaused={isPaused} isDimmed={hasSelection} />
        
        {clientPositions.map((client) => (
          <ClientPlanet
            key={client.id_cuenta}
            client={client}
            position={client.position}
            onClientClick={onClientClick}
            onHoverChange={handleHoverChange}
            isSelected={selectedClientId === client.id_cuenta}
            hasSelection={hasSelection}
          />
        ))}
      </group>
    </>
  );
};
