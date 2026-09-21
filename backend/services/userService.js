import bcrypt from 'bcryptjs';
import ApiError from '../utils/ApiError.js';
import validate from '../utils/validate.js';
import { environment } from '../config/environment.js';
import { registerSchema, loginSchema, searchUsersQuerySchema } from '../schemas/index.js';
import {
  findUserByEmailOrUsername,
  createUser,
  findUserById as dbFindUserById,
  findUserByEmail,
  deleteUserById,
  deleteStaleTestUsers,
  searchUsersByUsernamePrefix,
} from '../models/index.js';

export const sanitizeUser = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  isAdmin: user.isAdmin ?? false,
});

export const createUserAccount = async (rawBody) => {
  const { username, email, password } = validate(registerSchema, rawBody);

  const existing = await findUserByEmailOrUsername(email, username);
  if (existing) {
    const message = existing.email === email ? 'Email already exists' : 'Username already exists';
    throw ApiError.badRequest(message);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await createUser({ username, email, password: hashedPassword });

  return sanitizeUser(user);
};

export const findUserById = async (id, options) => {
  const user = await dbFindUserById(id, options);
  if (!user) throw ApiError.notFound('User not found');
  return user;
};

export const deleteUserAccount = async (userId) => {
  const user = await dbFindUserById(userId);
  if (!user) throw ApiError.notFound('User not found');
  await deleteUserById(userId);
};

export const cleanupStaleTestUsers = async () => {
  const createdBefore = new Date(Date.now() - environment.testUserTtlMinutes * 60000);
  const result = await deleteStaleTestUsers({ createdBefore });
  return { deletedCount: result.deletedCount ?? 0 };
};

export const searchUsers = async (rawQuery) => {
  const { q } = validate(searchUsersQuerySchema, rawQuery);
  const users = await searchUsersByUsernamePrefix(q);
  return users.map((u) => ({ _id: u._id, username: u.username }));
};

export const authenticateUser = async (rawBody) => {
  const { email, password } = validate(loginSchema, rawBody);

  const user = await findUserByEmail(email);
  if (!user) throw ApiError.unauthorized('Invalid credentials');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw ApiError.unauthorized('Invalid credentials');

  return { user, sanitizedUser: sanitizeUser(user) };
};
