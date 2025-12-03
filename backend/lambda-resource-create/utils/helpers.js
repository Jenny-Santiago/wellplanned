exports.extractDatePart = (fechaStr, start, end) => {
    return fechaStr.substring(start, end);
};

exports.addAndSort = (array, value) => {
    if (!array.includes(value)) {
        array.push(value);
        array.sort((a, b) => Number(a) - Number(b));
    }
    return array;
}

// Helper para convertir stream a string
exports.streamToString = (stream) => {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    });
};