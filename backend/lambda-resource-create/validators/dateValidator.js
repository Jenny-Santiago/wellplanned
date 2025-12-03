/*
  Validador de fechas para workloads
  Maneja todas las validaciones relacionadas con fechas de inicio y fin
*/

// Convierte una fecha DD-MM-YYYY a objeto Date y valida que sea real
const parseDate = (fechaStr) => {
    const [dia, mes, año] = fechaStr.split('-').map(Number);
    const fecha = new Date(año, mes - 1, dia);

    if (
        fecha.getFullYear() !== año ||
        fecha.getMonth() !== mes - 1 ||
        fecha.getDate() !== dia
    ) {
        return null;
    }

    return fecha;
};

// Valida un par de fechas (fecha_inicio, fecha_fin), retorna { valid: true } o { valid: false, error: "mensaje" }
const validateDatePair = (fecha_inicio, fecha_fin, context = '') => {

    // Parsear fechas
    const inicio = parseDate(fecha_inicio);
    const fin = parseDate(fecha_fin);

    if (!inicio) {
        return {
            valid: false,
            error: `La fecha ${fecha_inicio} no es válida. Verifica que el día, mes y año correspondan a una fecha real (por ejemplo, revisa si el año es bisiesto).`
        };
    }

    if (!fin) {
        return {
            valid: false,
            error: `La fecha ${fecha_fin} no es válida. Verifica que el día, mes y año correspondan a una fecha real (por ejemplo, revisa si el año es bisiesto).`
        };
    }

    // Validar que inicio < fin
    if (inicio >= fin) {
        return {
            valid: false,
            error: `${context}fecha_inicio debe ser anterior a fecha_fin`
        };
    }

    // Validar rango razonable de años
    const añoInicio = inicio.getFullYear();
    const añoFin = fin.getFullYear();
    const añoActual = new Date().getFullYear();

    const AÑO_MIN = 2024;
    const AÑO_MAX = añoActual;

    if (añoInicio < AÑO_MIN) {
        return {
            valid: false,
            error: `${context}fecha_inicio: año ${añoInicio} muy antiguo (mínimo: ${AÑO_MIN})`
        };
    }

    if (añoInicio > AÑO_MAX) {
        return {
            valid: false,
            error: `${context}fecha_inicio: año ${añoInicio} no puede ser futuro (máximo: ${AÑO_MAX})`
        };
    }

    if (añoFin < AÑO_MIN) {
        return {
            valid: false,
            error: `${context}fecha_fin: año ${añoFin} muy antiguo (mínimo: ${AÑO_MIN})`
        };
    }

    if (añoFin > AÑO_MAX + 1) {
        return {
            valid: false,
            error: `${context}fecha_fin: año ${añoFin} muy lejano (máximo: ${AÑO_MAX + 1})`
        };
    }

    return { valid: true };
};

// Valida fechas en cualquier estructura que venga en data.contenido, maneja automáticamente: CLI_I, CLI_L, WL_I, WL_L
exports.validateDates = (contenido) => {
    const errores = [];

    // CASO 1: WL_I - Workload individual
    if (contenido.id_cliente && !Array.isArray(contenido)) {
        const validation = validateDatePair(contenido.fecha_inicio, contenido.fecha_fin);
        if (!validation.valid) {
            errores.push(validation.error);
        }
        return errores.length > 0 ? { valid: false, errores } : { valid: true };
    }

    // CASO 2: CLI_I - Cliente individual con workloads opcionales
    if (contenido.id_cuenta && !Array.isArray(contenido)) {
        if (contenido.workloads && Array.isArray(contenido.workloads)) {
            contenido.workloads.forEach((workload, index) => {
                const context = `workload[${index + 1}] - `;
                const validation = validateDatePair(workload.fecha_inicio, workload.fecha_fin, context);
                if (!validation.valid) {
                    errores.push(validation.error);
                }
            });
        }
        return errores.length > 0 ? { valid: false, errores } : { valid: true };
    }

    // CASO 3: WL_L - Array de workloads
    if (Array.isArray(contenido) && contenido[0]?.id_cliente) {
        contenido.forEach((workload, index) => {
            const context = `workload[${index + 1}] - `;
            const validation = validateDatePair(workload.fecha_inicio, workload.fecha_fin, context);
            if (!validation.valid) {
                errores.push(validation.error);
            }
        });
        return errores.length > 0 ? { valid: false, errores } : { valid: true };
    }

    // CASO 4: CLI_L - Array de clientes, cada uno con workloads opcionales
    if (Array.isArray(contenido) && contenido[0]?.id_cuenta) {
        contenido.forEach((cliente, clienteIndex) => {
            if (cliente.workloads && Array.isArray(cliente.workloads)) {
                cliente.workloads.forEach((workload, workloadIndex) => {
                    const context = `cliente[${clienteIndex}].workload[${workloadIndex + 1}] - `;
                    const validation = validateDatePair(workload.fecha_inicio, workload.fecha_fin, context);
                    if (!validation.valid) {
                        errores.push(validation.error);
                    }
                });
            }
        });
        return errores.length > 0 ? { valid: false, errores } : { valid: true };
    }

    // Si no hace match ningún caso, está válido (no tiene workloads)
    return { valid: true };
};