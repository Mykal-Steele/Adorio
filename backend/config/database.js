import mongoose from 'mongoose';
import { environment, isProduction } from './environment.js';

const wait = (delayMs) =>
  new Promise((resolve) => setTimeout(resolve, delayMs));

const connectDatabase = async ({ retries = 5, delayMs = 5000 } = {}) => {
  if (!environment.mongoUri) {
    throw new Error(
      'MONGO_URI is not configured. Cannot connect to the database.'
    );
  }

  let attempt = 0;

  while (attempt <= retries) {
    try {
      await mongoose.connect(environment.mongoUri);
      console.log('Connected to MongoDB');
      return mongoose.connection;
    } catch (error) {
      attempt += 1;
      const attemptsLeft = retries - (attempt - 1);
      console.error('MongoDB connection error:', error.message);

      if (attempt > retries) {
        console.error('Failed to connect to MongoDB after multiple attempts.');
        if (isProduction) {
          console.error(
            'Shutting down server due to database connection failure.'
          );
          process.exit(1);
        }
        throw error;
      }

      console.warn(
        `Retrying connection in ${
          delayMs / 1000
        }s... (${attemptsLeft} attempts left)`
      );
      await wait(delayMs);
    }
  }
};

export { connectDatabase };
