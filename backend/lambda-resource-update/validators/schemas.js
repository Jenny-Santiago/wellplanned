// Schema para crear cliente individual (con o sin cargas de trabajo)
exports.CLI_I_SCHEMA = {
    type: 'object',
    properties: {
        operacion: { type: 'string', const: 'CLI_I' },
        contenido: {
            type: 'object',
            properties: {
                id_cuenta: { type: 'string', minLength: 8 },
                cliente: { type: 'string', minLength: 3 },
                tipo_proyecto: { type: 'string', minLength: 2 },
                compromiso: { type: 'string' },
                workloads: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            fecha_inicio: { type: 'string', pattern: '^\\d{2}-\\d{2}-\\d{4}$' },
                            fecha_fin: { type: 'string', pattern: '^\\d{2}-\\d{2}-\\d{4}$' },
                            sdm: { type: 'string', minLength: 3 },
                            status: { type: 'string', enum: ['en_progreso', 'completado', 'pausado', 'cancelado'] },
                            responsable: { type: 'string', format: 'email' }
                        },
                        required: ['fecha_inicio', 'fecha_fin', 'sdm', 'status', 'responsable'],
                        additionalProperties: false
                    }
                }
            },
            required: ['id_cuenta', 'cliente', 'tipo_proyecto'],
            additionalProperties: false
        }
    },
    required: ['operacion', 'contenido'],
    additionalProperties: false
};

// Schema para crear múltiples clientes (cada uno con o sin cargas de trabajo) – mínimo 2 clientes
exports.CLI_L_SCHEMA = {
    type: 'object',
    properties: {
        operacion: { type: 'string', const: 'CLI_L' },
        contenido: {
            type: 'array',
            minItems: 2, // ⚡ mínimo 2 clientes para considerarse lote
            items: {
                type: 'object',
                properties: {
                    id_cuenta: { type: 'string', minLength: 8 },
                    cliente: { type: 'string', minLength: 3 },
                    tipo_proyecto: { type: 'string', minLength: 2 },
                    compromiso: { type: 'string' },
                    workloads: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                fecha_inicio: { type: 'string', pattern: '^\\d{2}-\\d{2}-\\d{4}$' },
                                fecha_fin: { type: 'string', pattern: '^\\d{2}-\\d{2}-\\d{4}$' },
                                sdm: { type: 'string', minLength: 3 },
                                status: { type: 'string', enum: ['en_progreso', 'completado', 'pausado', 'cancelado'] },
                                responsable: { type: 'string', format: 'email' }
                            },
                            required: ['fecha_inicio', 'fecha_fin', 'sdm', 'status', 'responsable'],
                            additionalProperties: false
                        }
                    }
                },
                required: ['id_cuenta', 'cliente', 'tipo_proyecto'],
                additionalProperties: false
            }
        }
    },
    required: ['operacion', 'contenido'],
    additionalProperties: false
};

// Schema para crear workload individual
exports.WL_I_SCHEMA = {
    type: 'object',
    properties: {
        operacion: { type: 'string', const: 'WL_I' },
        contenido: {
            type: 'object',
            properties: {
                id_cliente: { type: 'string', minLength: 8 },
                fecha_inicio: { type: 'string', pattern: '^\\d{2}-\\d{2}-\\d{4}$' },
                fecha_fin: { type: 'string', pattern: '^\\d{2}-\\d{2}-\\d{4}$' },
                sdm: { type: 'string', minLength: 3 },
                status: { type: 'string', enum: ['en_progreso', 'completado', 'pausado', 'cancelado'] },
                responsable: { type: 'string', format: 'email' }
            },
            required: ['id_cliente', 'fecha_inicio', 'fecha_fin', 'sdm', 'status', 'responsable'],
            additionalProperties: false
        }
    },
    required: ['operacion', 'contenido'],
    additionalProperties: false
};

// Schema para crear workloads en lote
exports.WL_L_SCHEMA = {
    type: 'object',
    properties: {
        operacion: { type: 'string', const: 'WL_L' },
        contenido: {
            type: 'array',
            minItems: 1,
            items: {
                type: 'object',
                properties: {
                    id_cliente: { type: 'string', minLength: 8 },
                    fecha_inicio: { type: 'string', pattern: '^\\d{2}-\\d{2}-\\d{4}$' },
                    fecha_fin: { type: 'string', pattern: '^\\d{2}-\\d{2}-\\d{4}$' },
                    sdm: { type: 'string', minLength: 3 },
                    status: { type: 'string', enum: ['en_progreso', 'completado', 'pausado', 'cancelado'] },
                    responsable: { type: 'string', format: 'email' }
                },
                required: ['id_cliente', 'fecha_inicio', 'fecha_fin', 'sdm', 'status', 'responsable'],
                additionalProperties: false
            }
        }
    },
    required: ['operacion', 'contenido'],
    additionalProperties: false
};
