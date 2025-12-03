# Dashboard Components

Esta carpeta contiene todos los componentes del GalacticDashboard, organizados de manera modular.

## Estructura

### Componentes 3D
- **ClientPlanet.jsx** - Representa cada cliente como una esfera en el espacio 3D
- **WellPlannedCore.jsx** - Núcleo central del universo (logo AWS)
- **DimmableStars.jsx** - Estrellas de fondo con opacidad controlada
- **Nebulas.jsx** - Nebulosas decorativas de fondo
- **UniverseView.jsx** - Vista principal que contiene todos los elementos 3D

### Componentes UI
- **SearchBar.jsx** - Barra de búsqueda con sugerencias
- **MetricsPanel.jsx** - Panel de métricas generales (clientes y workloads)
- **ClientInfoPanel.jsx** - Panel de información del cliente enfocado
- **ClientAnalysisPanel.jsx** - Panel de análisis detallado del cliente

### Utilidades
- **cameraUtils.js** - Funciones para navegación de cámara
- **pdfGenerator.js** - Generador de reportes PDF

### Índice
- **index.js** - Exportaciones centralizadas

## Flujo de Datos

Los datos vienen de la API a través del hook `useClients` y se pasan al componente principal:

```
MonitoringPage → GalacticDashboard → UniverseView → ClientPlanet
                                   → ClientAnalysisPanel
```

## Estructura de Datos

Los clientes tienen la siguiente estructura:
```javascript
{
  id_cuenta: "CLI00001",
  cliente: "Nombre del Cliente",
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
```
