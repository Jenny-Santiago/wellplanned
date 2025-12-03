function successResponse(statusCode = 200, title = 'OK', data = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS,DELETE',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization'
    },
    body: JSON.stringify({
      success: true,
      title,
      data
    })
  };
}

function errorResponse(statusCode = 500, title = 'Error', errors = []) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS,DELETE',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization'
    },
    body: JSON.stringify({
      success: false,
      title,
      errors
    })
  };
}

module.exports = {
  successResponse,
  errorResponse
};