import { isProduction } from '../config/environment.js';

const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || err.status || 500;

  const errorResponse = {
    message: err.message || 'Something went wrong',
    status: statusCode,
  };

  if (err.details) {
    errorResponse.details = err.details;
  }

  if (!isProduction) {
    errorResponse.stack = err.stack;
  }

  if (req.body?.optimisticId) {
    errorResponse.optimisticId = req.body.optimisticId;
    errorResponse.operationType = req.body.operationType || 'unknown';
    errorResponse.originalData = req.body.originalData;
  }

  const logPayload = {
    path: req.path,
    method: req.method,
    statusCode,
    message: err.message,
  };

  if (!isProduction) {
    logPayload.body = req.body;
    logPayload.stack = err.stack;
    console.error(`[${new Date().toISOString()}] API error`, logPayload);
  } else {
    console.error(
      `[${new Date().toISOString()}] ${statusCode} error: ${err.message} (${
        req.method
      } ${req.path})`
    );
  }

  res.status(statusCode).json(errorResponse);
};

export default errorHandler;
