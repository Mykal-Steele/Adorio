export class ApiClientError extends Error {
  statusCode?: number;
  context?: object;
  constructor(message: string) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export class AbortError extends Error {
  constructor(message = "request was cancelled") {
    super(message);
    this.name = "AbortError";
  }
}

export const isAbortError = (error) => {
  return (
    error?.name === "AbortError" ||
    error?.code === "ERR_CANCELED" ||
    error?.code === "ECONNABORTED" ||
    error?.message?.includes("canceled") ||
    error?.message?.includes("cancelled")
  );
};

export const handleApiError = (error, customMessage, context = {}) => {
  if (isAbortError(error)) {
    return new AbortError();
  }

  if (!error.response) {
    console.warn("network error while making api request", { context });
    return new Error("Unable to reach the server. Please check your connection.");
  }

  if (process.env.NODE_ENV !== "production") {
    console.error(customMessage || "api error", {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      context,
    });
  }

  const clientError = new ApiClientError(
    error.response?.data?.message ||
      customMessage ||
      "Something went wrong. Please try again."
  );

  clientError.statusCode = error.response?.status;
  clientError.context = context;

  return clientError;
};
