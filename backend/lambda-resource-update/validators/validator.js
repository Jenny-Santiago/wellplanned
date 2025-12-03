const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const {
    CLI_I_SCHEMA,
    CLI_L_SCHEMA,
    WL_I_SCHEMA,
    WL_L_SCHEMA
} = require('./schemas');
const { validateDates } = require('./dateValidator');

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const SCHEMAS = {
    CLI_I: CLI_I_SCHEMA,
    CLI_L: CLI_L_SCHEMA,
    WL_I: WL_I_SCHEMA,
    WL_L: WL_L_SCHEMA
};

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


// Valida el payload completo
exports.validatePayload = (data) => {
    const operacion = data?.operacion;

    if (!operacion) {
        return {
            valid: false,
            errores: ['operacion: campo requerido']
        };
    }

    if (!SCHEMAS[operacion]) {
        return {
            valid: false,
            errores: [`operacion: '${operacion}' no es válida`]
        };
    }

    // Validar estructura 
    const validate = ajv.compile(SCHEMAS[operacion]);
    const isValid = validate(data);

    const erroresEstructura = !isValid ? formatErrors(validate.errors) : [];

    // Valdiar logica de fechas
    const fechasResult = validateDates(data.contenido);
    const erroresFechas = !fechasResult.valid ? fechasResult.errores : [];

    if (erroresEstructura.length > 0 || erroresFechas.length > 0) {
        return {
            valid: false,
            errores: [...erroresEstructura, ...erroresFechas]
        };
    }

    return { valid: true }
};