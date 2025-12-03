// handlers/handlerDelete.js
const s3Service = require('../services/s3Service');
const { successResponse, errorResponse } = require('../utils/responses');
const clientSummaryService = require('../services/clientSummaryService');
const logger = require('../utils/logger');

async function handleDelete(event) {

    // Parsear body
    const body = parseBody(event.body);

    if (!body) {
        return errorResponse(400, 'Body inválido', ['El body debe ser un JSON válido']);
    }

    const { tipo, id } = body;

    // Validar campos obligatorios
    if (!tipo || !id) {
        return errorResponse(400, 'Campos requeridos faltantes', [
            'Se requieren los campos: tipo, id'
        ]);
    }

    // Validar tipo
    if (tipo !== 'cliente' && tipo !== 'workload') {
        return errorResponse(400, 'Tipo inválido', [
            'El campo "tipo" debe ser "cliente" o "workload"'
        ]);
    }

    logger.info('Procesando eliminación', { tipo, id });

    try {
        if (tipo === 'cliente') {
            return await deleteCliente(id);
        } else {
            return await deleteWorkload(body);
        }
    } catch (error) {
        logger.error('Error en controlador de eliminación', {
            tipo,
            id,
            error: error.message,
            stack: error.stack
        });
        return errorResponse(500, 'Error eliminando recurso', [error.message]);
    }
}

/**
 * Elimina un cliente y todas sus cargas de trabajo
 */
async function deleteCliente(clienteId) {
    logger.info('Eliminando cliente', { clienteId });

    // Verificar si el cliente existe
    const clienteKey = `clients/${clienteId}.json`;
    const clienteExists = await s3Service.objectExists(clienteKey);

    if (!clienteExists) {
        return errorResponse(404, 'Cliente no encontrado', [
            `No existe un cliente con ID: ${clienteId}`
        ]);
    }

    // Eliminar archivo del cliente
    await s3Service.deleteObject(clienteKey);
    logger.info('Archivo de cliente eliminado', { key: clienteKey });

    // Eliminar todas las cargas de trabajo del cliente
    const workloadsPrefix = `workloads/${clienteId}/`;
    const deletedWorkloads = await s3Service.deleteAllObjectsWithPrefix(workloadsPrefix);

    logger.info('Eliminación de cliente completada', {
        clienteId,
        workloadsEliminadas: deletedWorkloads.length
    });

    const mensaje =
        `El cliente${deletedWorkloads.length === 0 ? ' ha sido eliminado correctamente' : ' y sus cargas de trabajo se han eliminado correctamente'}`;

    return successResponse(200, 'Operación Exitosa', {
        tipo: 'cliente',
        cliente_id: clienteId,
        cargas_eliminadas: deletedWorkloads.length,
        mensaje,
        deletedWorkloads
    });
}

/**
 * Elimina una carga de trabajo específica y limpia carpetas vacías
 * Ruta en S3: workloads/{id_cliente}/{year}/{month}/{workload_id}.json
 */
