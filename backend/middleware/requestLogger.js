const requestLogger = (req, res, next) => {
  if (!req.originalUrl.startsWith('/api')) {
    return next();
  }

  const startTime = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startTime) / 1e6;
    console.log(
      `[API] [${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs.toFixed(1)}ms`
    );
  });

  next();
};

export default requestLogger;