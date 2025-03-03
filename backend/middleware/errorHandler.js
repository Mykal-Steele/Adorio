// Create this new file
const errorHandler = (err, req, res, next) => {
  console.error(`Error: ${err.message}`);

  // Add client reconciliation metadata
  let response = {
    message: err.message || "Server error",
    status: err.status || 500,
  };

  // For optimistic UI operations, include additional info
  if (req.body && req.body.optimisticId) {
    response.optimisticId = req.body.optimisticId;
    response.operationType = req.body.operationType || "unknown";
  }

  res.status(response.status).json(response);
};

export default errorHandler;
