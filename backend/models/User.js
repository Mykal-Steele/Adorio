import mongoose from 'mongoose';
import userSchema from '../schemas/db/userSchema.js';

export const User = mongoose.model('User', userSchema);

export const findUserById = (id, { includePassword = false } = {}) =>
  includePassword ? User.findById(id) : User.findById(id).select('-password');

export const findUserByEmail = (email) => User.findOne({ email: { $eq: email } });

export const findUserByEmailOrUsername = (email, username) =>
  User.findOne({ $or: [{ email: { $eq: email } }, { username: { $eq: username } }] });

export const createUser = (data) => User.create(data);

export const findUsersWithScore = ({ playedSince } = {}) => {
  const query = { 'rhythmGame.peakPLevel': { $gt: 0 } };
  if (playedSince) query['rhythmGame.lastPlayed'] = { $gte: playedSince };
  return User.find(query, 'username rhythmGame').sort({ 'rhythmGame.peakPLevel': -1 }).lean();
};

export const updateUserRhythm = (userId, rhythmData) =>
  User.findByIdAndUpdate(userId, { rhythmGame: rhythmData }, { new: true });

export const deleteUserById = (id) => User.findByIdAndDelete(id);

// Integration-test and QA accounts only: timestamp-suffixed usernames or
// @integration.test emails. Admins are never matched. Used by the janitor to
// expire test data — scores are embedded in User docs so a Mongo TTL index
// would delete the user itself; this targeted delete is the safe equivalent.
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
  // Anchored (^) prefix scan over the unique username index: bounded work,
  // stops after `limit` matches. Projection + lean keep the payload minimal.
  return User.find({ username: { $regex: `^${escaped}`, $options: 'i' } }, 'username')
    .sort({ username: 1 })
    .limit(limit)
    .maxTimeMS(2000)
    .lean();
};
