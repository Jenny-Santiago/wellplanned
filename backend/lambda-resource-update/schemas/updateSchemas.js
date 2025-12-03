// Schema para actualización de CLIENTE
exports.CLI_U_SCHEMA = {
    type: 'object',
    properties: {
        operacion: {
            type: 'string',
            const: 'CLI_U'
        },
        contenido: {
            type: 'object',
            properties: {
                id_cuenta: {
                    type: 'string',
                    minLength: 8,
                    pattern: '^[a-zA-Z0-9_-]+$'
                },
                cliente: {
                    type: 'string',
                    minLength: 3,
                    maxLength: 200
                },
                tipo_proyecto: {
                    type: 'string',
                    minLength: 2,
                    maxLength: 100
                },
                compromiso: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 500
                }
            },
            required: ['id_cuenta', 'cliente', 'tipo_proyecto', 'compromiso'],
            additionalProperties: false
        }
    },
    required: ['operacion', 'contenido'],
    additionalProperties: false
};

// Schema para actualización de WORKLOAD
exports.WL_U_SCHEMA = {
    type: 'object',
    properties: {
        operacion: {
            type: 'string',
            const: 'WL_U'
        },
        contenido: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    minLength: 8,
                    pattern: '^[a-zA-Z0-9_-]+$'
                },
                id_cliente: {
                    type: 'string',
                    minLength: 8,
                    pattern: '^[a-zA-Z0-9_-]+$'
                },
                fecha_inicio: {
                    type: 'string',
                    pattern: '^\\d{2}-\\d{2}-\\d{4}$'
                },
                fecha_fin: {
                    type: 'string',
                    pattern: '^\\d{2}-\\d{2}-\\d{4}$'
                },
                sdm: {
                    type: 'string',
                    minLength: 3,
                    maxLength: 200
                },
                status: {
                    type: 'string',
                    enum: ['en_progreso', 'completado', 'pausado', 'cancelado']
                },
                responsable_email: {
                    type: 'string',
                    format: 'email'
                },
                notificacion: {
                    type: ['string', 'null'],
                    enum: ['pendiente', 'enviada', null]
                },
                periodo: {
                    type: 'string',
                    pattern: '^\\d{4}-\\d{2}$'
                }
            },
            required: ['id', 'id_cliente', 'fecha_inicio', 'fecha_fin', 'sdm', 'status', 'responsable_email', 'periodo'],
            additionalProperties: false
        }
    },
    required: ['operacion', 'contenido'],
    additionalProperties: false
};