async function deleteWorkload(body) {
    const { id, id_cliente, year, month } = body;

    if (!id_cliente) {
        return errorResponse(400, 'Campo requerido faltante', [
            'Para eliminar un workload se requiere el campo: id_cliente'
        ]);
    }

    if (!year) {
        return errorResponse(400, 'Campo requerido faltante', [
            'Para eliminar un workload se requiere el campo: year'
        ]);
    }

    if (!month) {
        return errorResponse(400, 'Campo requerido faltante', [
            'Para eliminar un workload se requiere el campo: month'
        ]);
    }

    logger.info('Eliminando carga de trabajo', {
        workloadId: id,
        clienteId: id_cliente,
        year,
        month
    });

    // Construir la key directa del workload
    const workloadKey = `workloads/${id_cliente}/${year}/${month}/${id}.json`;

    // Verificar si existe
    const workloadExists = await s3Service.objectExists(workloadKey);

    if (!workloadExists) {
        return errorResponse(404, 'Carga de trabajo no encontrada', [
            `No existe la carga de trabajo con ID: ${id}`,
            `Cliente: ${id_cliente}, Año: ${year}, Mes: ${month}`
        ]);
    }

    // Eliminar la carga de trabajo
    await s3Service.deleteObject(workloadKey);

    logger.info('Carga de trabajo eliminada', {
        workloadId: id,
        key: workloadKey,
        clienteId: id_cliente
    });

    // LIMPIAR CARPETAS VACÍAS
    const carpetasEliminadas = await limpiarCarpetasVacias(id_cliente, year, month);

    logger.info('Limpieza de carpetas completada', {
        clienteId: id_cliente,
        carpetasEliminadas
    });

    // RECALCULAR Y ACTUALIZAR RESUMEN DEL CLIENTE
    try {
        logger.info('Iniciando recálculo de resumen', { clienteId: id_cliente });

        const nuevoResumen = await clientSummaryService.recalcularResumenCliente(id_cliente);

        logger.info('Resumen recalculado, procediendo a actualizar cliente', {
            clienteId: id_cliente,
            nuevoResumen
        });

        await clientSummaryService.actualizarResumenEnCliente(id_cliente, nuevoResumen);

        logger.info('Resumen de cliente actualizado tras eliminar workload', {
            clienteId: id_cliente,
            nuevoStatusActual: nuevoResumen.status_actual,
            totalesRestantes: nuevoResumen.totales,
            mesesDisponibles: nuevoResumen.meses,
            añosDisponibles: nuevoResumen.años
        });

        return successResponse(200, 'Carga de trabajo eliminada correctamente', {
            tipo: 'workload',
            workload_id: id,
            cliente_id: id_cliente,
            year,
            month,
            resumen_actualizado: true,
            carpetas_limpiadas: carpetasEliminadas,
            nuevo_status: nuevoResumen.status_actual,
            workloads_restantes: nuevoResumen.totales,
            meses_disponibles: nuevoResumen.meses,
            años_disponibles: nuevoResumen.años,
            mensaje: 'La carga de trabajo ha sido eliminada y el resumen del cliente se ha actualizado'
        });

    } catch (error) {
        logger.error('Error actualizando resumen de cliente', {
            clienteId: id_cliente,
            error: error.message,
            stack: error.stack
        });

        return successResponse(200, 'Carga de trabajo eliminada, pero hubo un problema actualizando el resumen del cliente', {
            tipo: 'workload',
            workload_id: id,
            cliente_id: id_cliente,
            year,
            month,
            carpetas_limpiadas: carpetasEliminadas,
            warning: 'El resumen del cliente puede estar desactualizado',
            error: error.message
        });
    }
}

/**
 * Limpia carpetas vacías después de eliminar un workload
 * 1. Verifica si la carpeta del mes quedó vacía → la elimina
 * 2. Verifica si la carpeta del año quedó vacía → la elimina
 */

/*
async function limpiarCarpetasVacias(clienteId, year, month) {
    const carpetasEliminadas = [];

    try {
        // 1. Verificar si la carpeta del mes quedó vacía
        const monthPrefix = `workloads/${clienteId}/${year}/${month}/`;
        const workloadsEnMes = await s3Service.listAllObjects(monthPrefix);

        if (!workloadsEnMes || workloadsEnMes.length === 0) {
            logger.info('Carpeta de mes vacía, será eliminada', { 
                clienteId, 
                year, 
                month,
                prefix: monthPrefix 
            });
            
            // Eliminar cualquier objeto restante en la carpeta del mes (por si acaso)
            await s3Service.deleteAllObjectsWithPrefix(monthPrefix);
            carpetasEliminadas.push(`${year}/${month}`);

            // 2. Verificar si la carpeta del año quedó vacía
            const yearPrefix = `workloads/${clienteId}/${year}/`;
            const workloadsEnYear = await s3Service.listAllObjects(yearPrefix);

            if (!workloadsEnYear || workloadsEnYear.length === 0) {
                logger.info('Carpeta de año vacía, será eliminada', { 
                    clienteId, 
                    year,
                    prefix: yearPrefix 
                });
                
                // Eliminar cualquier objeto restante en la carpeta del año
                await s3Service.deleteAllObjectsWithPrefix(yearPrefix);
                carpetasEliminadas.push(`${year}`);
            } else {
                logger.info('Carpeta de año aún contiene workloads', {
                    clienteId,
                    year,
                    cantidadWorkloads: workloadsEnYear.length
                });
            }
        } else {
            logger.info('Carpeta de mes aún contiene workloads', {
                clienteId,
                year,
                month,
                cantidadWorkloads: workloadsEnMes.length
            });
        }

        return carpetasEliminadas;

    } catch (error) {
        logger.error('Error limpiando carpetas vacías', {
            clienteId,
            year,
            month,
            error: error.message,
            stack: error.stack
        });
        // No lanzar el error para no afectar la operación principal
        return carpetasEliminadas;
    }
}
*/

