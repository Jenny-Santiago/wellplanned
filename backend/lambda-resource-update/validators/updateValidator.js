const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const { CLI_U_SCHEMA, WL_U_SCHEMA } = require('../schemas/updateSchemas');

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const SCHEMAS = {
    CLI_U: CLI_U_SCHEMA,
    WL_U: WL_U_SCHEMA
};

// Formatea errores de AJV a un array legible
const formatErrors = (errors) => {
    return errors.map(err => {
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
            case 'maxLength':
                return `${field}: no debe exceder ${err.params.limit} caracteres`;
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
exports.validateUpdatePayload = (data) => {
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
            errores: [`operacion: '${operacion}' no es válida. Operaciones permitidas: CLI_U, WL_U`]
        };
    }

    const validate = ajv.compile(SCHEMAS[operacion]);
    const isValid = validate(data);

    if (!isValid) {
        return {
            valid: false,
            errores: formatErrors(validate.errors)
        };
    }

    return { valid: true };
};