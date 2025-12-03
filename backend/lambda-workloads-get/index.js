const { getWorkloadsByClient, getWorkloadById } = require('./handlers/handlerWorkloads');
const { successResponse, errorResponse } = require('./utils/responses');
const logger = require('./utils/logger'); // tu logger personalizado

exports.handler = async (event) => {
    const timestamp = new Date().toISOString();
    logger.info('Inicio de ejecución de Lambda', { timestamp, event });

    try {
        // Obtener parámetros
        const clientId = event.pathParameters?.id;
        const year = event.queryStringParameters?.year || new Date().getFullYear().toString();
        const workloadId = event.queryStringParameters?.workloadId;

        // Validar que exista clientId
        if (!clientId) {
            logger.warn('Solicitud sin ID de cliente', { event });
            return errorResponse(400, 'ID de cliente requerido');
        }

        let result;

        if (workloadId) {
            logger.info('Obteniendo workload específico', { clientId, year, workloadId });
            result = await getWorkloadById(clientId, year, workloadId);
        } else {
            logger.info('Listando workloads del cliente', { clientId, year });
            result = await getWorkloadsByClient(clientId, year);
        }

        logger.info('Operación completada exitosamente', { clientId, year, total: result.total || 0 });
        return successResponse(200, 'Operación exitosa', result);

    } catch (error) {

        logger.error('Error al procesar la solicitud', {
            message: error.message,
            stack: error.stack
        });

        // Determinar código según tipo de error
        const statusCode = error.message.includes('no encontrado') ? 404 : 500;

        return errorResponse(statusCode, 'Error al procesar la solicitud', {
            message: error.message,
            stack: error.stack
        });
    }
};
