import express from 'express';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';

import corsOptions from './config/corsOptions.js';
import { environment, isProduction } from './config/environment.js';
import { connectDatabase } from './config/database.js';
import {
  standardLimiter,
  postLimiter,
  likeLimiter,
  registrationLimiter,
  authLimiter,
} from './config/rateLimiters.js';
import './config/cloudinary.js';
import errorHandler from './middleware/errorHandler.js';

import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import secretEnvRoutes from './routes/secretEnvRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { getHealthStatus } from './controllers/analyticsController.js';

process.env.TZ = 'UTC';

const app = express();

// Northflank sits behind Cloudflare (1 proxy hop)
app.set('trust proxy', 1);

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(compression());
app.options('*', cors(corsOptions));

app.use(standardLimiter);
app.use('/api/users/register', (req, res, next) => {
  if (req.method === 'POST') return registrationLimiter(req, res, next);
  return next();
});
app.use('/api/users/login', (req, res, next) => {
  if (req.method === 'POST') return authLimiter(req, res, next);
  return next();
});
app.use('/api/users/refresh-token', (req, res, next) => {
  if (req.method === 'POST') return authLimiter(req, res, next);
  return next();
});
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
app.use('/api/stats', analyticsRoutes);

app.get('/api/health', getHealthStatus);

if (!isProduction) {
  app.get('/api/test-env', (req, res) => {
    res.json({
      NODE_ENV: process.env.NODE_ENV,
      MONGO_URI: !!process.env.MONGO_URI,
      JWT_SECRET: !!process.env.JWT_SECRET,
      CLOUDINARY_NAME: process.env.CLOUDINARY_NAME,
      CLOUDINARY_KEY: !!process.env.CLOUDINARY_KEY,
      CLOUDINARY_SECRET: !!process.env.CLOUDINARY_SECRET,
      CLIENT_URL: process.env.CLIENT_URL,
      PORT: process.env.PORT,
    });
  });
}

app.get('/', (_req, res) => {
  res.send('Adorio API is running!');
});

app.use(errorHandler);

export { app };

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
