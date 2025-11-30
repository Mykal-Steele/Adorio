import jwt from 'jsonwebtoken';
import { environment } from '../config/environment.js';
import ApiError from '../utils/ApiError.js';

const extractToken = (authHeader = '') =>
  authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(ApiError.unauthorized());
  }

  try {
    const decoded = jwt.verify(extractToken(authHeader), environment.jwtSecret);
    req.user = { id: decoded.userId, isAdmin: decoded.isAdmin };
    next();
  } catch (error) {
    next(ApiError.forbidden('Token is not valid!'));
  }
};

const optional = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    try {
      const decoded = jwt.verify(
        extractToken(authHeader),
        environment.jwtSecret
      );
      req.user = { id: decoded.userId, isAdmin: decoded.isAdmin };
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Token verification failed, proceeding as guest', {
          message: error.message,
        });
      }
    }
  }

  next();
};

const admin = (req, _res, next) => {
  if (!req.user?.isAdmin) {
    return next(ApiError.forbidden('Not authorized as an admin'));
  }

  next();
};

const protect = verifyToken;

export default verifyToken;
export { verifyToken, protect, admin, optional };