/**
 * Limpia carpetas vacías después de eliminar un workload
 * 1. Verifica si la carpeta del mes quedó vacía → la elimina
 * 2. Verifica si la carpeta del año quedó vacía → la elimina
 */
async function limpiarCarpetasVacias(clienteId, year, month) {
    const carpetasEliminadas = [];

    try {
        // 1. Verificar si la carpeta del mes quedó vacía
        const monthPrefix = `workloads/${clienteId}/${year}/${month}/`;
        const objetosEnMes = await s3Service.listAllObjects(monthPrefix);

        // ✅ Filtrar solo archivos .json
        const archivosJsonEnMes = objetosEnMes.filter(item => item.Key.endsWith('.json'));

        logger.info('Verificando carpeta de mes', {
            clienteId,
            year,
            month,
            prefix: monthPrefix,
            totalObjetos: objetosEnMes.length,
            archivosJson: archivosJsonEnMes.length
        });

        if (archivosJsonEnMes.length === 0) {
            logger.info('Carpeta de mes vacía (sin archivos JSON), será eliminada', {
                clienteId,
                year,
                month,
                prefix: monthPrefix
            });

            // Eliminar TODO en la carpeta del mes (incluyendo objetos vacíos)
            await s3Service.deleteAllObjectsWithPrefix(monthPrefix);
            carpetasEliminadas.push(`${year}/${month}`);

            // 2. Verificar si la carpeta del año quedó vacía
            const yearPrefix = `workloads/${clienteId}/${year}/`;
            const objetosEnYear = await s3Service.listAllObjects(yearPrefix);

            // ✅ Filtrar solo archivos .json
            const archivosJsonEnYear = objetosEnYear.filter(item => item.Key.endsWith('.json'));

            logger.info('Verificando carpeta de año', {
                clienteId,
                year,
                prefix: yearPrefix,
                totalObjetos: objetosEnYear.length,
                archivosJson: archivosJsonEnYear.length
            });

            if (archivosJsonEnYear.length === 0) {
                logger.info('Carpeta de año vacía (sin archivos JSON), será eliminada', {
                    clienteId,
                    year,
                    prefix: yearPrefix
                });

                // Eliminar TODO en la carpeta del año
                await s3Service.deleteAllObjectsWithPrefix(yearPrefix);
                carpetasEliminadas.push(`${year}`);
            } else {
                logger.info('Carpeta de año aún contiene workloads', {
                    clienteId,
                    year,
                    cantidadWorkloads: archivosJsonEnYear.length
                });
            }
        } else {
            logger.info('Carpeta de mes aún contiene workloads', {
                clienteId,
                year,
                month,
                cantidadWorkloads: archivosJsonEnMes.length
            });
        }

        return carpetasEliminadas;

    } catch (error) {
        logger.error('Error limpiando carpetas vacías', {
            clienteId,
            year,
            month,
            error: error.message,
            stack: error.stack
        });
        // No lanzar el error para no afectar la operación principal
        return carpetasEliminadas;
    }
}

function parseBody(body) {
    if (!body) return null;

    try {
        return typeof body === 'string' ? JSON.parse(body) : body;
    } catch (error) {
        logger.error('Error parseando body', { error: error.message });
        return null;
    }
}

module.exports = {
    handleDelete
};