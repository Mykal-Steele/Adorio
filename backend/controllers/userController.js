import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import {
  createUserAccount,
  findUserById,
  authenticateUser,
  sanitizeUser,
  deleteUserAccount,
} from '../services/userService.js';
import { createAuthTokens, verifyRefreshToken } from '../services/authService.js';

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await findUserById(req.user.id);
  res.status(200).json(user);
});

const registerUser = asyncHandler(async (req, res) => {
  const sanitizedUser = await createUserAccount(req.body);
  const { token, refreshToken } = createAuthTokens(sanitizedUser._id, sanitizedUser.isAdmin);
  res.status(201).json({ user: sanitizedUser, token, refreshToken });
});

const loginUser = asyncHandler(async (req, res) => {
  const { user, sanitizedUser } = await authenticateUser(req.body);
  const { token, refreshToken } = createAuthTokens(user._id, user.isAdmin);
  res.status(200).json({ user: sanitizedUser, token, refreshToken });
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  if (!token) throw ApiError.unauthorized('Refresh token required');

  const decoded = verifyRefreshToken(token);
  const userDocument = await findUserById(decoded.userId);
  const sanitizedUser = sanitizeUser(userDocument);
  const { token: newToken } = createAuthTokens(sanitizedUser._id, userDocument.isAdmin);

  res.status(200).json({ token: newToken });
});

const deleteUserHandler = asyncHandler(async (req, res) => {
  await deleteUserAccount(req.user.id);
  res.status(204).send();
});

export { getCurrentUser, registerUser, loginUser, refreshToken, deleteUserHandler };
