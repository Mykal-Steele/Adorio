import mongoose from 'mongoose';
import secretEnvSchema from '../schemas/db/secretEnvSchema.js';

export const SecretEnv = mongoose.model('SecretEnv', secretEnvSchema);

export const createSecretEnv = (data) => SecretEnv.create(data);

export const findSecretByPasswordHash = (passwordHash) =>
  SecretEnv.findOne({ passwordHash }).sort({ createdAt: -1 });
