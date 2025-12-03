const { listObjects, getObject } = require('./s3Service');
const logger = require('../utils/logger');

// Genera un reporte de workloads según el tipo
exports.generateReport = async (idCliente, año, mes, tipoReporte) => {
    let prefix;
    
    if (tipoReporte === 'mensual') {
        // Reporte mensual: workloads/{idCliente}/{año}/{mes}/
        prefix = `workloads/${idCliente}/${año}/${mes}/`;
    } else {
        // Reporte anual: workloads/{idCliente}/{año}/
        prefix = `workloads/${idCliente}/${año}/`;
    }

    logger.info('Generando reporte', { idCliente, año, mes, tipoReporte, prefix });

    // Listar todos los objetos
    const objects = await listObjects(prefix);
    
    // Filtrar solo archivos JSON
    const jsonFiles = objects.filter(obj => obj.Key.endsWith('.json'));

    if (jsonFiles.length === 0) {
        logger.info('No se encontraron workloads', { idCliente, año, mes });
        return buildEmptyReport(idCliente, año, mes, tipoReporte);
    }

    // Leer todas las workloads en paralelo
    const workloads = await readAllWorkloads(jsonFiles);

    // Calcular contadores
    const contadores = calculateCounters(workloads);

    // Construir reporte
    const reporte = {
        cliente: idCliente,
        año: año,
        tipoReporte: tipoReporte,
        workloads: workloads,
        ...contadores
    };

    // Agregar mes si es reporte mensual
    if (tipoReporte === 'mensual') {
        reporte.mes = mes;
    }

    return reporte;
};

// Lee todas las workloads en paralelo
const readAllWorkloads = async (files) => {
    const promises = files.map(async (file) => {
        try {
            const workload = await getObject(file.Key);
            return workload;
        } catch (error) {
            logger.warn('JSON corrupto o no legible, saltando', { key: file.Key, error: error.message });
            return null;
        }
    });

    const results = await Promise.all(promises);
    return results.filter(w => w !== null);
};

// Calcula los contadores por status
const calculateCounters = (workloads) => {
    const statusValidos = ['completado', 'en_progreso', 'pausado', 'cancelado'];
    
    const contadores = {
        totales: workloads.length,
        completado: 0,
        en_progreso: 0,
        pausado: 0,
        cancelado: 0
    };

    workloads.forEach(workload => {
        const status = statusValidos.includes(workload.status) 
            ? workload.status 
            : 'en_progreso';
        
        if (contadores[status] !== undefined) {
            contadores[status]++;
        }
    });

    return contadores;
};

// Construye un reporte vacío
const buildEmptyReport = (idCliente, año, mes, tipoReporte) => {
    const reporte = {
        cliente: idCliente,
        año: año,
        tipoReporte: tipoReporte,
        workloads: [],
        totales: 0,
        completado: 0,
        en_progreso: 0,
        pausado: 0,
        cancelado: 0
    };

    if (tipoReporte === 'mensual') {
        reporte.mes = mes;
    }

    return reporte;
};
