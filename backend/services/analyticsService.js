import mongoose from 'mongoose';
import Visit from '../models/Visit.js';
import { createVisitorFingerprint } from '../utils/fingerprinting.js';
import {
  deduplicateVisitors,
  createFingerprintHash,
  isSameVisitor,
} from '../utils/visitorMatching.js';
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
  names,
} from 'unique-names-generator';

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

// Format IP address for better display
const formatIpForDisplay = (ip) => {
  if (!ip) return 'Unknown';

  // Handle localhost addresses
  if (ip === '127.0.0.1' || ip === '::1') {
    return process.env.NODE_ENV === 'development'
      ? 'localhost (dev)'
      : 'localhost';
  }

  // Handle IPv6 addresses
  if (ip.includes(':')) {
    // Compress IPv6 if it's too long
    if (ip.length > 20) {
      return `${ip.substring(0, 15)}...`;
    }
    return ip;
  }

  // Handle private IP ranges for better context
  if (
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    (ip.startsWith('172.') &&
      parseInt(ip.split('.')[1]) >= 16 &&
      parseInt(ip.split('.')[1]) <= 31)
  ) {
    return process.env.NODE_ENV === 'development'
      ? `${ip} (local network)`
      : `${ip} (private)`;
  }

  // Handle unknown/placeholder IPs
  if (ip === 'unknown') {
    return 'IP unavailable';
  }

  return ip;
};

// Additional utility to get IP context for debugging
const getIpContext = (ip) => {
  if (!ip) return 'unknown';

  if (ip === '127.0.0.1' || ip === '::1') return 'loopback';
  if (
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    (ip.startsWith('172.') &&
      parseInt(ip.split('.')[1]) >= 16 &&
      parseInt(ip.split('.')[1]) <= 31)
  ) {
    return 'private';
  }
  if (ip.includes(':')) return 'ipv6';
  if (/^\d+\.\d+\.\d+\.\d+$/.test(ip)) return 'ipv4';

  return 'other';
};

// Create a consistent identity key for the same person across different visitor IDs
const createPersonIdentityKey = (
  visitorId,
  ipAddress,
  userData = null,
  fingerprint = null
) => {
  // If it's a logged-in user, use their username as identity
  if (userData?.username) {
    return `user:${userData.username}`;
  }

  // Use a combination of factors to identify the same person
  // Priority: fingerprint > IP + visitorId combination
  let seed;
  if (fingerprint) {
    // Use fingerprint as primary identifier for same person
    seed = fingerprint;
  } else {
    // Fallback to IP + visitorId combination
    seed = `${ipAddress || 'unknown'}-${visitorId || 'anonymous'}`;
  }

  // Generate a consistent two-word name using the same seed
  const name = uniqueNamesGenerator({
    dictionaries: [adjectives, names],
    seed: seed,
    length: 2,
    separator: '_',
    style: 'capital',
  });

  return `guest:${name}`;
};

// Generate fun real first and last names (consistent with identity key)
const generateVisitorNickname = (
  visitorId,
  ipAddress,
  userData = null,
  fingerprint = null
) => {
  // If it's a logged-in user, use their username
  if (userData?.username) {
    return userData.username;
  }

  // Use the same seed logic as createPersonIdentityKey for consistency
  let seed;
  if (fingerprint) {
    // Use fingerprint as primary identifier for same person
    seed = fingerprint;
  } else {
    // Fallback to IP + visitorId combination
    seed = `${ipAddress || 'unknown'}-${visitorId || 'anonymous'}`;
  }

  // Generate a consistent two-word name using the same seed as identity key
  const name = uniqueNamesGenerator({
    dictionaries: [adjectives, names],
    seed: seed,
    length: 2,
    separator: ' ',
    style: 'capital',
  });

  return name;
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
    fingerprint,
    fingerprintData,
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
    fingerprint,
    screenFingerprint: fingerprintData?.screen,
    browserFingerprint: fingerprintData?.browser,
    networkFingerprint: fingerprintData?.network,
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
    .populate('userId', 'username email displayName')
    .sort({ createdAt: -1 })
    .limit(resolveLimit(limit))
    .lean()
    .exec();

  // Create a map to ensure consistent naming for the same person
  const personIdentityMap = new Map();

  // Add nicknames to visits with consistent naming
  return visits.map((visit) => {
    const user = visit.userId;
    const identityKey = createPersonIdentityKey(
      visit.visitorId,
      visit.ipAddress,
      user,
      visit.fingerprint
    );

    // Get or create consistent nickname for this person
    let nickname;
    if (personIdentityMap.has(identityKey)) {
      nickname = personIdentityMap.get(identityKey);
    } else {
      nickname = generateVisitorNickname(
        visit.visitorId,
        visit.ipAddress,
        user,
        visit.fingerprint
      );
      personIdentityMap.set(identityKey, nickname);
    }

    // Format referrer for better UX
    let formattedReferrer = '—'; // Use em dash for no referrer
    if (visit.referrer) {
      try {
        const referrerUrl = new URL(visit.referrer);
        // If it's from the same site, show as "from /path"
        if (
          referrerUrl.origin ===
          new URL(visit.fullUrl || 'http://localhost').origin
        ) {
          formattedReferrer = `from ${referrerUrl.pathname}`;
        } else {
          // External referrer - show domain
          formattedReferrer = `from ${referrerUrl.hostname}`;
        }
      } catch {
        // Invalid URL, show as-is but truncated
        formattedReferrer =
          visit.referrer.length > 30
            ? `${visit.referrer.substring(0, 30)}...`
            : visit.referrer;
      }
    }

    // Format time as HH:MM:SS
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
      personIdentity: identityKey, // For debugging/tracking
      formattedReferrer,
      formattedTime,
    };
  });
};

