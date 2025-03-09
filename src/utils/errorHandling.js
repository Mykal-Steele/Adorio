// centralized error handling so we don't repeat ourselves everywhere
export class AbortError extends Error {
  constructor(message = "request was cancelled") {
    super(message);
    this.name = "AbortError";
  }
}

// checks if the user bailed on a request - happens all the time when ppl scroll fast
export const isAbortError = (error) => {
  return (
    error?.name === "AbortError" ||
    error?.code === "ERR_CANCELED" ||
    error?.code === "ECONNABORTED" ||
    error?.message?.includes("canceled") ||
    error?.message?.includes("cancelled")
  );
};

// our main error handler that every api call should use
export const handleApiError = (error, customMessage, context = {}) => {
  // don't need to handle abort errors, they're expected
  if (isAbortError(error)) {
    return new AbortError();
  }

  // network is down or backend unreachable
  if (!error.response) {
    console.warn("network error while making api request", { context });
    return new Error("can't reach the server. ur wifi good?");
  }

  // log details for debugging (only in development)
  if (process.env.NODE_ENV !== "production") {
    console.error(customMessage || "api error", {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      context,
    });
  }

  // whatever error message looks least terrible
  const clientError = new Error(
    error.response?.data?.message ||
      customMessage ||
      "something broke lol. try again in a bit."
  );

  // preserve status code and other useful info
  clientError.statusCode = error.response?.status;
  clientError.context = context;

  return clientError;
};
