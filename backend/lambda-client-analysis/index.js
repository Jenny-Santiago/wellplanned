const { analyzeClientWorkloads } = require('./services/analysisService');
const { successResponse, errorResponse } = require('./utils/responses');
const logger = require('./utils/logger');

exports.handler = async (event) => {
    try {
        const idCliente = event.pathParameters?.id;

        if (!idCliente) {
            return errorResponse(400, 'Parámetro requerido', ['El id del cliente es obligatorio']);
        }

        logger.info('Solicitud de análisis recibida', { idCliente });

        // Realizar análisis
        const resultado = await analyzeClientWorkloads(idCliente);

        const totalWorkloads = Object.values(resultado.resumen_por_año)
            .reduce((sum, año) => sum + año.totales, 0);

        logger.info('Análisis completado', {
            idCliente,
            años: resultado.años.length,
            totalWorkloads
        });

        return successResponse(200, 'Análisis completado exitosamente', resultado);

    } catch (error) {
        logger.error('Error inesperado', { error: error.message, stack: error.stack });
        return errorResponse(500, 'Error interno del servidor', [error.message]);
    }
};