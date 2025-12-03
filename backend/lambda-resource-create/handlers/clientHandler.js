const { saveResource, ensureFolder } = require('../services/s3Service');
const { clientExists } = require('../services/clientService');
const { processSingleWorkload } = require('./workloadHandler');
const { validateClienteItem } = require('../validators/validator');
const logger = require('../utils/logger');

const processSingleClient = async (datos) => {
    const { id_cuenta, cliente, tipo_proyecto, compromiso, workloads = [] } = datos;

    logger.info(`Procesando cliente ${id_cuenta}`, { cliente });

    // Verificar si el cliente ya existe
    const exists = await clientExists(id_cuenta);
    if (exists) {
        const err = new Error(`El cliente "${cliente}" (ID: ${id_cuenta}) ya existe`);
        err.tipo = 'cliente_existe';
        throw err;
    }

    const clientInfo = {
        id_cuenta,
        cliente,
        tipo_proyecto,
        compromiso,
        "workloads_resumen": {
            status_actual: "sin_workloads",
            ultimoWorkloadId: "",
            totales: 0,
            en_progreso: 0,
            completado: 0,
            pausado: 0,
            cancelado: 0
        },
        fecha_creacion: new Date().toISOString()
    }

    // Almacenamos cliente
    await saveResource(`clients/${id_cuenta}.json`, clientInfo);
    logger.info(`Cliente ${id_cuenta} guardado exitosamente`);

    // Asegura que exista la carpeta de workloads del cliente
    await ensureFolder(`workloads/${id_cuenta}/`);

    if (!workloads.length) {
        return {
            cliente: clientInfo,
            workloads_exitosos: 0,
            workloads_fallidos: 0,
            notificados: 0,
            workloads: []
        };
    }

    let fallidos = 0;
    let notificados = 0;
    const errores = [];
    const workloadsCreados = [];

    for (let i = 0; i < workloads.length; i++) {
        const workload = workloads[i];
        
        // No necesitamos validar aquí porque ya se validó con el cliente completo
        try {
            const resultado = await processSingleWorkload(workload, clientInfo);
            if (resultado.notificacionEnviada) notificados++;
            workloadsCreados.push(resultado);
        } catch (error) {
            fallidos++;
            errores.push({
                workload_index: i,
                cliente: cliente,
                sdm: workload.sdm || 'N/A',
                razon: 'Error guardando workload',
                detalle: error.message
            });
            logger.error(`Error creando workload ${i} para cliente ${id_cuenta}`, { error: error.message });
        }
    }

    // Actualizamos cliente 
    await saveResource(`clients/${id_cuenta}.json`, clientInfo);
    logger.info(`Cliente actualizado con las metricas correctas`);

    return {
        cliente: clientInfo,
        workloads_exitosos: clientInfo.workloads_resumen.totales,
        workloads_fallidos: fallidos,
        notificados,
        workloads: workloadsCreados,
        ...(errores.length > 0 && { errores_workloads: errores })
    };
};

exports.createClient = async (contenido) => {
    const esLote = Array.isArray(contenido);
    const clientes = esLote ? contenido : [contenido];

    let clientesExitosos = 0;
    let clientesFallidos = 0;
    let totalWorkloadsExitosos = 0;
    let totalWorkloadsFallidos = 0;
    let totalNotificados = 0;
    const resultados = [];
    const erroresClientes = [];

    for (let i = 0; i < clientes.length; i++) {
        const clienteData = clientes[i];
        const nombreCliente = clienteData.cliente || 'Sin nombre';
        const idCuenta = clienteData.id_cuenta || 'Sin ID';

        // Validar cliente antes de procesarlo
        const validacion = validateClienteItem(clienteData);
        if (!validacion.valid) { 
            clientesFallidos++;
            erroresClientes.push({
                cliente_index: i,
                cliente: nombreCliente,
                id_cuenta: idCuenta,
                razon: 'Validación fallida',
                detalle: validacion.errores 
            });
            resultados.push({ 
                index: i, 
                status: 'fallido', 
                cliente: nombreCliente,
                id_cuenta: idCuenta, 
                error: `Validación fallida: ${Array.isArray(validacion.errores) ? validacion.errores.join(', ') : validacion.errores}` 
            });
            logger.warn(`Cliente ${i} "${nombreCliente}" no pasó validación`, { errores: validacion.errores });
            continue;
        }

        try {
            const resultado = await processSingleClient(clienteData);

            clientesExitosos++;
            totalWorkloadsExitosos += resultado.workloads_exitosos;
            totalWorkloadsFallidos += resultado.workloads_fallidos;
            totalNotificados += resultado.notificados;

            resultados.push({ index: i, status: 'exitoso', ...resultado });

            // Si hubo errores en workloads, agregarlos a erroresClientes
            if (resultado.errores_workloads && resultado.errores_workloads.length > 0) {
                erroresClientes.push(...resultado.errores_workloads);
            }

        } catch (error) {
            clientesFallidos++;
            erroresClientes.push({
                cliente_index: i,
                cliente: nombreCliente,
                id_cuenta: idCuenta,
                razon: error.tipo === 'cliente_existe' ? 'Cliente ya existe' : 'Error creando cliente',
                detalle: error.message
            });
            resultados.push({ 
                index: i, 
                status: 'fallido', 
                cliente: nombreCliente,
                id_cuenta: idCuenta, 
                error: error.message 
            });
            logger.error(`Error procesando cliente ${i} "${nombreCliente}"`, { error: error.message });
        }
    }

    let mensaje = '';
    if (esLote) {
        if (clientesFallidos === 0 && totalWorkloadsFallidos === 0) {
            mensaje = `${clientesExitosos} clientes creados correctamente con ${totalWorkloadsExitosos} cargas de trabajo`;
        } else if (clientesExitosos === 0) {
            mensaje = 'No se pudo crear ningún cliente';
        } else {
            const partes = [`${clientesExitosos} clientes creados`];
            if (clientesFallidos > 0) partes.push(`${clientesFallidos} fallaron`);
            if (totalWorkloadsFallidos > 0) partes.push(`${totalWorkloadsFallidos} cargas de trabajo fallaron`);
            mensaje = partes.join(', ');
        }
    } else {
        if (clientesFallidos === 0 && totalWorkloadsFallidos === 0) {
            mensaje = 'Cliente creado correctamente';
        } else if (clientesFallidos > 0) {
            mensaje = 'Error creando cliente';
        } else {
            mensaje = `Cliente creado, pero ${totalWorkloadsFallidos} cargas de trabajo fallaron`;
        }
    }

    return {
        mensaje,
        clientes_exitosos: clientesExitosos,
        clientes_fallidos: clientesFallidos,
        total_workloads_exitosos: totalWorkloadsExitosos,
        total_workloads_fallidos: totalWorkloadsFallidos,
        total_notificados: totalNotificados,
        resultados: esLote ? resultados : resultados[0],
        ...(erroresClientes.length > 0 && { errores: erroresClientes })
    };
};
