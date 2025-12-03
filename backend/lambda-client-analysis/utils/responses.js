const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'OPTIONS,GET,POST',
    'Cache-Control': 'max-age=300',
    'Content-Type': 'application/json'  
};

exports.successResponse = (statusCode, message, data) => ({
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(data ? { success: true, message, data } : { success: true, message }),
});

exports.errorResponse = (statusCode, message, errors = []) => ({
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify({
        success: false,
        message,
        errors,
    }),
});