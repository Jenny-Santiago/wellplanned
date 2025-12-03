const { validatePayload } = require('./validators/validator');
const { createClient } = require('./handlers/clientHandler');
const { createWorkload } = require('./handlers/workloadHandler');
const { successResponse, errorResponse, partialSuccessResponse } = require('./utils/responses');
const logger = require('./utils/logger');

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const operacion = body.operacion;

        logger.info(`Operación recibida: ${operacion}`);

        // Validación básica de estructura (solo operación y contenido)
        const validation = validatePayload(body);
        if (!validation.valid) {
            logger.warn('Validación de estructura fallida', { errores: validation.errores });
            return errorResponse(400, 'Validación fallida', validation.errores);
        }

        const contenido = body.contenido;
        let result;

        switch (operacion) {
            case 'CLI_I':
            case 'CLI_L':
                // Procesar clientes (validación individual dentro del handler)
                result = await createClient(contenido);

                logger.info('Resultado de createClient', { 
                    exitosos: result.clientes_exitosos, 
                    fallidos: result.clientes_fallidos,
                    errores: result.errores?.length || 0
                });

                // Si todos fallaron, retornar error
                if (result.clientes_exitosos === 0) {
                    return errorResponse(400, 'No se pudo crear ningún cliente', result.errores);
                }

                // Si hubo éxitos parciales, retornar 207
                if (result.clientes_fallidos > 0 || result.total_workloads_fallidos > 0) {
                    logger.info('Retornando respuesta parcial 207');
                    return partialSuccessResponse(207, result.mensaje, result);
                }

                // Todo exitoso
                logger.info('Retornando respuesta exitosa 201');
                return successResponse(201, result.mensaje, result);


            case 'WL_I':
            case 'WL_L':
                // Procesar workloads (validación individual dentro del handler)
                result = await createWorkload(contenido);

                // Si todos fallaron, retornar error
                if (result.exitosos === 0) {
                    return errorResponse(400, 'No se pudo crear ninguna carga de trabajo', result.errores);
                }

                // Si hubo éxitos parciales, retornar 207
                if (result.fallidos > 0) {
                    return partialSuccessResponse(207, result.mensaje, result);
                }

                // Todo exitoso
                return successResponse(201, result.mensaje, result);

            default:
                return errorResponse(400, 'Operación no soportada', [`Operación '${operacion}' no es válida`]);
        }

    } catch (error) {
        logger.error('Error inesperado', { error: error.message, stack: error.stack });

        if (error.message.includes('ya existe')) {
            return errorResponse(409, 'Conflicto', [error.message]);
        }

        if (error.message.includes('no existe')) {
            return errorResponse(404, 'No encontrado', [error.message]);
        }

        return errorResponse(500, 'Error interno del servidor', [error.message]);
    }
};
