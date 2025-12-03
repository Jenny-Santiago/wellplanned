# Lambda Workload Report

Lambda para generar reportes completos de workloads de un cliente específico.

## Endpoint

```
GET /report?id_cliente={idCliente}&año={año}&mes={mes}&tipoReporte={tipo}
```

## Parámetros

- `id_cliente` (requerido): ID del cliente
- `año` (requerido): Año del reporte
- `mes` (opcional): Mes del reporte (requerido si tipoReporte es "mensual")
- `tipoReporte` (opcional): Tipo de reporte - "anual" o "mensual" (default: "anual")

## Ejemplos de Uso

### Reporte Anual
```
GET /report?id_cliente=CLI00001&año=2025&tipoReporte=anual
```

### Reporte Mensual
```
GET /report?id_cliente=CLI00001&año=2025&mes=11&tipoReporte=mensual
```

## Respuesta Exitosa - Reporte Anual

```json
{
  "success": true,
  "message": "Reporte generado exitosamente",
  "data": {
    "cliente": "CLI00001",
    "año": "2025",
    "tipoReporte": "anual",
    "generado_en": "2025-11-19T15:30:00.000Z",
    "resumen": {
      "totales": 12,
      "completado": 5,
      "en_progreso": 4,
      "pausado": 1,
      "cancelado": 2
    },
    "workloads": [
      {
        "id": "6afb43a0",
        "id_cliente": "CLI00001",
        "fecha_inicio": "16-11-2025",
        "fecha_fin": "16-12-2025",
        "sdm": "Carlos Mendoza",
        "status": "en_progreso",
        "responsable": "jennifer12082003@gmail.com",
        "notificacion": "enviada",
        "creado_en": "2025-11-17T00:54:24.936Z"
      }
    ],
    "detalles": {
      "responsables": [
        { "nombre": "jennifer12082003@gmail.com", "cantidad": 8 },
        { "nombre": "otro@email.com", "cantidad": 4 }
      ],
      "sdms": [
        { "nombre": "Carlos Mendoza", "cantidad": 7 },
        { "nombre": "Ana García", "cantidad": 5 }
      ],
      "notificaciones": [
        { "estado": "enviada", "cantidad": 10 },
        { "estado": "pendiente", "cantidad": 2 }
      ],
      "rango_fechas": {
        "inicio": "01-01-2025",
        "fin": "31-12-2025"
      }
    }
  }
}
```

## Respuesta Exitosa - Reporte Mensual

```json
{
  "success": true,
  "message": "Reporte generado exitosamente",
  "data": {
    "cliente": "CLI00001",
    "año": "2025",
    "mes": "11",
    "tipoReporte": "mensual",
    "generado_en": "2025-11-19T15:30:00.000Z",
    "resumen": {
      "totales": 3,
      "completado": 1,
      "en_progreso": 2,
      "pausado": 0,
      "cancelado": 0
    },
    "workloads": [...],
    "detalles": {
      "responsables": [
        { "nombre": "jennifer12082003@gmail.com", "cantidad": 3 }
      ],
      "sdms": [
        { "nombre": "Carlos Mendoza", "cantidad": 3 }
      ],
      "notificaciones": [
        { "estado": "enviada", "cantidad": 3 }
      ],
      "rango_fechas": {
        "inicio": "16-11-2025",
        "fin": "30-11-2025"
      }
    }
  }
}
```

## Características

- ✅ Reportes anuales (todas las cargas del año)
- ✅ Reportes mensuales (cargas de un mes específico)
- ✅ Lectura paralela con `Promise.all`
- ✅ Manejo robusto de JSON corruptos
- ✅ Resumen con contadores por status
- ✅ Detalles completos de cada workload
- ✅ Estadísticas de responsables y SDMs
- ✅ Análisis de notificaciones
- ✅ Rango de fechas del periodo
- ✅ Timestamp de generación del reporte
- ✅ Logging estructurado para CloudWatch
- ✅ Respuesta vacía si no hay workloads

## Variables de Entorno

- `BUCKET_NAME`: Nombre del bucket S3
- `AWS_REGION`: Región de AWS (default: us-east-2)

## Estructura S3

```
workloads/{idCliente}/{año}/{mes}/{idCarga}.json
```

## Instalación

```bash
cd backend/lambda-workload-report
npm install
```

## Despliegue

Configurar en AWS Lambda con:
- Runtime: Node.js 18.x o superior
- Timeout: 30 segundos (recomendado)
- Memory: 512 MB (ajustar según volumen)
- Permisos IAM: `s3:ListBucket`, `s3:GetObject`
