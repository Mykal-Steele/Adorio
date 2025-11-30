import rateLimit from 'express-rate-limit';

// Standard rate limiter - 300 requests per 15 minutes
const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Trust proxy is now set in the main Express app, so this will work correctly
});

// Post creation limiter - 30 posts per 10 minutes
const postLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30, // Limit each IP to 30 post creations per windowMs
  message: {
    error: 'Too many posts created from this IP, please try again later.',
    retryAfter: '10 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Like action limiter - 60 likes per minute
const likeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 like actions per windowMs
  message: {
    error: 'Too many like actions from this IP, please slow down.',
    retryAfter: '1 minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export { standardLimiter, postLimiter, likeLimiter };
