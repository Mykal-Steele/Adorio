import express from 'express';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import serverless from 'serverless-http';

import corsOptions from './config/corsOptions.js';
import { environment } from './config/environment.js';
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

process.env.TZ = 'UTC';

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
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
export { handler };

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
