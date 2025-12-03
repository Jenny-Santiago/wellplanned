const { S3Client, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({ region: 'us-east-2' });
const BUCKET_NAME = process.env.BUCKET_NAME;

exports.handler = async (event) => {
    try {
        // Verificar si hay query parameter id
        const clienteId = event.queryStringParameters?.id;

        if (clienteId) {
            // Buscar solo ese cliente
            const key = `clients/${clienteId}.json`;

            try {
                const getResponse = await s3.send(new GetObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: key
                }));

                const content = await getResponse.Body.transformToString();
                const cliente = JSON.parse(content);

                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({
                        clientes: [{
                            id_cuenta: cliente.id_cuenta,
                            nombre: cliente.cliente,
                            tipo_proyecto: cliente.tipo_proyecto,
                            compromiso: cliente.compromiso
                        }]
                    })
                };

            } catch (err) {
                return {
                    statusCode: 404,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({ error: `Cliente con id ${clienteId} no encontrado` })
                };
            }
        }

        // Si no hay id, listar todos
        const listResponse = await s3.send(new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: 'clients/',
        }));

        if (!listResponse.Contents || listResponse.Contents.length === 0) {
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ clientes: [] })
            };
        }

        const clientes = [];

        for (const item of listResponse.Contents) {
            if (item.Key.endsWith('.json')) {
                const getResponse = await s3.send(new GetObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: item.Key
                }));

                const content = await getResponse.Body.transformToString();
                const cliente = JSON.parse(content);

                clientes.push({
                    id_cuenta: cliente.id_cuenta,
                    cliente: cliente.cliente,
                    tipo_proyecto: cliente.tipo_proyecto,
                    compromiso: cliente.compromiso,
                    workloads_resumen: cliente.workloads_resumen
                });
            }
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ clientes })
        };

    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Error al obtener clientes' })
        };
    }
};
