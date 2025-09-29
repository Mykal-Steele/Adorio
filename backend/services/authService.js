import jwt from 'jsonwebtoken';
import { environment } from '../config/environment.js';
import ApiError from '../utils/ApiError.js';

const signToken = (payload, secret, options) => {
  try {
    return jwt.sign(payload, secret, options);
  } catch (error) {
    throw new ApiError('Failed to sign token', 500, { cause: error.message });
  }
};

const createAuthTokens = (userId) => {
  if (!environment.jwtSecret) {
    throw new ApiError('JWT_SECRET is not configured', 500);
  }

  const token = signToken({ userId }, environment.jwtSecret, {
    expiresIn: '15m',
  });
  const refreshToken = signToken({ userId }, environment.refreshTokenSecret, {
    expiresIn: '7d',
  });

  return { token, refreshToken };
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, environment.refreshTokenSecret);
  } catch (error) {
    throw ApiError.unauthorized('Invalid refresh token');
  }
};

export { createAuthTokens, verifyRefreshToken };
