import crypto from 'crypto';
import SecretEnv from '../models/SecretEnv.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';

const deriveKeyMaterial = (password) => ({
  key: crypto.scryptSync(password, 'salt', 32),
  iv: crypto.createHash('sha256').update(password).digest().slice(0, 16),
});

const encryptMessage = (message, password) => {
  const { key, iv } = deriveKeyMaterial(password);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(message, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

const decryptMessage = (encryptedMessage, password) => {
  try {
    const { key, iv } = deriveKeyMaterial(password);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedMessage, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    throw ApiError.badRequest('Failed to decrypt message');
  }
};

const hashPassword = (password) =>
  crypto.createHash('sha256').update(password).digest('hex');

const createSecretMessage = async ({ userId, message, password }) => {
  if (!message || !password) {
    throw ApiError.badRequest('Message and password are required');
  }

  const user = await User.findById(userId);

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const realPassword = `${password}${user.username}`;
  const encryptedMessage = encryptMessage(message, realPassword);
  const passwordHash = hashPassword(realPassword);

  const secretEnv = await SecretEnv.create({
    encryptedMessage,
    userId,
    passwordHash,
  });

  return { secretEnv, realPassword };
};

const retrieveSecretMessage = async (realPassword) => {
  const passwordHash = hashPassword(realPassword);
  const secretEnv = await SecretEnv.findOne({ passwordHash }).sort({
    createdAt: -1,
  });

  if (!secretEnv) {
    throw ApiError.notFound('No message found or incorrect password');
  }

  const decryptedMessage = decryptMessage(
    secretEnv.encryptedMessage,
    realPassword
  );
  return decryptedMessage;
};

export { createSecretMessage, retrieveSecretMessage };
