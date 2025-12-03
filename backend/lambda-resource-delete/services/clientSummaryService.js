const s3Service = require('./s3Service');
const logger = require('../utils/logger');

/**
 * Recalcula completamente el workloads_resumen de un cliente
 */
async function recalcularResumenCliente(clienteId) {
    logger.info('Recalculando resumen de cliente', { clienteId });

    try {
        const workloadsPrefix = `workloads/${clienteId}/`;
        const workloadsData = await s3Service.listAllObjects(workloadsPrefix);

        if (!workloadsData || workloadsData.length === 0) {
            logger.info('Cliente sin workloads', { clienteId });
            return {
                status_actual: "sin_workloads",
                ultimoWorkloadId: null,
                totales: 0,
                en_progreso: 0,
                completado: 0,
                pausado: 0,
                cancelado: 0,
                meses: [],
                años: []
            };
        }

        logger.info('Workloads encontrados', { 
            clienteId, 
            cantidad: workloadsData.length 
        });

        // Leer todos los workloads
        const workloadsPromises = workloadsData.map(async (item) => {
            try {
                logger.info('Leyendo workload', { key: item.Key });
                const content = await s3Service.getObject(item.Key);
                const workload = JSON.parse(content);
                logger.info('Workload leído correctamente', { 
                    key: item.Key, 
                    id: workload.id 
                });
                return workload;
            } catch (error) {
                logger.error('Error leyendo workload individual', { 
                    key: item.Key, 
                    error: error.message,
                    stack: error.stack
                });
                return null;
            }
        });

        const workloads = await Promise.all(workloadsPromises);
        const validWorkloads = workloads.filter(w => w !== null);

        logger.info('Workloads válidos procesados', { 
            clienteId, 
            total: workloadsData.length,
            validos: validWorkloads.length 
        });

        if (validWorkloads.length === 0) {
            logger.warn('Ningún workload pudo ser leído correctamente', { clienteId });
            return {
                status_actual: "sin_workloads",
                ultimoWorkloadId: null,
                totales: 0,
                en_progreso: 0,
                completado: 0,
                pausado: 0,
                cancelado: 0,
                meses: [],
                años: []
            };
        }

        // Calcular contadores por estado
        const contadores = {
            totales: validWorkloads.length,
            en_progreso: 0,
            completado: 0,
            pausado: 0,
            cancelado: 0
        };

        validWorkloads.forEach(workload => {
            const status = workload.status || 'en_progreso';
            if (contadores.hasOwnProperty(status)) {
                contadores[status]++;
            }
        });

        // Extraer meses y años únicos
        const mesesSet = new Set();
        const añosSet = new Set();

        validWorkloads.forEach(workload => {
            if (workload.month) {
                mesesSet.add(workload.month.toString().padStart(2, '0'));
            }
            if (workload.year) {
                añosSet.add(workload.year.toString());
            }
        });

        const meses = Array.from(mesesSet).sort();
        const años = Array.from(añosSet).sort();

        // Determinar el workload más reciente por fecha_creacion
        const ultimoWorkload = validWorkloads.reduce((ultimo, actual) => {
            const fechaUltimo = new Date(ultimo.fecha_creacion);
            const fechaActual = new Date(actual.fecha_creacion);
            
            return fechaActual > fechaUltimo ? actual : ultimo;
        });

        logger.info('Resumen recalculado exitosamente', { 
            clienteId, 
            totales: contadores.totales,
            ultimoWorkloadId: ultimoWorkload.id,
            status_actual: ultimoWorkload.status,
            fecha_ultimo_workload: ultimoWorkload.fecha_creacion
        });

        return {
            status_actual: ultimoWorkload.status || "en_progreso",
            ultimoWorkloadId: ultimoWorkload.id,
            ...contadores,
            meses,
            años
        };

    } catch (error) {
        logger.error('Error en recalcularResumenCliente', {
            clienteId,
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
}

/**
 * Actualiza el archivo del cliente en S3 con el nuevo resumen
 */
async function actualizarResumenEnCliente(clienteId, nuevoResumen) {
    try {
        const clienteKey = `clients/${clienteId}.json`;
        
        logger.info('Obteniendo cliente para actualizar', { clienteId, key: clienteKey });
        const clienteData = await s3Service.getObject(clienteKey);
        const cliente = JSON.parse(clienteData);

        logger.info('Cliente obtenido, actualizando resumen', { clienteId });
        cliente.workloads_resumen = nuevoResumen;

        await s3Service.putObject(clienteKey, JSON.stringify(cliente, null, 2));
        
        logger.info('Resumen de cliente actualizado en S3', { 
            clienteId,
            status_actual: nuevoResumen.status_actual,
            totales: nuevoResumen.totales
        });

        return cliente;

    } catch (error) {
        logger.error('Error en actualizarResumenEnCliente', {
            clienteId,
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
}

module.exports = {
    recalcularResumenCliente,
    actualizarResumenEnCliente
};