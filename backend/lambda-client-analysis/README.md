# Lambda Client Analysis

Lambda para analizar todas las workloads de un cliente almacenadas en S3.

## Endpoint

```
GET /analysis?id_cliente={idCliente}
```

## Parámetros

- `id_cliente` (query parameter, requerido): ID del cliente a analizar

## Respuesta Exitosa

```json
{
  "id_cliente": "CLI00001",
  "años": ["2025"],
  "resumen_por_año": {
    "2025": {
      "totales": 6,
      "completado": 3,
      "en_progreso": 3,
      "pausado": 0,
      "cancelado": 0,
      "meses": {
        "01": {
          "totales": 3,
          "completado": 1,
          "en_progreso": 2,
          "pausado": 0,
          "cancelado": 0
        },
        "11": {
          "totales": 3,
          "completado": 2,
          "en_progreso": 1,
          "pausado": 0,
          "cancelado": 0
        }
      }
    }
  },
  "generado_en": "2025-11-17T10:30:00Z"
}
```

## Características

- ✅ Lectura paralela de todas las workloads usando `Promise.all`
- ✅ Detección dinámica de años y meses disponibles
- ✅ Manejo robusto de JSON corruptos (los salta sin fallar)
- ✅ Contadores por status: completado, en_progreso, pausado, cancelado
- ✅ Totales del año = suma de todos los meses
- ✅ Cache-Control de 5 minutos
- ✅ Logging estructurado para CloudWatch
- ✅ Respuesta vacía para clientes sin workloads

## Variables de Entorno

- `BUCKET_NAME`: Nombre del bucket S3
- `AWS_REGION`: Región de AWS (default: us-east-2)

## Estructura S3

```
workloads/{idCliente}/{año}/{mes}/{idCarga}.json
```

## Instalación

```bash
cd backend/lambda-client-analysis
npm install
```

## Despliegue

Configurar en AWS Lambda con:
- Runtime: Node.js 18.x o superior
- Timeout: 30 segundos (recomendado)
- Memory: 512 MB (ajustar según volumen)
- Permisos IAM: `s3:ListBucket`, `s3:GetObject`
