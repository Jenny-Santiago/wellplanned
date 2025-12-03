const { S3Client, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');
const logger = require('../utils/logger');
const { streamToString } = require('../utils/helpers');

const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-2' });
const BUCKET_NAME = process.env.BUCKET_NAME;

// Lista todos los objetos con un prefijo específico
exports.listObjects = async (prefix) => {
    const objects = [];
    let continuationToken = null;

    do {
        const command = new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: prefix,
            ContinuationToken: continuationToken
        });

        const response = await s3.send(command);
        
        if (response.Contents) {
            objects.push(...response.Contents);
        }

        continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    return objects;
};

// Lee un objeto JSON de S3
exports.getObject = async (key) => {
    try {
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key
        });

        const response = await s3.send(command);
        const bodyString = await streamToString(response.Body);
        return JSON.parse(bodyString);
    } catch (error) {
        logger.warn('Error leyendo objeto', { key, error: error.message });
        throw error;
    }
};
