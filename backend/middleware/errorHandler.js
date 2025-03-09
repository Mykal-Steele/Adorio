const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;

  const errorResponse = {
    message: err.message || "shit broke lol",
    status: statusCode,
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
  };

  // adding this for the frontend so it can fix itself when things break
  if (req.body && req.body.optimisticId) {
    errorResponse.optimisticId = req.body.optimisticId;
    errorResponse.operationType = req.body.operationType || "unknown";
    errorResponse.originalData = req.body.originalData;
  }

  // dump everything when i'm debugging locally
  if (process.env.NODE_ENV !== "production") {
    console.error(`[${new Date().toISOString()}] Error:`, {
      path: req.path,
      method: req.method,
      error: err.message,
      stack: err.stack,
      body: req.body,
    });
  } else {
    // keep logs clean in prod, my hosting plan has limited storage lol
    console.error(
      `[${new Date().toISOString()}] ${statusCode} error: ${err.message} (${
        req.method
      } ${req.path})`
    );
  }

  res.status(statusCode).json(errorResponse);
};

export default errorHandler;
