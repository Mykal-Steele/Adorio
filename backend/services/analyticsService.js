import mongoose from 'mongoose';
import ApiError from '../utils/ApiError.js';
import validate from '../utils/validate.js';
import {
  pageViewsQuerySchema,
  recentVisitsQuerySchema,
  visitorStatsQuerySchema,
} from '../schemas/index.js';
import { uniqueNamesGenerator, adjectives, names } from 'unique-names-generator';
import {
  createVisit,
  aggregateVisits,
  findRecentVisits,
  findVisitsByVisitorId,
  findUsersByIds,
} from '../models/index.js';

const sanitizePath = (value = '') => {
  const trimmed = value.trim();
  return trimmed.startsWith('/') ? trimmed || '/' : `/${trimmed}`;
};

const resolveLimit = (limit) => {
  const parsed = Number.parseInt(limit, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return 50;
  return Math.min(parsed, 500);
};

const formatIpForDisplay = (ip) => {
  if (!ip) return 'Unknown';
  if (ip === '127.0.0.1' || ip === '::1') {
    return process.env.NODE_ENV === 'development' ? 'localhost (dev)' : 'localhost';
  }
  if (ip.includes(':')) return ip.length > 20 ? `${ip.substring(0, 15)}...` : ip;
  if (
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    (ip.startsWith('172.') && parseInt(ip.split('.')[1]) >= 16 && parseInt(ip.split('.')[1]) <= 31)
  ) {
    return process.env.NODE_ENV === 'development' ? `${ip} (local network)` : `${ip} (private)`;
  }
  if (ip === 'unknown') return 'IP unavailable';
  return ip;
};

const getIpContext = (ip) => {
  if (!ip) return 'unknown';
  if (ip === '127.0.0.1' || ip === '::1') return 'loopback';
  if (
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    (ip.startsWith('172.') && parseInt(ip.split('.')[1]) >= 16 && parseInt(ip.split('.')[1]) <= 31)
  )
    return 'private';
  if (ip.includes(':')) return 'ipv6';
  if (/^\d+\.\d+\.\d+\.\d+$/.test(ip)) return 'ipv4';
  return 'other';
};

const resolveVisitorSeed = (visitorId, ipAddress, fingerprint) =>
  fingerprint || `${ipAddress || 'unknown'}-${visitorId || 'anonymous'}`;

const createPersonIdentityKey = (visitorId, ipAddress, userData = null, fingerprint = null) => {
  if (userData?.username) return `user:${userData.username}`;
  const name = uniqueNamesGenerator({
    dictionaries: [adjectives, names],
    seed: resolveVisitorSeed(visitorId, ipAddress, fingerprint),
    length: 2,
    separator: '_',
    style: 'capital',
  });
  return `guest:${name}`;
};

const generateVisitorNickname = (visitorId, ipAddress, userData = null, fingerprint = null) => {
  if (userData?.username) return userData.username;
  return uniqueNamesGenerator({
    dictionaries: [adjectives, names],
    seed: resolveVisitorSeed(visitorId, ipAddress, fingerprint),
    length: 2,
    separator: ' ',
    style: 'capital',
  });
};

export const recordVisit = async (payload) => {
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
    fingerprint,
    fingerprintData,
  } = payload;

  if (!visitorId) throw ApiError.badRequest('Missing visitorId');
  if (!path) throw ApiError.badRequest('Missing path');

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
    fingerprint,
    screenFingerprint: fingerprintData?.screen,
    browserFingerprint: fingerprintData?.browser,
    networkFingerprint: fingerprintData?.network,
  };

  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    visitPayload.userId = new mongoose.Types.ObjectId(userId);
  }

  return createVisit(visitPayload);
};

