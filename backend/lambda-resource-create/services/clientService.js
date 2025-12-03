const { GetObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const { pathExists } = require("./s3Service");
const { streamToString } = require("../utils/helpers");

const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-2' });
const BUCKET_NAME = process.env.BUCKET_NAME;

// Verifica si un cliente existe
exports.clientExists = async (idCuenta) => {
    const clientFile = `clients/${idCuenta}.json`;
    return await pathExists(clientFile);
};


// Obtiene datos de un cliente
exports.getClient = async (idCuenta) => {
    const clientFile = `clients/${idCuenta}.json`;

    try {
        const response = await s3.send(new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: clientFile
        }));

        const bodyContents = await streamToString(response.Body);
        return JSON.parse(bodyContents);
    } catch (error) {
        if (error.name === 'NoSuchKey') {
            throw new Error(`El cliente con ID ${idCuenta} no existe`);
        }
        throw error;
    }
};

