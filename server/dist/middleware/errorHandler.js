export const createError = (message, statusCode = 500) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
};
export const errorHandler = (error, req, res, next) => {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    // Log error details
    console.error('Error occurred:', {
        message,
        statusCode,
        stack: error.stack,
        url: req.url,
        method: req.method,
        body: req.body,
        sessionId: req.body?.sessionId,
        timestamp: new Date().toISOString()
    });
    // Send error response
    const response = {
        success: false,
        error: message,
        timestamp: new Date().toISOString()
    };
    res.status(statusCode).json(response);
};
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
// 404 handler
export const notFoundHandler = (req, res) => {
    const response = {
        success: false,
        error: 'Endpoint not found',
        timestamp: new Date().toISOString()
    };
    res.status(404).json(response);
};
//# sourceMappingURL=errorHandler.js.map