import crypto from 'crypto';
import { promisify } from 'util';
import ApiError from '../utils/ApiError.js';
import validate from '../utils/validate.js';
import { createSecretSchema, secretNameSchema } from '../schemas/index.js';
import {
  findUserById,
  createSecretEnv,
  findSecretByPasswordHash,
  findSecretByName,
  upsertSecretByName,
} from '../models/index.js';

const scrypt = promisify(crypto.scrypt);
const SCRYPT_OPTIONS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const V1 = 'v1';

const additionalData = (name, userId) => Buffer.from(`${V1}|${name}|${userId}`);

const encryptV1 = async (message, passphrase, name, userId) => {
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const key = await scrypt(passphrase, salt, 32, SCRYPT_OPTIONS);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  cipher.setAAD(additionalData(name, userId));
  const ciphertext = Buffer.concat([cipher.update(message, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    V1,
    salt.toString('hex'),
    iv.toString('hex'),
    tag.toString('hex'),
    ciphertext.toString('hex'),
  ].join(':');
};

const decryptV1 = async (stored, passphrase, name, userId) => {
  const [version, saltHex, ivHex, tagHex, cipherHex] = stored.split(':');
  if (version !== V1 || !saltHex || !ivHex || !tagHex || !cipherHex) {
    throw ApiError.badRequest('Unsupported secret format');
  }

  const salt = Buffer.from(saltHex, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const key = await scrypt(passphrase, salt, 32, SCRYPT_OPTIONS);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAAD(additionalData(name, userId));
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(cipherHex, 'hex')),
    decipher.final(),
  ]);
  return plaintext.toString('utf8');
};

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
  const { name, message, password } = validate(createSecretSchema, rawBody);

  const user = await findUserById(userId);
  if (!user) throw ApiError.notFound('User not found');

  if (name) {
    const encryptedMessage = await encryptV1(message, password, name, String(user._id));

    try {
      await upsertSecretByName(name, user._id, encryptedMessage);
    } catch (err) {
      if (err?.code === 11000) throw ApiError.conflict('That project name is already taken');
      throw err;
    }

    return { name };
  }

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

export const retrieveNamedSecretMessage = async ({ name, passphrase }) => {
  const { name: safeName } = validate(secretNameSchema, { name });

  if (!passphrase) throw ApiError.unauthorized('Passphrase is required');

  const secretEnv = await findSecretByName(safeName);
  if (!secretEnv || !secretEnv.encryptedMessage.startsWith(`${V1}:`)) {
    throw ApiError.notFound('No secret found for that project name or passphrase');
  }

  try {
    return await decryptV1(
      secretEnv.encryptedMessage,
      passphrase,
      safeName,
      String(secretEnv.userId),
    );
  } catch {
    throw ApiError.notFound('No secret found for that project name or passphrase');
  }
};