export const getPageViewStats = async (rawQuery) => {
  const { start, end, path, limit, timezone = 'UTC' } = validate(pageViewsQuerySchema, rawQuery);

  const match = {};
  if (start || end) {
    match.createdAt = {};
    if (start) match.createdAt.$gte = new Date(start);
    if (end) match.createdAt.$lte = new Date(end);
  }
  if (path) match.path = sanitizePath(path);

  const pipeline = [
    Object.keys(match).length ? { $match: match } : null,
    {
      $group: {
        _id: '$path',
        totalVisits: { $sum: 1 },
        uniqueVisitors: { $addToSet: '$visitorId' },
        uniqueUsers: {
          $addToSet: { $cond: [{ $ifNull: ['$userId', false] }, '$userId', null] },
        },
        avgDuration: { $avg: '$durationMs' },
        lastVisitAt: { $max: '$createdAt' },
        firstVisitAt: { $min: '$createdAt' },
      },
    },
    {
      $addFields: {
        uniqueVisitors: {
          $size: { $filter: { input: '$uniqueVisitors', as: 'v', cond: { $ne: ['$$v', null] } } },
        },
        uniqueUsers: {
          $size: { $filter: { input: '$uniqueUsers', as: 'u', cond: { $ne: ['$$u', null] } } },
        },
      },
    },
    { $sort: { totalVisits: -1 } },
    { $limit: resolveLimit(limit) },
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

  return aggregateVisits(pipeline);
};

export const getRecentVisits = async (rawQuery) => {
  const { limit, visitorId } = validate(recentVisitsQuerySchema, rawQuery);

  const query = visitorId ? { visitorId } : {};
  const visits = await findRecentVisits({ query, limit: resolveLimit(limit) });

  const personIdentityMap = new Map();

  return visits.map((visit) => {
    const user = visit.userId;
    const identityKey = createPersonIdentityKey(
      visit.visitorId,
      visit.ipAddress,
      user,
      visit.fingerprint,
    );

    let nickname;
    if (personIdentityMap.has(identityKey)) {
      nickname = personIdentityMap.get(identityKey);
    } else {
      nickname = generateVisitorNickname(visit.visitorId, visit.ipAddress, user, visit.fingerprint);
      personIdentityMap.set(identityKey, nickname);
    }

    let formattedReferrer = '—';
    if (visit.referrer) {
      try {
        const referrerUrl = new URL(visit.referrer);
        if (referrerUrl.origin === new URL(visit.fullUrl || 'http://localhost').origin) {
          formattedReferrer = `from ${referrerUrl.pathname}`;
        } else {
          formattedReferrer = `from ${referrerUrl.hostname}`;
        }
      } catch {
        formattedReferrer =
          visit.referrer.length > 30 ? `${visit.referrer.substring(0, 30)}...` : visit.referrer;
      }
    }

    const visitTime = new Date(visit.createdAt);
    const formattedTime = visitTime.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    return {
      ...visit,
      visitorNickname: nickname,
      userDisplayName: user?.username || user?.email || null,
      personIdentity: identityKey,
      formattedReferrer,
      formattedTime,
    };
  });
};

export const getVisitorStats = async (rawQuery = {}) => {
  const { limit, deduplicate } = validate(visitorStatsQuerySchema, rawQuery);
  const shouldDeduplicate = deduplicate !== 'false';

  try {
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
          fingerprints: { $addToSet: '$fingerprint' },
          screenFingerprints: { $addToSet: '$screenFingerprint' },
          browserFingerprints: { $addToSet: '$browserFingerprint' },
          networkFingerprints: { $addToSet: '$networkFingerprint' },
          lastUserAgent: { $last: '$userAgent' },
          lastLocale: { $last: '$locale' },
        },
      },
      {
        $addFields: {
          avgDuration: { $divide: ['$totalDuration', '$totalVisits'] },
          mostRecentIp: { $arrayElemAt: ['$ipAddresses', -1] },
          userId: {
            $arrayElemAt: [{ $filter: { input: '$userIds', cond: { $ne: ['$$this', null] } } }, 0],
          },
          latestFingerprint: { $arrayElemAt: ['$fingerprints', -1] },
          latestScreenFingerprint: { $arrayElemAt: ['$screenFingerprints', -1] },
          latestBrowserFingerprint: { $arrayElemAt: ['$browserFingerprints', -1] },
          latestNetworkFingerprint: { $arrayElemAt: ['$networkFingerprints', -1] },
        },
      },
      { $sort: { totalVisits: -1 } },
      { $limit: resolveLimit(limit) * 2 },
    ];

    const visitors = await aggregateVisits(pipeline);

    const visitorIds = visitors.filter((v) => v.userId).map((v) => v.userId);
    const users = await findUsersByIds(visitorIds);
    const userMap = users.reduce((acc, user) => {
      acc[user._id.toString()] = user;
      return acc;
    }, {});

    const personGroups = new Map();
    visitors.forEach((visitor) => {
      const user = visitor.userId ? userMap[visitor.userId.toString()] : null;
      const identityKey = createPersonIdentityKey(
        visitor._id,
        visitor.mostRecentIp,
        user,
        visitor.latestFingerprint,
      );
      if (!personGroups.has(identityKey)) personGroups.set(identityKey, []);
      personGroups.get(identityKey).push({ visitorId: visitor._id, user, visitor, identityKey });
    });

    const processedVisitors = Array.from(personGroups.entries()).map(
      ([identityKey, visitorRecords]) => {
        const combinedStats = visitorRecords.reduce(
          (acc, { visitor, user }) => {
            acc.totalVisits += visitor.totalVisits;
            acc.totalDuration += visitor.totalDuration;
            acc.visitCount += visitor.totalVisits;
            acc.visitorIds.push(visitor._id);
            if (!acc.firstVisit || visitor.firstVisit < acc.firstVisit)
              acc.firstVisit = visitor.firstVisit;
            if (!acc.lastVisit || visitor.lastVisit > acc.lastVisit) {
              acc.lastVisit = visitor.lastVisit;
              acc.mostRecentIp = visitor.mostRecentIp;
              acc.latestUser = user;
            }
            return acc;
          },
          {
            totalVisits: 0,
            totalDuration: 0,
            visitCount: 0,
            visitorIds: [],
            firstVisit: null,
            lastVisit: null,
            mostRecentIp: null,
            latestUser: null,
          },
        );

        const primaryRecord =
          visitorRecords.find((r) => r.visitor.lastVisit === combinedStats.lastVisit) ||
          visitorRecords[0];
        const nickname = generateVisitorNickname(
          primaryRecord.visitorId,
          combinedStats.mostRecentIp,
          combinedStats.latestUser,
          primaryRecord.visitor.latestFingerprint,
        );

        return {
          personIdentity: identityKey,
          visitorId: primaryRecord.visitorId,
          allVisitorIds: combinedStats.visitorIds,
          nickname,
          totalVisits: combinedStats.totalVisits,
          avgDuration:
            combinedStats.visitCount > 0
              ? combinedStats.totalDuration / combinedStats.visitCount
              : 0,
          firstVisit: combinedStats.firstVisit,
          lastVisit: combinedStats.lastVisit,
          mostRecentIp: formatIpForDisplay(combinedStats.mostRecentIp),
          rawMostRecentIp: combinedStats.mostRecentIp,
          isUser: !!combinedStats.latestUser,
          user: combinedStats.latestUser
            ? {
                username: combinedStats.latestUser.username,
                email: combinedStats.latestUser.email,
                displayName: combinedStats.latestUser.displayName,
              }
            : null,
          isCombined: visitorRecords.length > 1,
          combinedFromCount: visitorRecords.length,
        };
      },
    );

    return processedVisitors
      .sort((a, b) => b.totalVisits - a.totalVisits)
      .slice(0, resolveLimit(limit));
  } catch (error) {
    console.error('Error in getVisitorStats:', error);
    return [];
  }
};

