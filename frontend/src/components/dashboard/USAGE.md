# Guía de Uso - Dashboard Components

## Importación

### Componente Principal
```javascript
import { GalacticDashboard } from '../components/GalacticDashboard';

// Uso
<GalacticDashboard clientes={clientes} />
```

### Componentes Individuales
```javascript
import { 
  ClientPlanet,
  UniverseView,
  ClientAnalysisPanel,
  SearchBar,
  MetricsPanel,
  ClientInfoPanel
} from '../components/dashboard';
```

### Utilidades
```javascript
import { navigateToClient, resetCamera } from '../components/dashboard';
import { generatePDF } from '../components/dashboard';
```

## Estructura de Props

### GalacticDashboard
```javascript
<GalacticDashboard 
  clientes={[
    {
      id_cuenta: "CLI00001",
      cliente: "Nombre Cliente",
      tipo_proyecto: "SaaS",
      compromiso: "1 año",
      workloads_resumen: {
        status_actual: "en_progreso",
        ultimoWorkloadId: "abc123",
        totales: 10,
        en_progreso: 5,
        completado: 3,
        pausado: 1,
        cancelado: 1,
        meses: ["11", "12"],
        años: ["2025"]
      }
    }
  ]}
/>
```

### ClientPlanet
```javascript
<ClientPlanet
  client={clientObject}
  position={[x, y, z]}
  onClientClick={(client) => {}}
  onHoverChange={(clientId) => {}}
  isSelected={boolean}
  hasSelection={boolean}
/>
```

### ClientAnalysisPanel
```javascript
<ClientAnalysisPanel
  client={clientObject}
  onBack={() => {}}
/>
```

## Funciones Útiles

### Navegación de Cámara
```javascript
// Navegar a un cliente específico
navigateToClient(client, clientPositionsRef, controlsRef, setFocusedClientId);

// Resetear cámara a posición inicial
resetCamera(controlsRef, setFocusedClientId);
```

### Generación de PDF
```javascript
generatePDF(client, workloadDistribution, selectedYear, selectedMonth);
```

## Personalización

### Colores de Estado
Los colores se asignan automáticamente según el estado:
- Verde (#10b981): Más completadas que en progreso
- Amarillo (#f59e0b): Más en progreso que completadas
- Rojo (#ef4444): Sin workloads completados
- Gris (#6b7280): Sin workloads

### Posicionamiento 3D
Los clientes se distribuyen en 5 anillos concéntricos alrededor del núcleo central.
Puedes ajustar esto en `UniverseView.jsx`:
```javascript
const ringCount = 5; // Número de anillos
const baseRadius = 4 + (ringIndex * 2.5); // Radio base
```

### Animaciones
Las animaciones de cámara se pueden ajustar en `cameraUtils.js`:
```javascript
const duration = 1200; // Duración en ms
```

## Eventos

### onClick en Cliente
```javascript
const handleClientClick = (client) => {
  // Se ejecuta al hacer click en un cliente
  // Cambia a la pestaña de análisis
};
```

### onHover en Cliente
```javascript
const handleHoverChange = (clientId) => {
  // Se ejecuta al pasar el mouse sobre un cliente
  // Pausa la rotación automática
};
```

### onSearch
```javascript
const handleSearchSelect = (client) => {
  // Se ejecuta al seleccionar un cliente en la búsqueda
  // Navega la cámara al cliente
};
```

## Notas Importantes

1. **Datos Requeridos**: El componente espera que `clientes` tenga la estructura de la API
2. **Performance**: Optimizado para hasta 100 clientes simultáneos
3. **Responsive**: Se adapta a diferentes tamaños de pantalla
4. **3D Context**: Requiere WebGL habilitado en el navegador
