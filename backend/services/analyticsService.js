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

  return Visit.find(query)
    .sort({ createdAt: -1 })
    .limit(resolveLimit(limit))
    .lean()
    .exec();
};

export { recordVisit, getPageViewStats, getRecentVisits };
