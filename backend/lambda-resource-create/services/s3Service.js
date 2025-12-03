const { S3Client, HeadObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const logger = require('../utils/logger');

const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-2' });
const BUCKET_NAME = process.env.BUCKET_NAME;

// Verifica si existe un objeto en S3
const pathExists = async (key) => {
    try {
        await s3.send(new HeadObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
        return true;
    } catch (error) {
        if (error.name === 'NotFound' || error.name === 'NoSuchKey') {
            return false;
        }
        throw error;
    }
};

// Crea una "carpeta" en S3
const createFolder = async (key) => {
    const folderKey = key.endsWith('/') ? key : `${key}/`;
    await s3.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: folderKey,
        Body: '',
        ContentType: 'application/x-directory'
    }));
    logger.info(`Carpeta creada: ${folderKey}`);
};

// Guarda un recurso en S3
exports.saveResource = async (path, metadata) => {
    await s3.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: path,
        Body: JSON.stringify(metadata, null, 2),
        ContentType: 'application/json'
    }));
};

// Asegura que exista la carpeta en el path especifico
exports.ensureFolder = async (path) => {
    const exists = await pathExists(path);
    if (!exists) {
        await createFolder(path);
    }
};

exports.pathExists = pathExists;
exports.createFolder = createFolder;