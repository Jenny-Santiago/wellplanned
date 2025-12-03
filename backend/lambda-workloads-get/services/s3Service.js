const { S3Client, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');
const logger = require('./utils/logger');

const s3 = new S3Client({ region: 'us-east-2' });
const BUCKET_NAME = process.env.BUCKET_NAME;

// Obtiene todos los años disponibles para un cliente (carpetas en S3).
exports.getAvailableYears = async (clientId) => {
    const clientPath = `workloads/${clientId}/`;

    try {
        logger.info('Listando años disponibles del cliente', { clientId, bucket: BUCKET_NAME });

        const response = await s3.send(new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: clientPath,
            Delimiter: '/',
        }));

        const availableYears = (response.CommonPrefixes || [])
            .map(prefix => {
                const match = prefix.Prefix.match(/\/(\d{4})\//);
                return match ? parseInt(match[1]) : null;
            })
            .filter(y => y !== null)
            .sort((a, b) => b - a);

        logger.info('Años encontrados correctamente', { clientId, total: availableYears.length, availableYears });

        return availableYears;
    } catch (error) {
        logger.error('Error al obtener años disponibles', { clientId, error: error.message });
        const err = new Error(`No se pudieron listar los años del cliente ${clientId}`);
        err.statusCode = 500;
        throw err;
    }
};

// Obtiene todos los workloads de un año específico para un cliente.
exports.getWorkloadsForYear = async (clientId, year) => {
    const workloadsPath = `workloads/${clientId}/${year}/`;

    try {
        logger.info('Listando workloads del año', { clientId, year });

        const response = await s3.send(new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: workloadsPath,
        }));

        if (!response.Contents || response.Contents.length === 0) {
            logger.warn('No se encontraron workloads para el año indicado', { clientId, year });
            return [];
        }

        const workloads = [];

        for (const item of response.Contents) {
            if (item.Key.endsWith('.json')) {
                try {
                    const getResponse = await s3.send(new GetObjectCommand({
                        Bucket: BUCKET_NAME,
                        Key: item.Key
                    }));

                    const content = await getResponse.Body.transformToString();
                    const workload = JSON.parse(content);
                    const fileId = item.Key.split('/').pop().replace('.json', '');

                    workloads.push({
                        id: fileId,
                        periodo: year,
                        ...workload
                    });
                } catch (fileError) {
                    logger.error(`Error al leer archivo ${item.Key}`, { error: fileError.message });
                }
            }
        }

        logger.info('Workloads obtenidos correctamente', { clientId, year, total: workloads.length });
        return workloads;
    } catch (error) {
        logger.error('Error al obtener workloads del año', { clientId, year, error: error.message });
        const err = new Error(`No se pudieron obtener workloads del año ${year}`);
        err.statusCode = 500;
        throw err;
    }
};

// Obtiene un workload específico por ID.
exports.getSpecificWorkload = async (clientId, year, workloadId) => {
    const key = `workloads/${clientId}/${year}/${workloadId}.json`;

    try {
        logger.info('Buscando workload específico', { clientId, year, workloadId, key });

        const response = await s3.send(new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key
        }));

        const content = await response.Body.transformToString();
        const workload = JSON.parse(content);

        logger.info('Workload encontrado correctamente', { clientId, year, workloadId });

        return {
            id: workloadId,
            periodo: year,
            ...workload
        };
    } catch (error) {
        if (error.name === 'NoSuchKey') {
            logger.warn('Workload no encontrado', { clientId, year, workloadId });
            const err = new Error('Workload no encontrado');
            err.statusCode = 404;
            throw err;
        }

        logger.error('Error al obtener workload específico', { clientId, year, workloadId, error: error.message });
        const err = new Error(`Error al obtener workload ${workloadId}`);
        err.statusCode = 500;
        throw err;
    }
};
