const { generateReport } = require('./services/reportService');
const { successResponse, errorResponse } = require('./utils/responses');
const logger = require('./utils/logger');

exports.handler = async (event) => {
    try {
        // Obtener parámetros del query string
        const params = event.queryStringParameters || {};
        const idCliente = params.id_cliente;
        const año = params.año;
        const mes = params.mes;
        const tipoReporte = params.tipoReporte || 'anual';

        // Validaciones
        if (!idCliente) {
            return errorResponse(400, 'Parámetro requerido', ['El parámetro id_cliente es obligatorio']);
        }

        if (!año) {
            return errorResponse(400, 'Parámetro requerido', ['El parámetro año es obligatorio']);
        }

        if (tipoReporte === 'mensual' && !mes) {
            return errorResponse(400, 'Parámetro requerido', ['El parámetro mes es obligatorio para reportes mensuales']);
        }

        if (!['anual', 'mensual'].includes(tipoReporte)) {
            return errorResponse(400, 'Parámetro inválido', ['tipoReporte debe ser "anual" o "mensual"']);
        }

        logger.info('Solicitud de reporte recibida', { idCliente, año, mes, tipoReporte });

        // Generar reporte
        const reporte = await generateReport(idCliente, año, mes, tipoReporte);

        logger.info('Reporte generado exitosamente', { 
            idCliente, 
            tipoReporte,
            totalWorkloads: reporte.totales
        });

        return successResponse(200, 'Reporte generado exitosamente', reporte);

    } catch (error) {
        logger.error('Error inesperado', { error: error.message, stack: error.stack });
        return errorResponse(500, 'Error interno del servidor', [error.message]);
    }
};
