const {
  S3Client,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
  GetObjectCommand,
  PutObjectCommand
} = require('@aws-sdk/client-s3');
const logger = require('../utils/logger');
const { streamToString } = require('../utils/helpers');

const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-2' });
const BUCKET_NAME = process.env.BUCKET_NAME;

// Verifica si un objeto existe en S3

async function objectExists(key) {
  if (!BUCKET_NAME) {
    throw new Error('BUCKET_NAME no configurado');
  }

  try {
    await s3Client.send(new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    }));
    return true;
  } catch (error) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return false;
    }
    logger.error('Error verificando objeto', { key, error: error.message });
    throw error;
  }
}

// Elimina un objeto de S3
async function deleteObject(key) {
  if (!BUCKET_NAME) {
    throw new Error('BUCKET_NAME no configurado');
  }

  try {
    await s3Client.send(new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    }));

    logger.info('Objeto eliminado', { bucket: BUCKET_NAME, key });
    return { success: true, key };
  } catch (error) {
    logger.error('Error eliminando objeto', {
      bucket: BUCKET_NAME,
      key,
      error: error.message
    });
    throw error;
  }
}

// Elimina todos los objetos con un prefijo específico
async function deleteAllObjectsWithPrefix(prefix) {
  if (!BUCKET_NAME) {
    throw new Error('BUCKET_NAME no configurado');
  }

  const deletedKeys = [];

  try {
    const listCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix
    });

    const listResponse = await s3Client.send(listCommand);

    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      logger.info('No se encontraron objetos con el prefijo', { prefix });
      return deletedKeys;
    }

    // Eliminar cada objeto
    for (const obj of listResponse.Contents) {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: obj.Key
      }));

      if (!obj.Key.endsWith('/')) {
        deletedKeys.push(obj.Key);
      }

      logger.info('Objeto eliminado del lote', { key: obj.Key });
    }

    logger.info('Lote de objetos eliminados', {
      prefix,
      count: deletedKeys.length
    });

    return deletedKeys;

  } catch (error) {
    logger.error('Error eliminando objetos con prefijo', {
      prefix,
      error: error.message
    });
    throw error;
  }
}

// Lista todos los objetos dentro de un prefrix
async function listAllObjects(prefix) {
  if (!BUCKET_NAME) {
    throw new Error('BUCKET_NAME no configurado');
  }

  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix
    });

    const data = await s3Client.send(command);

    logger.info('Objetos listados', {
      prefix,
      count: data.Contents?.length || 0
    });

    return data.Contents || [];
  } catch (error) {
    logger.error('Error listando objetos en S3', {
      prefix,
      error: error.message
    });
    throw error;
  }
}

// Obtiene el contenido de un objeto desde S3
async function getObject(key) {
  if (!BUCKET_NAME) {
    throw new Error('BUCKET_NAME no configurado');
  }

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });

    const response = await s3Client.send(command);

    // Convertir el stream a string
    const bodyContents = await streamToString(response.Body);

    logger.info('Objeto obtenido de S3', { key });
    return bodyContents;
  } catch (error) {
    logger.error('Error obteniendo objeto de S3', {
      key,
      error: error.message
    });
    throw error;
  }
}

// Guarda/actualiza un objeto en S3
async function putObject(key, content, contentType = 'application/json') {
  if (!BUCKET_NAME) {
    throw new Error('BUCKET_NAME no configurado');
  }

  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: content,
      ContentType: contentType
    });

    await s3Client.send(command);

    logger.info('Objeto guardado en S3', { key });
  } catch (error) {
    logger.error('Error guardando objeto en S3', {
      key,
      error: error.message
    });
    throw error;
  }
}

module.exports = {
  objectExists,
  deleteObject,
  deleteAllObjectsWithPrefix,
  listAllObjects,
  getObject,
  putObject
};