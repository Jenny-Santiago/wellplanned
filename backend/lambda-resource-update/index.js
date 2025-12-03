const { handlerUpdate } = require('./handlers/handlerUpdate');
const { successResponse, errorResponse } = require('./utils/responses');
const logger = require('./utils/logger');

exports.handler = async (event) => {
    try {
        // Parsear body
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

        logger.info(`Operación recibida para actualización: ${body.operacion}`);
        logger.info(`Contenido: ${body}`);

        // Llamada al handler de actualización (ya incluye validación)
        const result = await handlerUpdate(body);

        return successResponse(200, 'Procesado correctamente', result);

    } catch (error) {
        logger.error('Error en Lambda PUT', { error: error.message, stack: error.stack });

        // Errores de validación → status 400
        if (error.isValidation) {
            return errorResponse(
                400,
                'Errores de validación',
                error.errors
            );
        }

        // Error de recurso no encontrado → status 404
        if (error.message.includes('no existe') || error.message.includes('no válido')) {
            return errorResponse(
                404,
                'Recurso no encontrado',
                [error.message]
            );
        }

        // Otros errores → status 500
        return errorResponse(
            500,
            'Error interno del servidor',
            [error.message]
        );
    }
};