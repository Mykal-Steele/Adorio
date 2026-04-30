import jwt from 'jsonwebtoken';
import { environment } from '../config/environment.js';
import ApiError from '../utils/ApiError.js';

const signToken = (payload, secret, options) => {
  try {
    return jwt.sign(payload, secret, options);
  } catch {
    throw ApiError.internalServerError('Failed to sign token');
  }
};

export const createAuthTokens = (userId, isAdmin = false) => {
  if (!environment.jwtSecret) {
    throw ApiError.internalServerError('JWT_SECRET is not configured');
  }

  const token = signToken({ userId, isAdmin }, environment.jwtSecret, { expiresIn: '15m' });
  const refreshToken = signToken({ userId }, environment.refreshTokenSecret, { expiresIn: '7d' });

  return { token, refreshToken };
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, environment.refreshTokenSecret);
  } catch {
    throw ApiError.unauthorized('Invalid refresh token');
  }
};
