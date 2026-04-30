class ApiError extends Error {
  constructor(message, statusCode = 500, details = {}) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  static badRequest(message, details) {
    return new ApiError(message, 400, details);
  }

  static unauthorized(message = 'You are not authenticated!') {
    return new ApiError(message, 401);
  }

  static forbidden(message = 'Not allowed') {
    return new ApiError(message, 403);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(message, 404);
  }

  static tooManyRequests(message = 'Too many requests') {
    return new ApiError(message, 429);
  }

  static internalServerError(message = 'Internal server error') {
    return new ApiError(message, 500);
  }
}

export default ApiError;
