const { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand, DeleteObjectsCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const logger = require('../utils/logger');

const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-2' });
const BUCKET = process.env.BUCKET_NAME;

// Helper para parsear JSON desde S3
const parseJSON = async (stream) => {
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
};

/**
 * Obtener cliente por ID desde S3
 */
exports.getClientById = async (clientId) => {
    const key = `clients/${clientId}.json`;

    try {
        const result = await s3.send(new GetObjectCommand({
            Bucket: BUCKET,
            Key: key
        }));

        const clientData = await parseJSON(result.Body);
        logger.info(`Cliente encontrado en S3: ${key}`);
        return clientData;
    } catch (error) {
        if (error.name === 'NoSuchKey') {
            logger.info(`Cliente no encontrado en S3: ${key}`);
            return null;
        }
        logger.error('Error obteniendo cliente desde S3', { error: error.message, clientId });
        throw error;
    }
};

/**
 * Obtener workload por ID desde S3
 */
exports.getWorkloadById = async (workloadId, clientId, year, month = null) => {
    const key = month 
        ? `workloads/${clientId}/${year}/${month}/${workloadId}.json`
        : `workloads/${clientId}/${year}/${workloadId}.json`;

    try {
        const result = await s3.send(new GetObjectCommand({
            Bucket: BUCKET,
            Key: key
        }));

        const workloadData = await parseJSON(result.Body);
        logger.info(`Workload encontrado en S3: ${key}`);
        return workloadData;
    } catch (error) {
        if (error.name === 'NoSuchKey') {
            logger.info(`Workload no encontrado en S3: ${key}`);
            return null;
        }
        logger.error('Error obteniendo workload desde S3', { error: error.message, workloadId, clientId, year, month });
        throw error;
    }
};

/**
 * Guardar/Actualizar cliente en S3
 */
exports.saveClient = async (clientData) => {
    const key = `clients/${clientData.id_cuenta}.json`;

    try {
        await s3.send(
            new PutObjectCommand({
                Bucket: BUCKET,
                Key: key,
                Body: JSON.stringify(clientData, null, 2),
                ContentType: 'application/json',
            })
        );

        logger.info(`Cliente guardado en S3: ${key}`);
        return { success: true, key };
    } catch (error) {
        logger.error('Error guardando cliente en S3', { error: error.message, clientId: clientData.id });
        throw error;
    }
};

/**
 * Guardar/Actualizar workload en S3
 */
exports.saveWorkload = async (workloadData, year, month = null) => {
    const key = month
        ? `workloads/${workloadData.id_cliente}/${year}/${month}/${workloadData.id}.json`
        : `workloads/${workloadData.id_cliente}/${year}/${workloadData.id}.json`;

    try {
        await s3.send(
            new PutObjectCommand({
                Bucket: BUCKET,
                Key: key,
                Body: JSON.stringify(workloadData, null, 2),
                ContentType: 'application/json',
            })
        );

        logger.info(`Workload guardado en S3: ${key}`);
        return { success: true, key };
    } catch (error) {
        logger.error('Error guardando workload en S3', {
            error: error.message,
            workloadId: workloadData.id,
            clientId: workloadData.id_cliente,
            year,
            month
        });
        throw error;
    }
};

/**
 * Eliminar workload de S3
 */
exports.deleteWorkload = async (workloadId, clientId, year, month) => {
    const key = `workloads/${clientId}/${year}/${month}/${workloadId}.json`;

    try {
        await s3.send(new DeleteObjectCommand({
            Bucket: BUCKET,
            Key: key
        }));

        logger.info(`Workload eliminado de S3: ${key}`);
        return { success: true, key };
    } catch (error) {
        logger.error('Error eliminando workload de S3', {
            error: error.message,
            workloadId,
            clientId,
            year,
            month
        });
        throw error;
    }
};

/**
 * Listar workloads en una carpeta
 */
exports.listWorkloadsInFolder = async (clientId, year, month = null) => {
    const prefix = month
        ? `workloads/${clientId}/${year}/${month}/`
        : `workloads/${clientId}/${year}/`;

    try {
        const result = await s3.send(new ListObjectsV2Command({
            Bucket: BUCKET,
            Prefix: prefix
        }));

        logger.info(`Workloads listados en ${prefix}:`, result.Contents?.length || 0);
        return result.Contents || [];
    } catch (error) {
        logger.error('Error listando workloads', {
            error: error.message,
            clientId,
            year,
            month
        });
        throw error;
    }
};

/**
 * Listar todos los objetos con un prefijo
 */
exports.listAllObjects = async (prefix) => {
    try {
        const result = await s3.send(new ListObjectsV2Command({
            Bucket: BUCKET,
            Prefix: prefix
        }));

        return result.Contents || [];
    } catch (error) {
        logger.error('Error listando objetos', {
            error: error.message,
            prefix
        });
        throw error;
    }
};

/**
 * Obtener objeto de S3
 */
exports.getObject = async (key) => {
    try {
        const result = await s3.send(new GetObjectCommand({
            Bucket: BUCKET,
            Key: key
        }));

        return await parseJSON(result.Body);
    } catch (error) {
        logger.error('Error obteniendo objeto', {
            error: error.message,
            key
        });
        throw error;
    }
};

/**
 * Guardar objeto en S3
 */
exports.putObject = async (key, body) => {
    try {
        await s3.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: body,
            ContentType: 'application/json'
        }));

        logger.info(`Objeto guardado en S3: ${key}`);
        return { success: true, key };
    } catch (error) {
        logger.error('Error guardando objeto', {
            error: error.message,
            key
        });
        throw error;
    }
};
/**
 
* Eliminar carpeta (prefijo) de S3
 */
exports.deleteFolderFromS3 = async (prefix) => {
    try {
        logger.info('Eliminando carpeta de S3', { prefix });

        // Listar todos los objetos con ese prefijo
        const objects = await exports.listAllObjects(prefix);

        if (!objects || objects.length === 0) {
            logger.info('No hay objetos para eliminar en el prefijo', { prefix });
            return { success: true, deletedCount: 0 };
        }

        logger.info('Objetos encontrados para eliminar', { 
            prefix, 
            count: objects.length,
            keys: objects.map(obj => obj.Key)
        });

        // Eliminar todos los objetos en batch
        const deleteParams = {
            Bucket: BUCKET,
            Delete: {
                Objects: objects.map(obj => ({ Key: obj.Key })),
                Quiet: false
            }
        };

        const result = await s3.send(new DeleteObjectsCommand(deleteParams));

        logger.info('Carpeta eliminada de S3', { 
            prefix, 
            deletedCount: objects.length,
            deleted: result.Deleted?.length || 0,
            errors: result.Errors?.length || 0
        });

        if (result.Errors && result.Errors.length > 0) {
            logger.error('Algunos objetos no pudieron ser eliminados', {
                prefix,
                errors: result.Errors
            });
        }

        return { success: true, deletedCount: result.Deleted?.length || 0 };
    } catch (error) {
        logger.error('Error eliminando carpeta de S3', {
            error: error.message,
            stack: error.stack,
            prefix
        });
        throw error;
    }
};
