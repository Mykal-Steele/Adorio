import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';

const sanitizeUser = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
});

const ensureUniqueUser = async ({ email, username }) => {
  const existingUser = await User.findOne({
    $or: [{ email: { $eq: email } }, { username: { $eq: username } }],
  });

  if (existingUser) {
    const message =
      existingUser.email === email
        ? 'Email already exists'
        : 'Username already exists';
    throw ApiError.badRequest(message.toLowerCase());
  }
};

const createUserAccount = async ({ username, email, password }) => {
  if (!username || !email || !password) {
    throw ApiError.badRequest('All fields are required');
  }

  await ensureUniqueUser({ email, username });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email, password: hashedPassword });

  return sanitizeUser(user);
};

const findUserById = async (id, { includePassword = false } = {}) => {
  const query = includePassword
    ? User.findById(id)
    : User.findById(id).select('-password');
  const user = await query;

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return user;
};

const authenticateUser = async ({ email, password }) => {
  if (!email || !password) {
    throw ApiError.badRequest('Email and password are required');
  }

  const user = await User.findOne({ email: { $eq: email } });
  if (!user) {
    throw ApiError.badRequest('user not found');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw ApiError.badRequest('invalid credentials');
  }

  return { user, sanitizedUser: sanitizeUser(user) };
};

export { sanitizeUser, createUserAccount, findUserById, authenticateUser };
