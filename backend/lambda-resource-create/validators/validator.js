const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const {
    CLI_I_SCHEMA,
    WL_I_SCHEMA,
} = require('./schemas');
const { validateDates } = require('./dateValidator');

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);



// Formatea errores de AJV a un array legible
const formatErrors = (errors) => {
    return errors.map(err => {
        // Tomar solo el último campo del path (por ejemplo: "contenido/0/id_cliente" → "id_cliente")
        const pathParts = err.instancePath.split('/').filter(Boolean);
        const field = pathParts.length > 0
            ? pathParts[pathParts.length - 1]
            : (err.params.missingProperty || 'root');

        switch (err.keyword) {
            case 'required':
                return `${err.params.missingProperty}: campo requerido`;
            case 'type':
                return `${field}: debe ser tipo ${err.params.type}`;
            case 'minLength':
                return `${field}: debe tener al menos ${err.params.limit} caracteres`;
            case 'pattern':
                return `${field}: formato inválido`;
            case 'format':
                if (err.params.format === 'email') {
                    return `${field}: debe tener un formato de correo electrónico válido`;
                }
                if (err.params.format === 'date') {
                    return `${field}: debe tener un formato de fecha válido (YYYY-MM-DD)`;
                }
                return `${field}: formato inválido`;
            case 'enum':
                return `${field}: debe ser uno de [${err.params.allowedValues.join(', ')}]`;
            case 'minItems':
                return `${field}: debe tener al menos ${err.params.limit} elemento(s)`;
            case 'const':
                return `${field}: debe ser '${err.params.allowedValue}'`;
            case 'additionalProperties':
                return `${err.params.additionalProperty}: propiedad no permitida`;
            default:
                return `${field}: ${err.message}`;
        }
    });
};


// Valida solo la estructura básica del payload (operación y tipo de contenido)
exports.validatePayload = (data) => {
    const operacion = data?.operacion;
    const contenido = data?.contenido;

    if (!operacion) {
        return {
            valid: false,
            errores: ['operacion: campo requerido']
        };
    }
    
    const operacionesValidas = ['CLI_I', 'CLI_L', 'WL_I', 'WL_L'];
    if (!operacionesValidas.includes(operacion)) {
        return {
            valid: false,
            errores: [`operacion: '${operacion}' no es válida. Debe ser una de: ${operacionesValidas.join(', ')}`]
        };
    }

    if (!contenido) {
        return {
            valid: false,
            errores: ['contenido: campo requerido']
        };
    }

    // Validar que el tipo de contenido coincida con la operación
    const esLote = operacion === 'CLI_L' || operacion === 'WL_L';
    const esIndividual = operacion === 'CLI_I' || operacion === 'WL_I';

    if (esLote && !Array.isArray(contenido)) {
        return {
            valid: false,
            errores: [`contenido: debe ser un array para operación en lote (${operacion})`]
        };
    }

    if (esIndividual && Array.isArray(contenido)) {
        return {
            valid: false,
            errores: [`contenido: debe ser un objeto para operación individual (${operacion})`]
        };
    }

    if (esLote && contenido.length === 0) {
        return {
            valid: false,
            errores: ['contenido: el array no puede estar vacío']
        };
    }

    // Validar minItems según la operación
    if (operacion === 'CLI_L' && contenido.length < 2) {
        return {
            valid: false,
            errores: ['contenido: debe tener al menos 2 clientes para operación en lote (CLI_L). Para 1 cliente usa CLI_I']
        };
    }

    if (operacion === 'WL_L' && contenido.length < 2) {
        return {
            valid: false,
            errores: ['contenido: debe tener al menos 2 cargas de trabajo para operación en lote (WL_L). Para 1 carga usa WL_I']
        };
    }

    return { valid: true };
};

// Validar un cliente individual (ya incluye validación de workloads)
exports.validateClienteItem = (clienteData) => {
    const validate = ajv.compile(CLI_I_SCHEMA.properties.contenido);
    const isValid = validate(clienteData);

    const erroresEstructura = !isValid ? formatErrors(validate.errors) : [];

    // Validar fechas de workloads si existen
    let erroresFechas = [];
    if (clienteData.workloads && clienteData.workloads.length > 0) {
        const fechasResult = validateDates(clienteData.workloads);
        erroresFechas = !fechasResult.valid ? fechasResult.errores : [];
    }

    if (erroresEstructura.length > 0 || erroresFechas.length > 0) {
        return {
            valid: false,
            errores: [...erroresEstructura, ...erroresFechas]
        };
    }

    return { valid: true };
};

// Validar un workload individual (con id_cliente)
exports.validateWorkloadItem = (workloadData) => {
    const validate = ajv.compile(WL_I_SCHEMA.properties.contenido);
    const isValid = validate(workloadData);

    const erroresEstructura = !isValid ? formatErrors(validate.errors) : [];

    // Validar fechas
    const fechasResult = validateDates([workloadData]);
    const erroresFechas = !fechasResult.valid ? fechasResult.errores : [];

    if (erroresEstructura.length > 0 || erroresFechas.length > 0) {
        return {
            valid: false,
            errores: [...erroresEstructura, ...erroresFechas]
        };
    }

    return { valid: true };
};