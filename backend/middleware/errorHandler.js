// Enhance the error handler with detailed information

const errorHandler = (err, req, res, next) => {
  // Set appropriate status code
  const statusCode = err.status || err.statusCode || 500;

  // Prepare useful error info
  const errorResponse = {
    message: err.message || "Server error occurred",
    status: statusCode,
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
  };

  // Add client reconciliation metadata for optimistic UI updates
  if (req.body && req.body.optimisticId) {
    errorResponse.optimisticId = req.body.optimisticId;
    errorResponse.operationType = req.body.operationType || "unknown";
    errorResponse.originalData = req.body.originalData;
  }

  // Log error details in development
  if (process.env.NODE_ENV !== "production") {
    console.error(`[${new Date().toISOString()}] Error:`, {
      path: req.path,
      method: req.method,
      error: err.message,
      stack: err.stack,
      body: req.body,
    });
  } else {
    // In production, log less verbose info
    console.error(
      `[${new Date().toISOString()}] ${statusCode} error: ${err.message} (${
        req.method
      } ${req.path})`
    );
  }

  res.status(statusCode).json(errorResponse);
};

export default errorHandler;
