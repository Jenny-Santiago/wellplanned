const handlerDelete = require('./handlers/handlerDelete');
const { errorResponse } = require('./utils/responses');
const logger = require('./utils/logger');

exports.handler = async (event) => {
  try {
    logger.info('Solicitud recibida', {
      httpMethod: event.httpMethod
    });

    return await handlerDelete.handleDelete(event);

  } catch (error) {
    logger.error('Error no controlado en handler', {
      error: error.message,
      stack: error.stack
    });
    return errorResponse(500, 'Error interno del servidor', [error.message]);
  }
};