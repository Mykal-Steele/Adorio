import crypto from 'crypto';
import ApiError from '../utils/ApiError.js';
import validate from '../utils/validate.js';
import { createSecretSchema } from '../schemas/index.js';
import { findUserById, createSecretEnv, findSecretByPasswordHash } from '../models/index.js';

const encryptMessage = (message, password) => {
  const salt = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(password, salt, 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(message, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${salt.toString('hex')}:${iv.toString('hex')}:${encrypted}`;
};

const decryptMessage = (stored, password) => {
  try {
    const [saltHex, ivHex, cipherHex] = stored.split(':');
    const salt = Buffer.from(saltHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const key = crypto.scryptSync(password, salt, 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(cipherHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    throw ApiError.badRequest('Failed to decrypt message');
  }
};

const hashPassword = (password) => {
  if (!process.env.JWT_SECRET) throw ApiError.internalServerError('JWT_SECRET not configured');
  return crypto.pbkdf2Sync(password, process.env.JWT_SECRET, 310000, 32, 'sha256').toString('hex');
};

export const createSecretMessage = async ({ userId, rawBody }) => {
  const { message, password } = validate(createSecretSchema, rawBody);

  const user = await findUserById(userId);
  if (!user) throw ApiError.notFound('User not found');

  const realPassword = `${password}${user.email}`;
  const encryptedMessage = encryptMessage(message, realPassword);
  const passwordHash = hashPassword(realPassword);

  const secretEnv = await createSecretEnv({ encryptedMessage, userId, passwordHash });
  return { secretEnv, realPassword };
};

export const retrieveSecretMessage = async (realPassword) => {
  const passwordHash = hashPassword(realPassword);
  const secretEnv = await findSecretByPasswordHash(passwordHash);

  if (!secretEnv) throw ApiError.notFound('No message found or incorrect password');

  return decryptMessage(secretEnv.encryptedMessage, realPassword);
};
