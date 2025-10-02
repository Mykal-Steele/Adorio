import mongoose from 'mongoose';
import Visit from '../models/Visit.js';

const sanitizePath = (value = '') => {
  const trimmed = value.trim();
  if (!trimmed.startsWith('/')) {
    return `/${trimmed}`;
  }
  return trimmed || '/';
};

const resolveLimit = (limit) => {
  const parsed = Number.parseInt(limit, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return 50;
  }
  return Math.min(parsed, 500);
};

// Generate readable visitor nicknames
const generateVisitorNickname = (visitorId, ipAddress) => {
  const adjectives = [
    'Awesome',
    'Cool',
    'Smart',
    'Happy',
    'Bright',
    'Swift',
    'Bold',
    'Calm',
    'Brave',
    'Kind',
  ];
  const nouns = [
    'Visitor',
    'User',
    'Guest',
    'Explorer',
    'Wanderer',
    'Browser',
    'Surfer',
    'Traveler',
    'Navigator',
    'Friend',
  ];

  // Use visitorId or IP to generate consistent nickname
  const seed = visitorId || ipAddress || 'anonymous';
  const hash = seed.split('').reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

  const adjIndex = Math.abs(hash) % adjectives.length;
  const nounIndex = Math.abs(hash >> 8) % nouns.length;
  const number = Math.abs(hash) % 1000;

  return `${adjectives[adjIndex]} ${nouns[nounIndex]} #${number}`;
};

const recordVisit = async (payload) => {
  const {
    visitorId,
    userId,
    sessionId,
    path,
    fullUrl,
    referrer,
    userAgent,
    ipAddress,
    locale,
    timezoneOffset,
    durationMs,
    metadata,
  } = payload;

  if (!visitorId) {
    throw new Error('Missing visitorId');
  }

  if (!path) {
    throw new Error('Missing path');
  }

  const visitPayload = {
    visitorId,
    sessionId,
    path: sanitizePath(path),
    fullUrl,
    referrer,
    userAgent,
    ipAddress,
    locale,
    timezoneOffset,
    durationMs,
    metadata,
  };

  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    visitPayload.userId = new mongoose.Types.ObjectId(userId);
  }

  return Visit.create(visitPayload);
};

const getPageViewStats = async ({
  start,
  end,
  path,
  limit,
  timezone = 'UTC',
}) => {
  const match = {};

  if (start || end) {
    match.createdAt = {};
    if (start) {
      match.createdAt.$gte = new Date(start);
    }
    if (end) {
      match.createdAt.$lte = new Date(end);
    }
  }

  if (path) {
    match.path = sanitizePath(path);
  }

  const pipeline = [
    Object.keys(match).length ? { $match: match } : null,
    {
      $group: {
        _id: '$path',
        totalVisits: { $sum: 1 },
        uniqueVisitors: { $addToSet: '$visitorId' },
        uniqueUsers: {
          $addToSet: {
            $cond: [{ $ifNull: ['$userId', false] }, '$userId', null],
          },
        },
        avgDuration: { $avg: '$durationMs' },
        lastVisitAt: { $max: '$createdAt' },
        firstVisitAt: { $min: '$createdAt' },
      },
    },
    {
      $addFields: {
        uniqueVisitors: {
          $size: {
            $filter: {
              input: '$uniqueVisitors',
              as: 'visitorId',
              cond: { $ne: ['$$visitorId', null] },
            },
          },
        },
        uniqueUsers: {
          $size: {
            $filter: {
              input: '$uniqueUsers',
              as: 'userId',
              cond: { $ne: ['$$userId', null] },
            },
          },
        },
      },
    },
    {
      $sort: {
        totalVisits: -1,
      },
    },
    {
      $limit: resolveLimit(limit),
    },
    {
      $project: {
        path: '$_id',
        _id: 0,
        totalVisits: 1,
        uniqueVisitors: 1,
        uniqueUsers: 1,
        avgDuration: 1,
        firstVisitAt: 1,
        lastVisitAt: 1,
        timezone,
      },
    },
  ].filter(Boolean);

  return Visit.aggregate(pipeline).allowDiskUse(true);
};

const getRecentVisits = async ({ limit, visitorId }) => {
  const query = {};
  if (visitorId) {
    query.visitorId = visitorId;
  }

  const visits = await Visit.find(query)
    .populate('userId', 'username email')
    .sort({ createdAt: -1 })
    .limit(resolveLimit(limit))
    .lean()
    .exec();

  // Add nicknames to visits
  return visits.map((visit) => ({
    ...visit,
    visitorNickname: generateVisitorNickname(visit.visitorId, visit.ipAddress),
    userDisplayName: visit.userId?.username || visit.userId?.email || null,
  }));
};

const getVisitorStats = async ({ limit = 50 } = {}) => {
  const pipeline = [
    {
      $group: {
        _id: '$visitorId',
        totalVisits: { $sum: 1 },
        lastVisit: { $max: '$createdAt' },
        firstVisit: { $min: '$createdAt' },
        totalDuration: { $sum: '$durationMs' },
        uniquePaths: { $addToSet: '$path' },
        ipAddresses: { $addToSet: '$ipAddress' },
        userIds: { $addToSet: '$userId' },
        lastUserAgent: { $last: '$userAgent' },
        lastLocale: { $last: '$locale' },
      },
    },
    {
      $addFields: {
        uniquePathsCount: { $size: '$uniquePaths' },
        avgDuration: { $divide: ['$totalDuration', '$totalVisits'] },
        ipAddress: { $arrayElemAt: ['$ipAddresses', 0] },
        userId: {
          $arrayElemAt: [
            { $filter: { input: '$userIds', cond: { $ne: ['$$this', null] } } },
            0,
          ],
        },
      },
    },
    {
      $sort: { totalVisits: -1 },
    },
    {
      $limit: resolveLimit(limit),
    },
  ];

  const visitors = await Visit.aggregate(pipeline).allowDiskUse(true);

  // Add nicknames and populate user data
  const visitorIds = visitors.filter((v) => v.userId).map((v) => v.userId);
  const users = await mongoose
    .model('User')
    .find({ _id: { $in: visitorIds } }, 'username email')
    .lean();
  const userMap = users.reduce((acc, user) => {
    acc[user._id.toString()] = user;
    return acc;
  }, {});

  return visitors.map((visitor) => ({
    ...visitor,
    visitorNickname: generateVisitorNickname(visitor._id, visitor.ipAddress),
    userDisplayName: visitor.userId
      ? userMap[visitor.userId.toString()]?.username ||
        userMap[visitor.userId.toString()]?.email
      : null,
  }));
};

export { recordVisit, getPageViewStats, getRecentVisits, getVisitorStats };
