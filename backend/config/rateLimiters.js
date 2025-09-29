import rateLimit from 'express-rate-limit';

const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
});

const postLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
});

const likeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
});

export { standardLimiter, postLimiter, likeLimiter };
