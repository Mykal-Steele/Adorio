import express from 'express';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import serverless from 'serverless-http';

import corsOptions from './config/corsOptions.js';
import { environment, isProduction } from './config/environment.js';
import { connectDatabase } from './config/database.js';
import {
  standardLimiter,
  postLimiter,
  likeLimiter,
} from './config/rateLimiters.js';
import './config/cloudinary.js';
import errorHandler from './middleware/errorHandler.js';

import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import secretEnvRoutes from './routes/secretEnvRoutes.js';
import visitorIdentifier from './middleware/visitorIdentifier.js';
import { optional, protect } from './middleware/verifyToken.js';
import {
  trackVisit,
  getPageViewSummary,
  getRecentVisitEntries,
  getVisitorSummary,
  getVisitorDetailsInfo,
  getHealthStatus,
  getSystemStats,
} from './controllers/analyticsController.js';

process.env.TZ = 'UTC';

const app = express();

// Configure trust proxy for production deployments (Render, Heroku, Cloudflare, etc.)
// This allows express-rate-limit and other middleware to properly handle X-Forwarded-For headers
const configureTrustProxy = () => {
  // Allow override via environment variable
  if (process.env.TRUST_PROXY) {
    const trustValue = process.env.TRUST_PROXY;
    if (trustValue === 'true' || trustValue === '1') {
      return true;
    } else if (trustValue === 'false' || trustValue === '0') {
      return false;
    } else if (!isNaN(trustValue)) {
      return parseInt(trustValue, 10);
    } else {
      return trustValue; // String value (e.g., IP address)
    }
  }

  // Default configuration based on environment
  if (process.env.NODE_ENV === 'production') {
    // Common cloud platforms
    if (
      process.env.RENDER ||
      process.env.HEROKU_APP_NAME ||
      process.env.VERCEL
    ) {
      return 1; // Trust the first proxy
    }
    // For Cloudflare or multiple proxies
    if (process.env.CF_RAY || process.env.CLOUDFLARE) {
      return 2; // Trust up to 2 proxies
    }
    return 1; // Default for production
  } else {
    // In development, trust all proxies for flexibility
    return true;
  }
};

const trustProxyValue = configureTrustProxy();
app.set('trust proxy', trustProxyValue);

// Log proxy configuration in production for debugging
if (process.env.NODE_ENV === 'production') {
  console.log(`Trust proxy configured: ${trustProxyValue}`);
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(compression());
app.options('*', cors(corsOptions));

app.use(standardLimiter);
app.use('/api/posts/:id/like', likeLimiter);
app.use('/api/posts', (req, res, next) => {
  if (req.method === 'POST') {
    return postLimiter(req, res, next);
  }
  return next();
});

app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/secretenv', secretEnvRoutes);
app.post('/api/analytics/track', visitorIdentifier, optional, trackVisit);
app.get('/api/analytics/page-views', optional, getPageViewSummary);
app.get('/api/analytics/recent', optional, getRecentVisitEntries);

app.post('/api/metrics/track', visitorIdentifier, optional, trackVisit);
app.get('/api/metrics/page-views', optional, getPageViewSummary);
app.get('/api/metrics/recent', optional, getRecentVisitEntries);

app.post('/api/stats/track', visitorIdentifier, optional, trackVisit);
app.get('/api/stats/page-views', optional, getPageViewSummary);
app.get('/api/stats/recent', optional, getRecentVisitEntries);
app.get('/api/stats/visitor-stats', optional, getVisitorSummary);
app.get('/api/stats/visitor/:visitorId', optional, getVisitorDetailsInfo);

// Health and monitoring endpoints
app.get('/api/health', getHealthStatus);
app.get('/api/stats/system', optional, getSystemStats);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, 'dist')));

app.get('/', (_req, res) => {
  res.send('Feelio API is running!');
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.use(errorHandler);

const handler = serverless(app);
export { handler, app };

const startServer = async () => {
  try {
    await connectDatabase();
    const port = environment.port;
    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (error) {
    console.error('Failed to start server', error);
  }
};

startServer();