const getVisitorStats = async ({ limit = 50, deduplicate = true } = {}) => {
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
            $arrayElemAt: [
              {
                $filter: { input: '$userIds', cond: { $ne: ['$$this', null] } },
              },
              0,
            ],
          },
          // Get the most recent fingerprint data
          latestFingerprint: { $arrayElemAt: ['$fingerprints', -1] },
          latestScreenFingerprint: {
            $arrayElemAt: ['$screenFingerprints', -1],
          },
          latestBrowserFingerprint: {
            $arrayElemAt: ['$browserFingerprints', -1],
          },
          latestNetworkFingerprint: {
            $arrayElemAt: ['$networkFingerprints', -1],
          },
        },
      },
      {
        $sort: { totalVisits: -1 },
      },
      {
        $limit: resolveLimit(limit) * 2, // Get more initially for deduplication
      },
    ];

    const visitors = await Visit.aggregate(pipeline).allowDiskUse(true);

    // Add nicknames and populate user data
    const visitorIds = visitors.filter((v) => v.userId).map((v) => v.userId);
    const users = await mongoose
      .model('User')
      .find({ _id: { $in: visitorIds } }, 'username email displayName')
      .lean();
    const userMap = users.reduce((acc, user) => {
      acc[user._id.toString()] = user;
      return acc;
    }, {});

    // First, process all visitors and group by person identity
    const personGroups = new Map();

    visitors.forEach((visitor) => {
      const user = visitor.userId ? userMap[visitor.userId.toString()] : null;
      const visitorId = visitor._id;
      const identityKey = createPersonIdentityKey(
        visitorId,
        visitor.mostRecentIp,
        user,
        visitor.latestFingerprint
      );

      if (!personGroups.has(identityKey)) {
        personGroups.set(identityKey, []);
      }

      personGroups.get(identityKey).push({
        visitorId,
        user,
        visitor,
        identityKey,
      });
    });

    // Now combine stats for each person identity
    let processedVisitors = Array.from(personGroups.entries()).map(
      ([identityKey, visitorRecords]) => {
        // Combine all stats for this person
        const combinedStats = visitorRecords.reduce(
          (acc, { visitor, user }) => {
            acc.totalVisits += visitor.totalVisits;
            acc.totalDuration += visitor.totalDuration;
            acc.visitCount += visitor.totalVisits; // For calculating average

            // Track all visitor IDs for this person
            acc.visitorIds.push(visitor._id);

            // Use the most recent visit times
            if (!acc.firstVisit || visitor.firstVisit < acc.firstVisit) {
              acc.firstVisit = visitor.firstVisit;
            }
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
          }
        );

        // Get the representative visitor record (most recent)
        const primaryRecord =
          visitorRecords.find(
            (r) => r.visitor.lastVisit === combinedStats.lastVisit
          ) || visitorRecords[0];
        const nickname = generateVisitorNickname(
          primaryRecord.visitorId,
          combinedStats.mostRecentIp,
          combinedStats.latestUser,
          primaryRecord.visitor.latestFingerprint
        );

        return {
          personIdentity: identityKey,
          visitorId: primaryRecord.visitorId, // Primary visitor ID
          allVisitorIds: combinedStats.visitorIds, // All visitor IDs for this person
          nickname: nickname,
          totalVisits: combinedStats.totalVisits,
          avgDuration:
            combinedStats.visitCount > 0
              ? combinedStats.totalDuration / combinedStats.visitCount
              : 0,
          firstVisit: combinedStats.firstVisit,
          lastVisit: combinedStats.lastVisit,
          mostRecentIp: formatIpForDisplay(combinedStats.mostRecentIp),
          rawMostRecentIp: combinedStats.mostRecentIp, // Keep raw IP for internal use
          isUser: !!combinedStats.latestUser,
          user: combinedStats.latestUser
            ? {
                username: combinedStats.latestUser.username,
                email: combinedStats.latestUser.email,
                displayName: combinedStats.latestUser.displayName,
              }
            : null,
          isCombined: visitorRecords.length > 1, // Flag to show this is combined data
          combinedFromCount: visitorRecords.length, // How many visitor records were combined
        };
      }
    );

    // Sort by total visits and limit results
    return processedVisitors
      .sort((a, b) => b.totalVisits - a.totalVisits)
      .slice(0, resolveLimit(limit));
  } catch (error) {
    console.error('Error in getVisitorStats:', error);
    // Return empty array on error to prevent breaking the application
    return [];
  }
};

