const logger = require('../utils/logger');
const {
    getAvailableYears,
    getWorkloadsForYear,
    getSpecificWorkload
} = require('../services/s3Service');

exports.getWorkloadsByClient = async (clientId, year) => {
    logger.info('Iniciando obtención de workloads por cliente', { clientId, year });

    try {
        // 1. Obtener los años disponibles para este cliente
        const availableYears = await getAvailableYears(clientId);
        logger.info('Años disponibles obtenidos', { clientId, availableYears });

        // Si el cliente no tiene años registrados
        if (!availableYears || availableYears.length === 0) {
            logger.warn('Cliente sin cargas de trabajo registradas', { clientId });

            return {
                workloads: [],
                availableYears: [],
                year: null,
                total: 0,
                message: `El cliente ${clientId} no tiene cargas de trabajo registradas.`
            };
        }

        // 2. Obtener TODOS los workloads del año solicitado
        const workloads = await getWorkloadsForYear(clientId, year);
        logger.info('Workloads obtenidos correctamente', {
            clientId,
            year,
            total: workloads.length
        });

        return {
            workloads,
            availableYears,
            year: parseInt(year),
            total: workloads.length
        };
    } catch (error) {
        logger.error('Error al obtener workloads por cliente', {
            clientId,
            year,
            error: error.message
        });
        throw error;
    }
};

exports.getWorkloadById = async (clientId, year, workloadId) => {
    logger.info('Buscando workload específico', { clientId, year, workloadId });

    try {
        const workload = await getSpecificWorkload(clientId, year, workloadId);

        if (!workload) {
            const errMsg = `Workload ${workloadId} no encontrado para el cliente ${clientId} en ${year}`;
            logger.warn(errMsg, { clientId, year, workloadId });

            const err = new Error('Workload no encontrado');
            err.statusCode = 404;
            throw err;
        }

        logger.info('Workload obtenido correctamente', {
            clientId,
            year,
            workloadId
        });

        return {
            workload,
            year: parseInt(year)
        };
    } catch (error) {
        logger.error('Error al obtener workload específico', {
            clientId,
            year,
            workloadId,
            error: error.message
        });
        throw error;
    }
};
