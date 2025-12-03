const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
};

exports.successResponse = (statusCode, message, data) => ({
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify({
        success: true,
        message,
        data,
    }),
});

exports.errorResponse = (statusCode, message, errors) => ({
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify({
        success: false,
        message,
        errors,
    }),
});

exports.partialSuccessResponse = (statusCode, message, data) => ({
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify({
        success: true,
        partial: true,
        message,
        data,
    }),
});