const getVisitorDetails = async (visitorId) => {
  if (!visitorId) {
    throw new Error('Missing visitorId');
  }

  try {
    // Get all visits for this visitor
    const visits = await Visit.find({ visitorId })
      .populate('userId', 'username email displayName')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    if (visits.length === 0) {
      return null;
    }

    const user = visits[0].userId;
    const latestVisit = visits[0];

    // Generate consistent nickname
    const nickname = generateVisitorNickname(
      visitorId,
      latestVisit.ipAddress,
      user,
      latestVisit.fingerprint
    );

    // Calculate comprehensive stats
    const totalVisits = visits.length;
    const totalDuration = visits.reduce(
      (sum, v) => sum + (v.durationMs || 0),
      0
    );
    const avgDuration = totalVisits > 0 ? totalDuration / totalVisits : 0;
    const uniquePaths = [...new Set(visits.map((v) => v.path))];
    const ipAddresses = [
      ...new Set(visits.map((v) => v.ipAddress).filter(Boolean)),
    ];
    const userAgents = [
      ...new Set(visits.map((v) => v.userAgent).filter(Boolean)),
    ];
    const locales = [...new Set(visits.map((v) => v.locale).filter(Boolean))];

    // Format visit history with better UX
    const visitHistory = visits.map((visit) => {
      // Format referrer
      let formattedReferrer = '—';
      if (visit.referrer) {
        try {
          const referrerUrl = new URL(visit.referrer);
          if (
            referrerUrl.origin ===
            new URL(visit.fullUrl || 'http://localhost').origin
          ) {
            formattedReferrer = `from ${referrerUrl.pathname}`;
          } else {
            formattedReferrer = `from ${referrerUrl.hostname}`;
          }
        } catch {
          formattedReferrer =
            visit.referrer.length > 30
              ? `${visit.referrer.substring(0, 30)}...`
              : visit.referrer;
        }
      }

      // Format time
      const visitTime = new Date(visit.createdAt);
      const formattedTime = visitTime.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      const formattedDate = visitTime.toLocaleDateString('en-US');

      return {
        path: visit.path,
        fullUrl: visit.fullUrl,
        formattedReferrer,
        formattedTime,
        formattedDate,
        durationMs: visit.durationMs,
        createdAt: visit.createdAt,
        sessionId: visit.sessionId,
      };
    });

    // Browser and system information
    const fingerprint = latestVisit.fingerprint;
    const screenFingerprint = latestVisit.screenFingerprint;
    const browserFingerprint = latestVisit.browserFingerprint;
    const networkFingerprint = latestVisit.networkFingerprint;

    return {
      visitorId,
      nickname,
      personIdentity: createPersonIdentityKey(
        visitorId,
        latestVisit.ipAddress,
        user,
        fingerprint
      ),

      // User information
      isUser: !!user,
      user: user
        ? {
            username: user.username,
            email: user.email,
            displayName: user.displayName,
          }
        : null,

      // Visit statistics
      totalVisits,
      avgDuration,
      totalDuration,
      firstVisit: visits[visits.length - 1].createdAt,
      lastVisit: latestVisit.createdAt,

      // Unique data
      uniquePaths: uniquePaths.sort(),
      pathCount: uniquePaths.length,

      // Technical information
      ipAddresses: ipAddresses.map(formatIpForDisplay),
      rawIpAddresses: ipAddresses, // Keep raw IPs for internal use
      ipContexts: ipAddresses.map(getIpContext), // IP type context for debugging
      userAgents: userAgents.slice(0, 3), // Limit to prevent huge responses
      locales,

      // Fingerprint data (extensive info we know about them)
      fingerprint,
      screenInfo: screenFingerprint,
      browserInfo: browserFingerprint,
      networkInfo: networkFingerprint,

      // Complete visit history
      visitHistory,
    };
  } catch (error) {
    console.error('Error in getVisitorDetails:', error);
    throw error;
  }
};

export {
  recordVisit,
  getPageViewStats,
  getRecentVisits,
  getVisitorStats,
  getVisitorDetails,
};
