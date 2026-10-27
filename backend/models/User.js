import mongoose from 'mongoose';
import userSchema from '../schemas/db/userSchema.js';

export const User = mongoose.model('User', userSchema);

export const findUserById = (id, { includePassword = false } = {}) =>
  includePassword ? User.findById(id) : User.findById(id).select('-password');

export const findUserByEmail = (email) => User.findOne({ email: { $eq: email } });

export const findUserByEmailOrUsername = (email, username) =>
  User.findOne({ $or: [{ email: { $eq: email } }, { username: { $eq: username } }] });

export const createUser = (data) => User.create(data);

export const findUsersWithScore = ({ playedSince, limit = 100 } = {}) => {
  const query = { 'rhythmGame.peakPLevel': { $gt: 0 } };
  if (playedSince) query['rhythmGame.lastPlayed'] = { $gte: playedSince };
  return User.find(
    query,
    'username rhythmGame.peakPLevel rhythmGame.difficulty rhythmGame.lastPlayed',
  )
    .sort({ 'rhythmGame.peakPLevel': -1 })
    .limit(limit)
    .lean();
};

export const updateUserRhythm = (userId, rhythmData) => {
  const updates = Object.fromEntries(
    Object.entries(rhythmData)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [`rhythmGame.${key}`, value]),
  );
  return User.findByIdAndUpdate(userId, { $set: updates }, { new: true });
};

export const deleteUserById = (id) => User.findByIdAndDelete(id);

// Test and QA accounts only: timestamp-suffixed usernames or @integration.test
// emails, never admins. The janitor uses this to clear test data. Scores live
// inside User docs, so a TTL index would delete the user itself.
const TEST_USERNAME_PATTERN = /^(qatest_|testuser_|other_|user_)\d+$/;

export const deleteStaleTestUsers = ({ createdBefore }) =>
  User.deleteMany({
    isAdmin: { $ne: true },
    createdAt: { $lt: createdBefore },
    $or: [{ username: TEST_USERNAME_PATTERN }, { email: /@integration\.test$/ }],
  });

export const findUsersByIds = (ids) =>
  User.find({ _id: { $in: ids } }, 'username email displayName').lean();

export const searchUsersByUsernamePrefix = (query, limit = 8) => {
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // anchored prefix scan on the username index, stops after `limit` matches
  return User.find({ username: { $regex: `^${escaped}`, $options: 'i' } }, 'username')
    .sort({ username: 1 })
    .limit(limit)
    .maxTimeMS(2000)
    .lean();
};
