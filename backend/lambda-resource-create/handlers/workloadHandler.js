const { saveResource, ensureFolder } = require('../services/s3Service');
const { sendWorkloadNotification } = require("../services/email/workloads/sendWorkloadNotification");
const { randomUUID } = require('crypto');
const { getClient, clientExists } = require('../services/clientService');
const { validateWorkloadItem } = require('../validators/validator');
const logger = require('../utils/logger');
const { extractDatePart } = require('../utils/helpers');

// Procesar UN workload (EXPORTADA para reutilizar)
exports.processSingleWorkload = async (workloadData, clienteInfo) => {
    const { fecha_inicio, fecha_fin, sdm, status, responsable_email } = workloadData;
    const { id_cuenta, cliente, workloads_resumen } = clienteInfo;

    // Extraer el año y mes del workload
    const year = extractDatePart(workloadData.fecha_inicio, 6, 10);
    const month = extractDatePart(workloadData.fecha_inicio, 3, 5);

    // Asegurar la carpeta del año y mes dentro de workloads
    await ensureFolder(`workloads/${id_cuenta}/${year}/${month}/`);

    const workloadId = randomUUID().split('-')[0];
    const workload = {
        id: workloadId,
        id_cliente: id_cuenta,
        fecha_inicio,
        fecha_fin,
        periodo: `${year}-${month}`, 
        sdm,
        status,
        responsable_email,
        notificacion: 'pendiente', // Inicialmente pendiente
        creado_en: new Date().toISOString()
    };

    // Guardar en S3 
    await saveResource(`workloads/${id_cuenta}/${year}/${month}/${workloadId}.json`, workload);
    logger.info(`Workload ${workloadId} creado exitosamente`);

    // Actualizamos informaciòn del resumen
    workloads_resumen.totales += 1;
    workloads_resumen[status] += 1;
    workloads_resumen.status_actual = workload.status;
    workloads_resumen.ultimoWorkloadId = workloadId;

    // Intentar enviar notificación
    let notificacionEnviada = false;
    try {
        await sendWorkloadNotification(
            { fecha_inicio, fecha_fin, sdm, responsable_email },
            cliente,
            id_cuenta
        );

        notificacionEnviada = true;
        workload.notificacion = 'enviada'; //  sólo si realmente se envió
        logger.info(`Notificación enviada para workload ${workloadId}`);
    } catch (emailError) {
        workload.error_notificacion = emailError.message;
        logger.warn(`Fallo al enviar email para workload ${workloadId}`, { error: emailError.message });
    }

    // Guardar nuevamente el estado final (enviado o pendiente)
    await saveResource(`workloads/${id_cuenta}/${year}/${month}/${workloadId}.json`, workload);

    return {
        id: workloadId,
        ...workload,
        notificacionEnviada
    };
};

// Crear workload(s) - Individual o lote
exports.createWorkload = async (contenido) => {
    // Auto-detectar si es individual (objeto) o lote (array)
    const esLote = Array.isArray(contenido);
    const workloads = esLote ? contenido : [contenido];

    let exitosos = 0;
    let fallidos = 0;
    let notificados = 0;
    const errores = [];
    const workloadsCreados = [];

    for (let i = 0; i < workloads.length; i++) {
        const workload = workloads[i];
        const { id_cliente, sdm } = workload;

        // Validar workload antes de procesarlo
        const validacion = validateWorkloadItem(workload);
        if (!validacion.valid) {
            fallidos++;
            errores.push({
                workload_index: i,
                id_cliente: id_cliente || 'Sin ID',
                sdm: sdm || 'N/A',
                razon: 'Validación fallida',
                detalle: validacion.errores 
            });
            logger.warn(`Workload ${i} no pasó validación`, { errores: validacion.errores });
            continue;
        }

        try {
            // 1. Verificar que el cliente existe
            const exists = await clientExists(id_cliente);
            if (!exists) {
                throw new Error(`El cliente con ID ${id_cliente} no existe`);
            }

            // 2. Obtener datos del cliente
            const clienteData = await getClient(id_cliente);

            // 3. Procesar workload usando la función reutilizable
            const resultado = await exports.processSingleWorkload(workload, clienteData);

            exitosos++;
            if (resultado.notificacionEnviada) {
                notificados++;
            }

            workloadsCreados.push(resultado);
            await saveResource(`clients/${clienteData.id_cuenta}.json`, clienteData);

        } catch (error) {
            fallidos++;
            logger.error(`Error creando workload ${i}`, { error: error.message });
            
            // Intentar obtener nombre del cliente para mejor mensaje
            let nombreCliente = 'Desconocido';
            try {
                if (id_cliente) {
                    const clienteData = await getClient(id_cliente);
                    nombreCliente = clienteData.cliente;
                }
            } catch (e) {
                // Si no se puede obtener, usar el ID
                nombreCliente = id_cliente || 'Sin ID';
            }

            errores.push({
                workload_index: i,
                cliente: nombreCliente,
                id_cliente: id_cliente || 'Sin ID',
                sdm: sdm || 'N/A',
                razon: error.message.includes('no existe')
                    ? 'Cliente no existe'
                    : 'Error guardando workload',
                detalle: error.message
            });
        }
    }

    // Construir mensaje dinámico según el contexto
    let mensaje;

    if (esLote) {
        if (fallidos === 0 && notificados === workloads.length) {
            mensaje = `Todas las cargas fueron creadas y notificadas correctamente`;
        } else if (fallidos === 0 && notificados < workloads.length) {
            mensaje = `Cargas creadas (${notificados} de ${workloads.length} notificaciones enviadas)`;
        } else if (exitosos > 0 && fallidos > 0) {
            mensaje = `${exitosos} ${exitosos === 1 ? 'carga creada' : 'cargas creadas'}, ${fallidos} ${fallidos === 1 ? 'falló' : 'fallaron'}`;
        } else {
            mensaje = 'No se pudo crear ninguna carga de trabajo';
        }
    } else {
        if (fallidos > 0) {
            mensaje = 'Error creando carga de trabajo';
        } else if (notificados === 1) {
            mensaje = 'Carga de trabajo creada y notificada correctamente';
        } else {
            mensaje = 'Carga de trabajo creada, pero no se pudo enviar notificación';
        }
    }

    return {
        mensaje,
        exitosos,
        fallidos,
        total_notificados: notificados,
        workloads: esLote ? workloadsCreados : workloadsCreados[0],
        ...(errores.length > 0 && { errores })
    };
};