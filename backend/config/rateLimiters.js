import rateLimit from 'express-rate-limit';

const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // per-IP keys rely on trust proxy in index.js
});

const postLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: {
    error: 'Too many posts created from this IP, please try again later.',
    retryAfter: '10 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const likeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: {
    error: 'Too many like actions from this IP, please slow down.',
    retryAfter: '1 minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    error: 'Too many accounts created from this IP, please try again later.',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// login and refresh
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const secretLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  message: {
    error: 'Too many secret retrieval attempts, please try again later.',
    retryAfter: '5 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: {
    error: 'Too many file uploads from this IP, please try again later.',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Keyed on the user, not the IP, so a shared network can't dodge it. Tight
// because each presign can reserve up to 100 MB of the storage cap.
const hostedUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.user.id,
  message: {
    error: 'Upload limit reached — 10 uploads per hour, please try again later.',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// tight because every run costs real compute on Piston
const codingLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  message: {
    error: 'Too many code runs from this IP, please slow down.',
    retryAfter: '5 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Runner status/start. Per account, not per IP, because these routes need a
// login and a whole class often shares one school IP. A page waiting on a
// start polls about 6 times a minute.
const codeRunnerLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  keyGenerator: (req) => req.user.id,
  message: {
    error: 'Too many code runner requests, please slow down.',
    retryAfter: '1 minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Mention autocomplete. Typing one name fires about 4-8 debounced requests, so
// 60/min is plenty for people but stops scripts dumping the user collection.
const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: {
    error: 'Too many search requests from this IP, please slow down.',
    retryAfter: '1 minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// looser than postLimiter, entering lots of transactions quickly is normal
const financeWriteLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  message: {
    error: 'Too many finance changes from this IP, please try again later.',
    retryAfter: '10 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export {
  standardLimiter,
  postLimiter,
  likeLimiter,
  registrationLimiter,
  authLimiter,
  secretLimiter,
  uploadLimiter,
  hostedUploadLimiter,
  codingLimiter,
  codeRunnerLimiter,
  searchLimiter,
  financeWriteLimiter,
};
