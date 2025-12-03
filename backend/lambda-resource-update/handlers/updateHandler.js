const { validateUpdatePayload } = require('../validators/updateValidator');
const { getClientById, getWorkloadById, saveClient, saveWorkload, deleteWorkload, listWorkloadsInFolder } = require('../services/s3Service');
const { sendWorkloadNotification } = require('../services/email/workloads/sendWorkloadNotification');
const { recalcularResumenCliente, actualizarResumenEnCliente } = require('../services/clientSummaryService');
const logger = require('../utils/logger');

/**
 * Handler principal para actualizaciones
 */
exports.handlerUpdate = async (body) => {
    // 1. Validar payload
    const validation = validateUpdatePayload(body);
    if (!validation.valid) {
        const error = new Error('Errores de validación');
        error.isValidation = true;
        error.errors = validation.errores;
        throw error;
    }

    const { operacion, contenido } = body;
    logger.info(`Procesando operación: ${operacion}`);

    // 2. Ejecutar operación según tipo
    switch (operacion) {
        case 'CLI_U':
            return await updateClient(contenido);
        case 'WL_U':
            return await updateWorkload(contenido);
        default:
            throw new Error(`Operación no válida: ${operacion}`);
    }
};

/**
 * Actualizar cliente
 */
async function updateClient(contenido) {
    const { id_cuenta, cliente, tipo_proyecto, compromiso } = contenido;

    // 1. Verificar que el cliente existe
    const existingClient = await getClientById(id_cuenta);
    logger.info('Cliente obtenido desde S3:', existingClient);

    if (!existingClient) {
        throw new Error(`El cliente con ID ${id_cuenta} no existe. No se puede actualizar un cliente que no ha sido creado previamente.`);
    }

    // 2. Preparar datos actualizados del cliente
    const clienteActualizado = {
        id_cuenta: id_cuenta,
        cliente: cliente,
        tipo_proyecto: tipo_proyecto,
        compromiso: compromiso,
        workloads_resumen: existingClient.workloads_resumen || {},
        created_at: existingClient.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    // 3. Guardar en S3
    await saveClient(clienteActualizado);

    return {
        mensaje: `Cliente ${cliente} actualizado correctamente`,
        cliente: clienteActualizado
    };
}

/**
 * Actualizar workload
 */
async function updateWorkload(contenido) {
    const { id, id_cliente, fecha_inicio, fecha_fin, sdm, status, responsable, notificacion, periodo } = contenido;

    // 1. Verificar que el cliente asociado existe
    const existingClient = await getClientById(id_cliente);
    if (!existingClient) {
        throw new Error(`El cliente con ID ${id_cliente} no existe. No se puede asociar el workload a un cliente inexistente.`);
    }

    // 2. Extraer año y mes del periodo
    const [year, month] = periodo.split('-');
    
    logger.info('Buscando workload', { id, id_cliente, year, month, periodo });

    // 3. Verificar que el workload existe en la ruta especificada
    const existingWorkload = await getWorkloadById(id, id_cliente, year, month);
    if (!existingWorkload) {
        throw new Error(`El workload con ID ${id} no existe en workloads/${id_cliente}/${year}/${month}/. Verifica que el periodo sea correcto.`);
    }

    logger.info('Workload encontrado', { existingWorkload });

    // 4. Detectar cambios importantes
    const responsableCambio = existingWorkload.responsable !== responsable;
    const responsableAnterior = existingWorkload.responsable;
    const statusCambio = existingWorkload.status !== status;
    const statusAnterior = existingWorkload.status;
    
    // Detectar cambio de fecha (mes o año)
    const yearNuevo = fecha_inicio.substring(6);
    const monthNuevo = fecha_inicio.substring(3, 5);
    const fechaCambio = (year !== yearNuevo) || (month !== monthNuevo);

    logger.info('Cambios detectados', {
        responsableCambio,
        statusCambio: statusCambio ? `${statusAnterior} -> ${status}` : 'sin cambio',
        fechaCambio: fechaCambio ? `${year}-${month} -> ${yearNuevo}-${monthNuevo}` : 'sin cambio'
    });

    // 5. Preparar datos actualizados del workload
    const workloadActualizado = {
        id: id,
        periodo: parseInt(yearNuevo),
        month: monthNuevo,
        id_cliente: id_cliente,
        fecha_inicio: fecha_inicio,
        fecha_fin: fecha_fin,
        sdm: sdm,
        status: status,
        responsable: responsable,
        notificacion: notificacion || 'pendiente',
        fecha_creacion: existingWorkload.fecha_creacion || new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    logger.info('Workload actualizado a guardar', workloadActualizado);

    // 6. Si cambió la fecha, mover el workload
    if (fechaCambio) {
        logger.info('Moviendo workload a nueva ubicación', {
            desde: `${year}/${month}`,
            hacia: `${yearNuevo}/${monthNuevo}`
        });

        // Eliminar de la ubicación anterior
        await deleteWorkload(id, id_cliente, year, month);

        // Guardar en la nueva ubicación
        await saveWorkload(workloadActualizado, yearNuevo, monthNuevo);

        // Limpiar carpetas vacías en la ubicación anterior
        await limpiarCarpetasVacias(id_cliente, year, month);
    } else {
        // Solo actualizar en la misma ubicación
        await saveWorkload(workloadActualizado, year, month);
    }

    // 7. Si cambió el status o la fecha, recalcular resumen del cliente
    if (statusCambio || fechaCambio) {
        logger.info('Recalculando resumen del cliente por cambio de status o fecha');
        
        try {
            const nuevoResumen = await recalcularResumenCliente(id_cliente);
            await actualizarResumenEnCliente(id_cliente, nuevoResumen);
            
            logger.info('Resumen del cliente actualizado', { nuevoResumen });
        } catch (error) {
            logger.error('Error recalculando resumen del cliente', { error: error.message });
            // No lanzamos el error para no fallar toda la actualización
        }
    }

    // 8. Gestionar notificaciones si cambió el responsable
    let notificaciones = null;
    if (responsableCambio) {
        notificaciones = {
            cancelado: responsableAnterior,
            asignado: responsable
        };

        logger.info(`Cambio de responsable detectado`, {
            workloadId: id,
            anterior: responsableAnterior,
            nuevo: responsable
        });

        // Enviar notificaciones
        try {
            // Notificar al responsable anterior
            await sendWorkloadNotification(
                { ...workloadActualizado, responsable: responsableAnterior },
                existingClient.cliente,
                id_cliente,
                "cancel"
            );

            // Notificar al nuevo responsable
            await sendWorkloadNotification(
                workloadActualizado,
                existingClient.cliente,
                id_cliente,
                "assign"
            );

            logger.info('Notificaciones de cambio de responsable enviadas correctamente');
        } catch (emailError) {
            logger.error('Error enviando notificaciones de cambio de responsable', {
                error: emailError.message,
                workloadId: id
            });
            // No lanzamos el error para no fallar toda la actualización
        }
    }

    return {
        mensaje: `Carga de trabajo actualizada correctamente`,
        workload: workloadActualizado,
        cambios: {
            responsable: responsableCambio,
            status: statusCambio,
            fecha: fechaCambio
        },
        notificaciones: notificaciones
    };
}

/**
 * Limpiar carpetas vacías después de mover un workload
 */
async function limpiarCarpetasVacias(clientId, year, month) {
    try {
        logger.info('Verificando carpetas vacías', { clientId, year, month });

        // Verificar si el mes quedó vacío
        const workloadsEnMes = await listWorkloadsInFolder(clientId, year, month);
        
        if (!workloadsEnMes || workloadsEnMes.length === 0) {
            logger.info('Mes vacío, verificando año', { clientId, year, month });
            
            // Verificar si el año completo quedó vacío
            const workloadsEnYear = await listWorkloadsInFolder(clientId, year);
            
            if (!workloadsEnYear || workloadsEnYear.length === 0) {
                logger.info('Año completo vacío, no se requiere limpieza adicional', { clientId, year });
            }
        }

        logger.info('Limpieza de carpetas completada');
    } catch (error) {
        logger.error('Error limpiando carpetas vacías', {
            clientId,
            year,
            month,
            error: error.message
        });
        // No lanzamos el error
    }
}
