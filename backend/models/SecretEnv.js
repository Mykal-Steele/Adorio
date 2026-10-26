import mongoose from 'mongoose';
import secretEnvSchema from '../schemas/db/secretEnvSchema.js';

export const SecretEnv = mongoose.model('SecretEnv', secretEnvSchema);

export const createSecretEnv = (data) => SecretEnv.create(data);

export const findSecretByPasswordHash = (passwordHash) =>
  SecretEnv.findOne({ passwordHash }).sort({ createdAt: -1 });

export const findSecretByName = (name) => SecretEnv.findOne({ name });

export const upsertSecretByName = (name, userId, encryptedMessage) =>
  SecretEnv.findOneAndUpdate(
    { name, userId },
    { $set: { encryptedMessage } },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
  );
