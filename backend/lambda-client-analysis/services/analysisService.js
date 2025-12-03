const { listObjects, getObject } = require('./s3Service');
const logger = require('../utils/logger');

// Analiza todas las workloads de un cliente
exports.analyzeClientWorkloads = async (idCliente) => {
    const prefix = `workloads/${idCliente}/`;
    
    logger.info('Iniciando análisis', { idCliente, prefix });

    // Listar todos los objetos del cliente
    const objects = await listObjects(prefix);
    
    // Filtrar solo archivos JSON (no carpetas)
    const jsonFiles = objects.filter(obj => obj.Key.endsWith('.json'));

    if (jsonFiles.length === 0) {
        logger.info('Cliente sin workloads', { idCliente });
        return {
            id_cliente: idCliente,
            años: [],
            resumen_por_año: {},
            generado_en: new Date().toISOString()
        };
    }

    // Extraer estructura de años y meses
    const estructura = extractStructure(jsonFiles, prefix);
    
    // Leer todas las cargas en paralelo
    const workloads = await readAllWorkloads(jsonFiles, prefix);

    // Calcular resumen
    const resumen = calculateSummary(workloads, estructura);

    return {
        id_cliente: idCliente,
        años: estructura.años,
        resumen_por_año: resumen,
        generado_en: new Date().toISOString()
    };
};

// Extrae la estructura de años y meses de las keys
const extractStructure = (files, prefix) => {
    const añosSet = new Set();
    const mesesPorAño = {};

    files.forEach(file => {
        // workloads/{idCliente}/{año}/{mes}/{idCarga}.json
        const parts = file.Key.replace(prefix, '').split('/');
        if (parts.length >= 3) {
            const año = parts[0];
            const mes = parts[1];
            
            añosSet.add(año);
            
            if (!mesesPorAño[año]) {
                mesesPorAño[año] = new Set();
            }
            mesesPorAño[año].add(mes);
        }
    });

    const años = Array.from(añosSet).sort();
    
    // Convertir Sets a arrays ordenados
    Object.keys(mesesPorAño).forEach(año => {
        mesesPorAño[año] = Array.from(mesesPorAño[año]).sort();
    });

    return { años, mesesPorAño };
};

// Lee todas las workloads en paralelo
const readAllWorkloads = async (files, prefix) => {
    const promises = files.map(async (file) => {
        try {
            const workload = await getObject(file.Key);
            
            // Extraer año y mes del path relativo
            const pathParts = file.Key.replace(prefix, '').split('/');
            const año = pathParts[0];
            const mes = pathParts[1];
            
            return {
                ...workload,
                _año: año,
                _mes: mes
            };
        } catch (error) {
            logger.warn('JSON corrupto o no legible, saltando', { key: file.Key, error: error.message });
            return null;
        }
    });

    const results = await Promise.all(promises);
    return results.filter(w => w !== null);
};

// Calcula el resumen por año y mes
const calculateSummary = (workloads, estructura) => {
    const resumen = {};
    const statusValidos = ['completado', 'en_progreso', 'pausado', 'cancelado'];

    estructura.años.forEach(año => {
        resumen[año] = {
            totales: 0,
            completado: 0,
            en_progreso: 0,
            pausado: 0,
            cancelado: 0,
            meses: {}
        };

        // Inicializar contadores por mes
        estructura.mesesPorAño[año].forEach(mes => {
            resumen[año].meses[mes] = {
                totales: 0,
                completado: 0,
                en_progreso: 0,
                pausado: 0,
                cancelado: 0
            };
        });
    });

    // Contabilizar cada workload
    workloads.forEach(workload => {
        const año = workload._año;
        const mes = workload._mes;
        const status = statusValidos.includes(workload.status) 
            ? workload.status 
            : 'en_progreso';

        if (resumen[año] && resumen[año].meses[mes]) {
            // Incrementar contador del mes
            resumen[año].meses[mes].totales++;
            if (resumen[año].meses[mes][status] !== undefined) {
                resumen[año].meses[mes][status]++;
            }

            // Incrementar contador del año
            resumen[año].totales++;
            if (resumen[año][status] !== undefined) {
                resumen[año][status]++;
            }
        }
    });

    return resumen;
};
