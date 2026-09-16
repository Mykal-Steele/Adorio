import mongoose from 'mongoose';
import userSchema from '../schemas/db/userSchema.js';

export const User = mongoose.model('User', userSchema);

export const findUserById = (id, { includePassword = false } = {}) =>
  includePassword ? User.findById(id) : User.findById(id).select('-password');

export const findUserByEmail = (email) => User.findOne({ email: { $eq: email } });

export const findUserByEmailOrUsername = (email, username) =>
  User.findOne({ $or: [{ email: { $eq: email } }, { username: { $eq: username } }] });

export const createUser = (data) => User.create(data);

export const findUsersWithScore = () =>
  User.find({ 'rhythmGame.peakPLevel': { $gt: 0 } }, 'username rhythmGame')
    .sort({ 'rhythmGame.peakPLevel': -1 })
    .lean();

export const updateUserRhythm = (userId, rhythmData) =>
  User.findByIdAndUpdate(userId, { rhythmGame: rhythmData }, { new: true });

export const deleteUserById = (id) => User.findByIdAndDelete(id);

export const findUsersByIds = (ids) =>
  User.find({ _id: { $in: ids } }, 'username email displayName').lean();

export const searchUsersByUsernamePrefix = (query, limit = 8) => {
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Anchored (^) prefix scan over the unique username index: bounded work,
  // stops after `limit` matches. Projection + lean keep the payload minimal.
  return User.find({ username: { $regex: `^${escaped}`, $options: 'i' } }, 'username')
    .sort({ username: 1 })
    .limit(limit)
    .maxTimeMS(2000)
    .lean();
};