export const getVisitorDetails = async (visitorId) => {
  if (!visitorId) throw ApiError.badRequest('Missing visitorId');

  try {
    const visits = await findVisitsByVisitorId(visitorId);
    if (visits.length === 0) return null;

    const user = visits[0].userId;
    const latestVisit = visits[0];
    const nickname = generateVisitorNickname(
      visitorId,
      latestVisit.ipAddress,
      user,
      latestVisit.fingerprint,
    );

    const totalVisits = visits.length;
    const totalDuration = visits.reduce((sum, v) => sum + (v.durationMs || 0), 0);
    const avgDuration = totalVisits > 0 ? totalDuration / totalVisits : 0;
    const uniquePaths = [...new Set(visits.map((v) => v.path))];
    const ipAddresses = [...new Set(visits.map((v) => v.ipAddress).filter(Boolean))];
    const userAgents = [...new Set(visits.map((v) => v.userAgent).filter(Boolean))];
    const locales = [...new Set(visits.map((v) => v.locale).filter(Boolean))];

    const visitHistory = visits.map((visit) => {
      let formattedReferrer = '—';
      if (visit.referrer) {
        try {
          const referrerUrl = new URL(visit.referrer);
          if (referrerUrl.origin === new URL(visit.fullUrl || 'http://localhost').origin) {
            formattedReferrer = `from ${referrerUrl.pathname}`;
          } else {
            formattedReferrer = `from ${referrerUrl.hostname}`;
          }
        } catch {
          formattedReferrer =
            visit.referrer.length > 30 ? `${visit.referrer.substring(0, 30)}...` : visit.referrer;
        }
      }

      const visitTime = new Date(visit.createdAt);
      return {
        path: visit.path,
        fullUrl: visit.fullUrl,
        formattedReferrer,
        formattedTime: visitTime.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        formattedDate: visitTime.toLocaleDateString('en-US'),
        durationMs: visit.durationMs,
        createdAt: visit.createdAt,
        sessionId: visit.sessionId,
      };
    });

    return {
      visitorId,
      nickname,
      personIdentity: createPersonIdentityKey(
        visitorId,
        latestVisit.ipAddress,
        user,
        latestVisit.fingerprint,
      ),
      isUser: !!user,
      user: user
        ? { username: user.username, email: user.email, displayName: user.displayName }
        : null,
      totalVisits,
      avgDuration,
      totalDuration,
      firstVisit: visits[visits.length - 1].createdAt,
      lastVisit: latestVisit.createdAt,
      uniquePaths: uniquePaths.sort(),
      pathCount: uniquePaths.length,
      ipAddresses: ipAddresses.map(formatIpForDisplay),
      rawIpAddresses: ipAddresses,
      ipContexts: ipAddresses.map(getIpContext),
      userAgents: userAgents.slice(0, 3),
      locales,
      fingerprint: latestVisit.fingerprint,
      screenInfo: latestVisit.screenFingerprint,
      browserInfo: latestVisit.browserFingerprint,
      networkInfo: latestVisit.networkFingerprint,
      visitHistory,
    };
  } catch (error) {
    console.error('Error in getVisitorDetails:', error);
    throw error;
  }
};
